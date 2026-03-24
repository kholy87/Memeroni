const fs = require('fs');
const path = require('path');
const {	createAudioPlayer, createAudioResource, joinVoiceChannel, entersState, AudioPlayerStatus } = require('@discordjs/voice');
const { MessageFlags } = require('discord.js');
const state = require('../shared/state');
const YTDlpWrap = require('yt-dlp-wrap').default;
const play = require('play-dl');
const PlayerUtils = require('../shared/playerUtils');

const volume = 0.2;
const ytdlpBinaryPath = path.resolve('./bin/yt-dlp.exe');
let ytdlp;

async function getYtDlp() {
	if (ytdlp) {
		return ytdlp;
	}

	if (!fs.existsSync(ytdlpBinaryPath)) {
		await YTDlpWrap.downloadFromGithub(ytdlpBinaryPath);
	}

	ytdlp = new YTDlpWrap(ytdlpBinaryPath);
	return ytdlp;
}

async function getYouTubeDirectAudioUrl(videoUrl) {
	const ytDlp = await getYtDlp();
	const output = await ytDlp.execPromise([
		'-f',
		'bestaudio[acodec=opus]/bestaudio',
		'--no-playlist',
		'--no-warnings',
		'-g',
		videoUrl,
	]);

	const directUrl = output.split(/\r?\n/).map(line => line.trim()).find(Boolean);
	if (!directUrl) {
		throw new Error('yt-dlp did not return a playable audio URL');
	}

	return directUrl;
}

const Player = {
	start: async function(interaction) {
		this.connection = joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
		this.playSoundFile(interaction, false);
	},
	playSoundFile: async function(interaction, isAlreadyPlaying = true) {
		try {
			if (this.connection === undefined) this.start(interaction);
			state.isPlaying = true;
			this.player = createAudioPlayer();
			const audioFile = state.playlist.shift();
			if (audioFile === undefined) {
				state.isPlaying = false;
				return;
			}
			let soundPath = null;
			let isMeme = false;
			// TODO: Fix if audio file is undefined.
			if (audioFile !== undefined && audioFile.readTime !== undefined && audioFile.readTime) {
				if ((Math.floor(Math.random() * 100)) > 95) {
					state.playlist.unshift('time/youthought.mp3');
					this.playSoundFile(interaction);
					return;
				}
				else {
					const today = new Date();
					const minute = today.getMinutes();
					const hour = (today.getHours() === 0 ? 12 : today.getHours());
					state.playlist.unshift('time/' + (today.getHours() > 11 ? 'pm' : 'am') + '.mp3');
					// state.playlist.unshift('time/seconds' + ((Math.floor(Math.random()*4)) + 1) +'.mp3');
					// state.playlist.unshift('time/' + (seconds < 10 ? '0' + seconds : seconds) + '.mp3');
					// state.playlist.unshift('time/and' + ((Math.floor(Math.random()*6)) + 1) +'.mp3');
					state.playlist.unshift('time/' + (minute < 10 ? '0' + minute : minute) + '.mp3');
					state.playlist.unshift('time/' + (hour > 12 ? hour - 12 : hour) + '.mp3');
					this.playSoundFile(interaction);
					return;
				}
			}
			else if ((audioFile !== undefined && audioFile.indexOf('youtu') > 0) && PlayerUtils.validURL(audioFile)) {
				const normalizedUrl = PlayerUtils.normalizeYouTubeUrl(audioFile);
				soundPath = await getYouTubeDirectAudioUrl(normalizedUrl);
			}
			else if (PlayerUtils.validURL(audioFile)) {
				soundPath = audioFile;
			}
			else {
				soundPath = path.resolve('./sounds/' + audioFile);
				isMeme = true;
			}
			state.currentSong = audioFile;
			this.resource = createAudioResource(soundPath, {
				inlineVolume: true,
				metadata:{
					title: 'title',
				},
			});

			if (!isAlreadyPlaying) this.resource.volume.setVolume(0.0001);
			if (isMeme) this.resource.volume.setVolume(volume * 3);
			if (!isMeme && isAlreadyPlaying) this.resource.volume.setVolume(volume);
			this.connection.subscribe(this.player);
			this.player.on('stateChange', (os, ns) => {console.log(`${os.status} -----> ${ns.status}`);});
			this.player.on(AudioPlayerStatus.Idle, () => {
				if (state.playlist.length === 0) {
					state.isPlaying = false;
					this.connection.destroy();
				}
				else {
					this.playSoundFile(interaction);
				}
			});
			this.startPlayer();
		}
		catch (e) {
			console.log(e);
			if (state.playlist.length > 0) {
				this.playSoundFile(interaction);
				return;
			}

			state.isPlaying = false;
			if (this.connection !== undefined) {
				this.connection.destroy();
				this.connection = undefined;
			}
		}
	},
	startPlayer: async function() {
		this.player.play(this.resource);
		try {
			await entersState(this.player, AudioPlayerStatus.Playing, 5000);
			await this.fade();
		}
		catch (error) {
			console.log('Error Starting Player', error);
		}
	},
	stop: async function(interaction) {
		if (this.connection === undefined) {
			interaction.reply({ content: 'Nothing is playing', flags: MessageFlags.Ephemeral });
			return;
		}
		interaction.deferReply({ flags: MessageFlags.Ephemeral });
		await this.fade(false);
		state.isPlaying = false;
		try {
			this.connection.destroy();
			this.connection = undefined;
		}
		catch (error) {
			console.log('Error while destroying this.connection', error);
		}
		interaction.followUp({ content: `Stopped ${state.currentSong}`, flags: MessageFlags.Ephemeral });
	},
	skip: function(interaction) {
		if (this.player === undefined) {
			interaction.reply({ content: 'Nothing is playing', flags: MessageFlags.Ephemeral });
			return;
		}
		this.player.pause();
		interaction.reply({ content: `You've skipped ${state.currentSong}`, flags: MessageFlags.Ephemeral });
		this.playSoundFile(interaction);
	},
	getSongInfo: async function(songUrl) {
		const normalizedUrl = PlayerUtils.normalizeYouTubeUrl(songUrl);
		const songData = await play.video_info(normalizedUrl);
		const songInfo = {
			title: songData.video_details.title,
			description: songData.video_details.description,
			url: songData.video_details.url,
			duration: songData.video_details.durationInSec,
			thumbnail: songData.video_details.thumbnails[0].url,
		};
		return songInfo;
	},
	fade: async function(isFadeIn = true) {
		if (this.connection !== undefined) {
			if (isFadeIn) {
				do {
					await PlayerUtils.wait(25);
					this.resource.volume.setVolume(this.resource.volume.volume * 1.05);
				} while (this.resource.volume.volume < volume);
			}
			else {
				do {
					await PlayerUtils.wait(25);
					this.resource.volume.setVolume(this.resource.volume.volume * 0.95);
				} while (this.resource.volume.volume > 0.0001);
			}
		}
	},
	resume: async function(interaction) {
		if (state.playlist.length === 0) {
			interaction.reply({ content: 'There are no queue in the playlist currently. use /yt or /sd to add to the playlist.', flags: MessageFlags.Ephemeral });
			return;
		}
		interaction.reply({ content: 'Resuming the music bot', flags: MessageFlags.Ephemeral });
		this.playSoundFile(interaction, false);
	},
	grandfatherClockFn: function() {
		// play files
		const today = new Date();
		console.log(today, today.getMinutes());
		if (today.getMinutes() === 0) {
			console.log('Grandfather TIME BABY');
			state.playlist.push({ grandfatherClock: true });
		}
	},
	playGrandfatherClock: async function() {
		this.connection = joinVoiceChannel({
			channelId: '784295420322775040',
			guildId: '170668549042339840',
		});
		console.log(state.client);
	},
};

module.exports = Player;