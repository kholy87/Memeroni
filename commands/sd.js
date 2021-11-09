const { SlashCommandBuilder } = require('@discordjs/builders');
const state = require('../shared/state');
const player = require('../shared/player');
const dbHelper = require('../shared/db');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sd')
		.setDescription('play a meme')
		.addStringOption(option =>
			option.setName('meme')
				.setDescription('Enter the name of the meme you\'d like to play')
				.setRequired(true)),
	async execute(interaction) {
		const meme = interaction.options.getString('meme');
		let filename = await dbHelper.getFileName(meme, interaction.guildId);
		if (filename === undefined) {
			await interaction.reply({ content: `No file found for ${meme}`, ephemeral: true });
			return;
		}
		else {
			filename = state.soundMap.get(meme);
		}
		state.playlist.push(filename);
		if (!state.isPlaying) {
			player.start(interaction);
		}
		await interaction.reply({ content: `You've added ${meme} to the playlist`, ephemeral: true });
	},
};

