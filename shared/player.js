const path = require('path');
const {	createAudioPlayer, createAudioResource, joinVoiceChannel, entersState, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const state = require('../shared/state');
const ytdl = require('ytdl-core');

module.exports = async function playSoundFile(interaction){
    const connection = await joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    state.isPlaying = true;
    const player = createAudioPlayer();
    const audioFile = state.playlist.shift();
    let soundPath = null;
    if (validURL(audioFile)){
         soundPath = await ytdl(audioFile, {
            filter: 'audioonly'});
    } else {
        soundPath = path.resolve('./sounds/' + audioFile);
    }
    
    const resource = createAudioResource(soundPath, {
        inlineVolume: true,
        metadata:{
            title: 'title',
        }
    });
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

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }