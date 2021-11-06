const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const state = require('../shared/state');
const player = require('../shared/player');

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
			player.playSoundFile(interaction);
		}
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('stop')
					.setLabel('Stop')
					.setStyle('DANGER'),
				new MessageButton()
					.setCustomId('skip')
					.setLabel('Skip')
					.setStyle('PRIMARY'),
			);
		await interaction.followUp({ content: 'Now playing!', components: [row] });
		// setTimeout(() => interaction.deleteReply(), 1000);
	},
	async executeButton(interaction) {
		const customId = interaction.customId;
		if (customId === 'stop') {
			player.stop();
		}
		interaction.reply({ content: `${interaction.user.tag} clicked ${interaction.customId}` });
	},
};