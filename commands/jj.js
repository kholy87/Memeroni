const { SlashCommandBuilder } = require('@discordjs/builders');
const {	joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, AudioPlayerStatus} = require('@discordjs/voice');
const state = require('../shared/state');
const playSoundFile = require('../shared/player');

module.exports = {
    

    data: new SlashCommandBuilder()
        .setName('jj')
        .setDescription('you know whats up')
        .addStringOption(option => 
            option.setName('what')
                .setDescription('The url to a youtube video')
                .setRequired(true)
                .addChoice('Swifty', 'idontknow')
        ),
        
    async execute(interaction) {
        
        const path= 'https://cdn.discordapp.com/attachments/170668549042339840/906370563289808996/Taylor_Swift_-_Shake_It_Off.mp3';


        await interaction.deferReply();
        
        const connection = await joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer();
        const resource = createAudioResource(path, {
            inlineVolume: true,
            metadata:{
                title: 'title',
            }
        });
        player.play(resource);
        try {
            await entersState(player, AudioPlayerStatus.Playing, 5000);
            console.log('playback started');
        }catch(error){
            console.log(error);
        }
        connection.subscribe(player);
        await interaction.followUp('Now twiddling my thumbs!');
        setTimeout(() => interaction.deleteReply(), 1000);
        player.on('stateChange', (os,ns) => {console.log(`${os.status} -----> ${ns.status}`);});
        player.on(AudioPlayerStatus.Idle, () => {
            if (state.playlist.length === 0){
                state.isPlaying = false;
                connection.destroy();
            } else{
                playSoundFile(interaction);
            }
        });
    },
};