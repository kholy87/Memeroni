const path = require('path');
const fs = require('fs');
const ffmetadata = require('ffmetadata');
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
        .setDescription('Get a list of the memes'),
    async execute(interaction) {
        interaction.reply({ content: 'Here are the commands', ephemeral: true });
    },
};
