const {
	SlashCommandBuilder,
} = require('@discordjs/builders');
const state = require('../shared/state');
const player = require('../shared/player');
const { mongoUser, mongoPassword } = require('./config.json');

module.exports = {


	data: new SlashCommandBuilder()
		.setName('jj')
		.setDescription('you know whats up')
		.addSubcommand(subcommand =>
			subcommand
				.setName('ears')
				.setDescription('Feed your ears')
				.addStringOption(option =>
					option.setName('whom')
						.setDescription('What are you putting in your ears')
						.setRequired(false)
						.addChoice('Swifty', 's')
						.addChoice('Dems', 'd')
						.addChoice('Jessy', 'j')

					,


				)
				.addStringOption(option =>
					option.setName('what')
						.setDescription('oh no, what are you planning now')
						.setRequired(false)
						.addChoice('Stop it!', 'stop')
						.addChoice('Carry On my son!', 'resume')

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
		// const j = 'https://cdn.discordapp.com/attachments/170668549042339840/906988617887518852/Jessica_Simpson_-_These_Boots_Are_Made_for_Walkin.mp3';

		const subcommand = interaction.options._subcommand;
		if (subcommand === undefined) {
			await interaction.reply({
				content: 'You didnt select a subcommand idiot',
				ephemeral: true,
			});
		}

		if (subcommand === 'ears') {
			const whom = interaction.options.getString('whom');
			if (whom === null) {
				const what = interaction.options.getString('what');
				if (what === 'stop') {
					await player.fadeOut(interaction);
				}
				else if (what === 'resume') {
					await player.resume(interaction);
				}
			}
			else {
				let songPath = null;
				if (whom === 's') {
					songPath = s;
				}
				else if (whom === 'd') {
					songPath = d;
				}
				else if (whom === 'j') {
					songPath = j;
				}

				simpleSound(songPath);
				await interaction.reply({ content: `You've added ${songPath.split('/')[songPath.split('/').length - 1]} to the playlist`, ephemeral: true });
			}
		}
		else if (subcommand === 'eyes') {
			spit();
			// light();
		}

		async function simpleSound(songPath) {
			state.playlist.push(songPath);
			if (!state.isPlaying) {
				player.playSoundFile(interaction);
			}
		}

		function light() {
			interaction.followUp('BLinkingText');
		}

		function spit() {
			interaction.followUp('Pewt Pewt');
			const { MongoClient } = require('mongodb');
			const uri = `mongodb+srv://${mongoUser}:${mongoPassword}@cluster0-shard-00-02.smyk6.mongodb.net/Bot?retryWrites=true&w=majority`;
			const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
			client.connect(err => {

				const collection = client.db('Bot').collection('Music');
				collection.find().toArray(function(err, docs) {
					console.log(JSON.stringify(docs));
				});
				// perform actions on the collection object
				client.close();

			});


		}

	},
};