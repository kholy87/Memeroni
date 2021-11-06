const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const state = require('../shared/state');
const player = require('../shared/player');
const ytdl = require('ytdl-core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('yt')
		.setDescription('play a youtube sound')
		.addStringOption(option =>
			option.setName('url')
				.setDescription('The url to a youtube video')
				.setRequired(true)),
	async execute(interaction) {
		const songUrl = interaction.options.getString('url');
		state.playlist.push(songUrl);
		if (!state.isPlaying) {
			player.playSoundFile(interaction);
		}
		const songData = await ytdl.getInfo(songUrl);
		const song = {
			title: songData.videoDetails.title,
			description: songData.videoDetails.shortDescription,
			url: songData.videoDetails.video_url,
			duration: songData.videoDetails.duration,
			thumbnail: songData.videoDetails.thumbnails[0].url,
		};
		console.log(songData, song);
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
		const exampleEmbed = new MessageEmbed()
			.setColor('#0099ff')
			.setTitle(`${song.title} has been added to the playlist`)
			.setAuthor('Memeroni', 'https://i.imgur.com/qyK1FJF.png')
			.setThumbnail('https://i.imgur.com/5VcGqIl.png')
			.setImage(song.thumbnail)
			.setTimestamp()
			.setFooter('Memeroni', 'https://i.imgur.com/qyK1FJF.png');
		await interaction.reply({ embeds: [exampleEmbed], components: [row] });
		// setTimeout(() => interaction.deleteReply(), 1000);
	},
	async executeButton(interaction) {
		const customId = interaction.customId;
		if (customId === 'stop') {
			player.stop();
		}
		else if (customId === 'skip') {
			player.skip(interaction);
		}
		interaction.reply({ content: `${interaction.user.tag} clicked ${interaction.customId}` });
	},
};