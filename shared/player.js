const path = require('path');
const {	createAudioPlayer, createAudioResource, joinVoiceChannel, entersState, AudioPlayerStatus } = require('@discordjs/voice');
const state = require('../shared/state');
const ytdl = require('ytdl-core');
const PlayerUtils = require('../shared/playerUtils');

let resource = null;

const Player = {
	playSoundFile: async function(interaction) {
		try {
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
			console.log({ soundPath });
			try {
				resource = createAudioResource(soundPath, {
					debug:true,
					inlineVolume: true,
					metadata:{
						title: 'title',
					},
				});
			}
			catch (e) {
				console.log('broke right here');
			}
			resource.volume.setVolume(0.2);

			await PlayerUtils.start(player, resource);
			this.connection.subscribe(player);
			player.on('stateChange', (os, ns) => {console.log(`${os.status} -----> ${ns.status}`);});


			player.on(AudioPlayerStatus.Idle, () => {
				if (state.playlist.length === 0) {
					state.isPlaying = false;
					this.connection.destroy();
				}
				else {
					try {
						console.log('next song');
						this.playSoundFile(interaction);
					}
					catch (e) {
						console.log('it broke:' + e);
					}
				}
			});
			this.player = player;
		}
		catch (e) {
			console.log('this one broake:' + e);
		}
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
