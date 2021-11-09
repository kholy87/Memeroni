const path = require('path');
const {	createAudioPlayer, createAudioResource, joinVoiceChannel, entersState, AudioPlayerStatus } = require('@discordjs/voice');
const state = require('../shared/state');
const ytdl = require('ytdl-core');
const PlayerUtils = require('../shared/playerUtils');

const volume = 0.2;

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
		if (this.connection === undefined) this.startPlayer(interaction);
		state.isPlaying = true;
		this.player = createAudioPlayer();
		const audioFile = state.playlist.shift();
		let soundPath = null;
		let isMeme = false;

		if ((audioFile.indexOf('youtu') > 0) && PlayerUtils.validURL(audioFile)) {
			soundPath = ytdl(audioFile, {
				filter: 'audioonly',
			});
		}
		else if (PlayerUtils.validURL(audioFile)) {
			soundPath = ytdl(audioFile, {
				filter: 'audioonly',
			});
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
		if (isMeme) this.resource.volume.setVolume(volume * 2);
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
	},
	startPlayer: async function() {
		this.player.play(this.resource);
		try {
			await entersState(this.player, AudioPlayerStatus.Playing, 5000);
			await this.fade();
		}
		catch (error) {
			console.log(error);
		}

	},
	stop: async function(interaction) {
		console.log(this.connection);
		if (this.connection === undefined) {
			interaction.reply({ content: 'Nothing is playing', ephemeral: true });
			return;
		}
		interaction.deferReply({ content: `Stopping ${state.currentSong}`, ephemeral: true });
		await this.fade(false);
		state.isPlaying = false;
		this.connection.destroy();
		interaction.followUp({ content: `Stopped ${state.currentSong}`, ephemeral: true });
	},
	skip: function(interaction) {
		if (this.player === undefined) {
			interaction.reply({ content: 'Nothing is playing', ephemeral: true });
			return;
		}
		this.player.pause();
		interaction.reply({ content: `You've skipped ${state.currentSong}`, ephemeral: true });
		this.playSoundFile(interaction);
	},
	getSongInfo: async function(songUrl) {
		const songData = await ytdl.getInfo(songUrl);
		const songInfo = {
			title: songData.videoDetails.title,
			description: songData.videoDetails.shortDescription,
			url: songData.videoDetails.video_url,
			duration: songData.videoDetails.duration,
			thumbnail: songData.videoDetails.thumbnails[0].url,
		};
		return songInfo;
	},
	fade: async function(isFadeIn = true) {
		if (this.connection !== undefined) {
			if (isFadeIn) {
				do {
					await PlayerUtils.wait(25);
					this.resource.volume.setVolume(this.resource.volume.volume * 1.05);
					console.log(this.resource.volume.volume);
				} while (this.resource.volume.volume < volume);
			}
			else {
				do {
					await PlayerUtils.wait(25);
					this.resource.volume.setVolume(this.resource.volume.volume * 0.95);
					console.log(this.resource.volume.volume);
				} while (this.resource.volume.volume > 0.0001);
			}
		}
	},
	resume: async function(interaction) {
		if (state.playlist.length === 0) {
			interaction.reply({ content: 'There are no queue in the playlist currently. use /yt or /sd to add to the playlist.', ephemeral: true });
			return;
		}
		interaction.reply({ content: 'Resuming the music bot', ephemeral: true });
		this.playSoundFile(interaction, false);
	},
};

module.exports = Player;