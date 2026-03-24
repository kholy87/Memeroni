const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageFlags } = require('discord.js');
const state = require('../shared/state');
const player = require('../shared/player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('time')
		.setDescription('Plays the current time.'),
	async execute(interaction) {
		await interaction.reply({ content: `It is currently ${new Date().toLocaleTimeString()}`, flags: MessageFlags.Ephemeral });
		state.playlist.push({ readTime: true });
		if (!state.isPlaying) {
			player.start(interaction);
		}
	},
};

