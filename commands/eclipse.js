const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageFlags } = require('discord.js');
const state = require('../shared/state');
const player = require('../shared/player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eclipse')
		.setDescription('SOLAR ECLIPSE 2024!'),
	async execute(interaction) {
		const filename = 'totaleclipse.mp3';
		if (filename !== undefined) {
			state.playlist.push(filename);
			if (!state.isPlaying) {
				player.start(interaction);
			}
			await interaction.reply({ content: 'ENJOY THE ECLIPSE!', flags: MessageFlags.Ephemeral });
		}
		else {
			await interaction.reply({ content: 'Whoops, you suck!', flags: MessageFlags.Ephemeral });
		}
	},

};

