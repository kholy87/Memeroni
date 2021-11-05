const path = require('path');
const fs = require('fs');
const ffmetadata = require('ffmetadata');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {	createAudioPlayer, createAudioResource, joinVoiceChannel, entersState, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const state = require('../shared/state');

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
        let songUrl = interaction.options.getString('url');
        state.playlist.push(songUrl);
        if (!state.isPlaying){
            playSoundFile(interaction);
        }
        await interaction.followUp('Now playing!');
        setTimeout(() => interaction.deleteReply(), 1000);
    },
};

async function playSoundFile(interaction){
    const connection = await joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    state.isPlaying = true;
    //= getVoiceConnection(interaction.guildId);
    const youtubeUrl = state.playlist.shift();
    const player = createAudioPlayer();
    var stream = await ytdl(youtubeUrl, {
        filter: 'audioonly'});
    const resource = createAudioResource(stream, { inlineVolume: true });
    resource.volume.setVolume(0.5);
    async function start(){
        player.play(resource);
        try {
            await entersState(player, AudioPlayerStatus.Playing, 5000);
            console.log('playback started');
        }catch(error){
            console.log(error);
        }
            
    }
    void start();
    connection.subscribe(player);
    player.on('stateChange', (os,ns) => {console.log(`${os.status} -----> ${ns.status}`);});
    player.on(AudioPlayerStatus.Idle, () => {
        if (state.playlist.length === 0){
            state.isPlaying = false;
            connection.destroy();
        } else{
            playSoundFile(interaction);
        }
    });
}

