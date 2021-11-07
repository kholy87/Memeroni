const { SlashCommandBuilder } = require('@discordjs/builders');
const state = require('../shared/state');
const player = require('../shared/player');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sd')
		.setDescription('play a meme')
		.addStringOption(option => {
			option.setName('meme').setDescription('The Meme').setRequired(true);
			for (let i = 0; i < state.sounds.length && i < 25; i++) {
				if (state.sounds[i] !== undefined && state.sounds[i].length < 24) option.addChoice(state.sounds[i], state.sounds[i]);
			}
			return option;
		}),
	async execute(interaction) {
		const meme = interaction.options.getString('meme');
		state.playlist.push(meme);
		if (!state.isPlaying) {
			player.start(interaction);
		}
		await interaction.reply({ content: `You've added ${meme} to the playlist`, ephemeral: true });
	},
};