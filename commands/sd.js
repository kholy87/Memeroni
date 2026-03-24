const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageFlags } = require('discord.js');
const state = require('../shared/state');
const player = require('../shared/player');
const dbHelper = require('../shared/db');
const PlayerUtils = require('../shared/playerUtils');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sd')
		.setDescription('play a meme')
		.addStringOption(option =>
			option.setName('meme')
				.setDescription('Enter the name of the meme you\'d like to play')
				.setRequired(true)
				.setAutocomplete(true)),
	async execute(interaction) {
		const meme = interaction.options.getString('meme');
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		let filename = await dbHelper.getFileName(meme, interaction.guildId);
		if (filename === undefined) {
			await interaction.editReply({ content: `No file found for ${meme}` });
			return;
		}
		else {
			filename = state.soundMap.get(meme);
		}
		if (filename !== undefined) {
			state.playlist.push(filename);
			dbHelper.addPlayCount(meme);
			if (!state.isPlaying) {
				player.start(interaction);
			}
			await interaction.editReply({ content: `You've added ${meme} to the playlist` });
		}
		else {
			await interaction.editReply({ content: `Can't find the file ${meme} to add to the playlist` });
		}
	},
	async stringSearch(interaction) {
		const results = PlayerUtils.getMemesPerGuild(interaction.guildId);
		if (interaction.options.getFocused().length > 0) {
			const filtered = results.filter(meme => meme.startsWith(interaction.options.getFocused()));
			await interaction.respond(
				filtered.map(meme => ({ name: meme, value: meme })),
			);
			console.log(interaction.options.getFocused());
		}
		else {
			const filtered = results.slice(0, 15);
			await interaction.respond(
				filtered.map(meme => ({ name: meme, value: meme })),
			);
		}
	},
};

