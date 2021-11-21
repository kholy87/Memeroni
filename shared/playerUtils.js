const {	createAudioPlayer, createAudioResource, joinVoiceChannel, entersState, AudioPlayerStatus, getNextResource } = require('@discordjs/voice');

const PlayerUtils = {
	wait: function(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},
	validURL: function(str) {
		const pattern = new RegExp('^(https?:\\/\\/)?' +
			'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
			'((\\d{1,3}\\.){3}\\d{1,3}))' +
			'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
			'(\\?[;&a-z\\d%_.~+=-]*)?' +
			'(\\#[-a-z\\d_]*)?$', 'i');
		return !!pattern.test(str);
	},
	start: async function(player, resource) {
		player.on('error', error => {
			console.log(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
			player.play(getNextResource());
		});
		player.play(resource);

		try {


			await entersState(player, AudioPlayerStatus.Playing, 5000);
			console.log('playback started');
		}
		catch (error) {
			console.log('this error:' + error);
			const soundPath = 'C:\\Users\\XavierMidnight\\Documents\\GitHub\\Memeroni\\sounds\\ability.mp3';
			const newResource = createAudioResource(soundPath, {
				debug:true,
				inlineVolume: true,
				metadata:{
					title: 'title',
				},
			});
			player.play(newResource);
		}

	},
};

module.exports = PlayerUtils;