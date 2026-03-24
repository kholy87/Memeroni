const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const state = require('../shared/state');
const player = require('../shared/player');
const PlayerUtils = require('../shared/playerUtils');
const play = require('play-dl');

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
		const normalizedSongUrl = PlayerUtils.normalizeYouTubeUrl(songUrl);
		let song = {
			title: normalizedSongUrl,
			description: 'YouTube audio added to queue',
			url: normalizedSongUrl,
			duration: 0,
			thumbnail: 'https://i.imgur.com/5VcGqIl.png',
		};

		try {
			const songData = await play.video_info(normalizedSongUrl);
			song = {
				title: songData.video_details.title,
				description: songData.video_details.description || 'YouTube audio added to queue',
				url: songData.video_details.url || normalizedSongUrl,
				duration: songData.video_details.durationInSec || 0,
				thumbnail: songData.video_details.thumbnails && songData.video_details.thumbnails.length > 0
					? songData.video_details.thumbnails[0].url
					: 'https://i.imgur.com/5VcGqIl.png',
			};
		}
		catch (error) {
			console.warn('Unable to load YouTube metadata, continuing with URL only.', error.message || error);
		}

		state.playlist.push(normalizedSongUrl);
		if (!state.isPlaying) {
			player.start(interaction);
		}
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('stop')
					.setLabel('Stop')
					.setStyle(ButtonStyle.Danger),
				new ButtonBuilder()
					.setCustomId('skip')
					.setLabel('Skip')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('resume')
					.setLabel('Resume')
					.setStyle(ButtonStyle.Success),
			);
		const exampleEmbed = new EmbedBuilder()
			.setColor('#0099ff')
			.setDescription(`${song.title} has been added to the playlist`)
			.setAuthor({ name: 'Memeroni', iconURL: 'https://i.imgur.com/qyK1FJF.png' })
			.setThumbnail('https://i.imgur.com/5VcGqIl.png')
			.setImage(song.thumbnail)
			.setTimestamp()
			.setFooter({ text: 'Memeroni', iconURL: 'https://i.imgur.com/qyK1FJF.png' });
		await interaction.editReply({ embeds: [exampleEmbed], components: [row] });
	},
	async executeButton(interaction) {
		const customId = interaction.customId;
		if (customId === 'stop') {
			player.stop(interaction);
		}
		else if (customId === 'skip') {
			player.skip(interaction);
		}
		else if (customId === 'resume') {
			player.resume(interaction);
		}
	},
};