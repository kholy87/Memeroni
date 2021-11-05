const fs = require('fs');
const ffmetadata = require('ffmetadata');
const { SlashCommandBuilder } = require('@discordjs/builders');
const state = require('../shared/state');
const playSoundFile = require('../shared/player');
const soundFiles = fs.readdirSync('./sounds').filter(file => file.endsWith('.mp3'));

for (const file of soundFiles) {
    state.sounds.push(file);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sd')
        .setDescription('play a meme')
        .addStringOption(option => {
            option.setName('meme').setDescription('The Meme').setRequired(true);
            for (let i = 0; i<state.sounds.length; i++) {
                if (state.sounds[i] !== undefined && state.sounds[i].length <25) option.addChoice(state.sounds[i], state.sounds[i]);
            }
            return option;
        }),
    async execute(interaction) {
        await interaction.deferReply();
        let meme = interaction.options.getString('meme');
        state.playlist.push(meme);
        if (!state.isPlaying){
            playSoundFile(interaction);
        }
        await interaction.followUp('Now playing!');
        setTimeout(() => interaction.deleteReply(), 1000);
    },
};