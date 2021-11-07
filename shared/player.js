const path = require('path');
const {	createAudioPlayer, createAudioResource, joinVoiceChannel, entersState, AudioPlayerStatus } = require('@discordjs/voice');
const state = require('../shared/state');
const ytdl = require('ytdl-core');
const PlayerUtils = require('../shared/playerUtils');

let resource = null;

const Player = {
	playSoundFile: async function(interaction) {
		this.connection = joinVoiceChannel({
			channelId: interaction.member.voice.channel.id,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
		state.isPlaying = true;
		const player = createAudioPlayer();
		const audioFile = state.playlist.shift();
		let soundPath = null;
		if ((audioFile.indexOf('youtu') > 0) && PlayerUtils.validURL(audioFile)) {
			soundPath = ytdl(audioFile, {
				filter: 'audioonly',
			});
		}
		else if (PlayerUtils.validURL(audioFile)) {
			soundPath = audioFile;
		}
		else {
			soundPath = path.resolve('./sounds/' + audioFile);
		}
		state.currentSong = soundPath;
		resource = createAudioResource(soundPath, {
			inlineVolume: true,
			metadata:{
				title: 'title',
			},
		});
		resource.volume.setVolume(0.2);
		async function start() {
			player.play(resource);
			try {
				await entersState(player, AudioPlayerStatus.Playing, 5000);
				console.log('playback started');
			}
			catch (error) {
				console.log(error);
			}

		}
		void start();
		this.connection.subscribe(player);
		player.on('stateChange', (os, ns) => {console.log(`${os.status} -----> ${ns.status}`);});
		player.on(AudioPlayerStatus.Idle, () => {
			if (state.playlist.length === 0) {
				state.isPlaying = false;
				this.connection.destroy();
			}
			else {
				this.playSoundFile(interaction);
			}
		});
		this.player = player;
	},
	stop: function(interaction) {
		if (this.connection !== undefined) {
			state.isPlaying = false;
			this.connection.destroy();
			interaction.reply({ content: `${interaction.user.tag} has stopped Memeroni.` });
		}
	},
	fadeOut: async function(interaction) {
		if (this.connection !== undefined) {
			// console.log(resource.volume.volume);
			do {
				await PlayerUtils.wait(25);
				resource.volume.setVolume(resource.volume.volume * 0.9);
				// console.log(resource.volume.volume);
			} while (resource.volume.volume > 0.0001);

			state.isPlaying = false;
			this.connection.destroy();
			interaction.reply({ content: `${interaction.user.tag} has stopped Memeroni.` });


		}
	},
	resume: function(interaction) {
		interaction.reply({ content: `${interaction.user.tag} has resumed ${state.currentSong}` });
		this.playSoundFile(interaction);
	},
	skip: function(interaction) {
		this.player.pause();
		interaction.reply({ content: `${interaction.user.tag} has skipped ${state.currentSong}` });
		this.playSoundFile(interaction);
	},
};

module.exports = Player;
