const {
	SlashCommandBuilder,
} = require('@discordjs/builders');
const {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
	entersState,
	AudioPlayerStatus,
} = require('@discordjs/voice');
const state = require('../shared/state');
const player = require('../shared/player');

module.exports = {


	data: new SlashCommandBuilder()
		.setName('jj')
		.setDescription('you know whats up')
	/* .addStringOption(option =>
        	option.setName('what')
        		.setDescription('The url to a youtube video')
        		.setRequired(false)
        		.addChoice('Play', 'Swifty')
        		.addChoice('Words', 'idontknow'),
        )*/
		.addSubcommand(subcommand =>
			subcommand
				.setName('ears')
				.setDescription('Feed your ears')
				.addStringOption(option =>
					option.setName('whom')
						.setDescription('What are you putting in your ears')
						.setRequired(true)
						.addChoice('Swifty', 's')
						.addChoice('Dems', 'd')
						.addChoice('Jessy', 'j')
					,
				),
		)

		.addSubcommand(subcommand =>
			subcommand
				.setName('eyes')
				.setDescription('Shove it in your eyes')),


	async execute(interaction) {

		const s = 'https://cdn.discordapp.com/attachments/170668549042339840/906370563289808996/Taylor_Swift_-_Shake_It_Off.mp3';
		// const path = 'https://cdn.discordapp.com/attachments/170668549042339840/906392072938987591/Taylor_Swift_-_I_knew_you_were_trouble.mp3';
		const d = 'https://cdn.discordapp.com/attachments/758325305823461417/906422072757067776/demilovato_-_confident.mp3';
		const j = 'https://cdn.discordapp.com/attachments/758325305823461417/906695643920207912/Jessica_Simpson_-_These_Boots_Are_Made_for_Walkin.mp3';

		// await interaction.deferReply();

		// const what = interaction.options.getString('what');
		const subcommand = interaction.options._subcommand;
		if (subcommand === undefined) {
			await interaction.reply({
				content: 'You didnt select a subcommand idiot',
				ephemeral: true,
			});
		}

		/*
		await interaction.reply({
			content: 'I logged words',
			ephemeral: true,
		});
		*/

		/*
		const connection = await joinVoiceChannel({
			channelId: interaction.channelID,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});
*/
		if (subcommand === 'ears') {
			// sound();
			const what = interaction.options.getString('whom');
			let songPath = null;
			if (what === 's') {
				songPath = s;
			}
			else if (what === 'd') {
				songPath = d;
			}
			else if (what === 'j') {
				songPath = j;
			}

			state.playlist.push(songPath);
			if (!state.isPlaying) {
				player.playSoundFile(interaction);
			}
			await interaction.reply({ content: `You've added ${songPath.split('/')[songPath.split('/').length - 1]} to the playlist`, ephemeral: true });
		}
		else if (subcommand === 'eyes') {
			light();
		}


		async function sound() {

			interaction.followUp({ content:'Revving up', ephemeral:true });
			const what = interaction.options.getString('what');
			let songPath = null;
			if (what === 's') {
				songPath = s;
			}
			else if (what === 'd') {
				songPath = d;
			}
			const player = createAudioPlayer();

			const resource = createAudioResource(songPath, {
				inlineVolume: true,
				metadata: {
					title: 'title',
				},
			});

			player.play(resource);
			try {
				await entersState(player, AudioPlayerStatus.Playing, 5000);
				console.log('playback started');
			}
			catch (error) {
				console.log(error);
			}
			connection.subscribe(player);
			await interaction.followUp({ content:'Sound Blasting', ephemeral:true });
			setTimeout(() => interaction.deleteReply(), 1000);
			player.on('stateChange', (os, ns) => {
				console.log(`${os.status} -----> ${ns.status}`);
			});
			player.on(AudioPlayerStatus.Idle, () => {
				if (state.playlist.length === 0) {
					state.isPlaying = false;
					connection.destroy();
				}
				else {
					playSoundFile(interaction);
				}
			});

		}

		function light() {
			interaction.followUp('BLinkingText');
		}

	},
};