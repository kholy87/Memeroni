const { SlashCommandBuilder } = require('@discordjs/builders');
const state = require('../shared/state');
const player = require('../shared/player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Plays the current time.'),
	async execute(interaction) {
		state.playlist.push({ readTime: true });
		if (!state.isPlaying) {
			player.start(interaction);
		}
		await interaction.reply({ content: `It is currently ${new Date().toLocaleTimeString()}`, ephemeral: true });
	},
};

