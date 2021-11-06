const { SlashCommandBuilder } = require('@discordjs/builders');
const state = require('../shared/state');
const playSoundFile = require('../shared/player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('yt')
		.setDescription('play a youtube sound')
		.addStringOption(option =>
			option.setName('url')
				.setDescription('The url to a youtube video')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const songUrl = interaction.options.getString('url');
		state.playlist.push(songUrl);
		if (!state.isPlaying) {
			playSoundFile(interaction);
		}
		await interaction.followUp('Now playing!');
		setTimeout(() => interaction.deleteReply(), 1000);
	},
};