const path = require('path');
const {	createAudioPlayer, createAudioResource, joinVoiceChannel, entersState, AudioPlayerStatus } = require('@discordjs/voice');
const state = require('../shared/state');
const ytdl = require('ytdl-core');

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
		if (this.validURL(audioFile)) {
			soundPath = ytdl(audioFile, {
				filter: 'audioonly',
			});
		}
		else {
			soundPath = path.resolve('./sounds/' + audioFile);
		}
		state.currentSong = soundPath;
		const resource = createAudioResource(soundPath, {
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
	skip: function(interaction) {
		this.player.pause();
		interaction.reply({ content: `${interaction.user.tag} has skipped ${state.currentSong}` });
		this.playSoundFile(interaction);
	},
	validURL: function(str) {
		const pattern = new RegExp('^(https?:\\/\\/)?' +
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
			'((\\d{1,3}\\.){3}\\d{1,3}))' +
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
			'(\\?[;&a-z\\d%_.~+=-]*)?' +
			'(\\#[-a-z\\d_]*)?$', 'i');
		return !!pattern.test(str);
	},
};

module.exports = Player;