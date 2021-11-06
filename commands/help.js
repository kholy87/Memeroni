const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');

const sounds = [];
const soundFiles = fs.readdirSync('./sounds').filter(file => file.endsWith('.mp3'));

for (const file of soundFiles) {

	sounds.push(file.substr(0, file.indexOf('.')));
}
console.log(sounds);
module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get a list of the memes')
		.addStringOption(option => option.setName('input').setDescription('Enter a string')),
	async execute(interaction) {
		interaction.options.getString('test');
		interaction.reply({ content: 'Here are the commands', ephemeral: true });
	},
};