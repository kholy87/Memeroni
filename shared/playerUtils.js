const { URL } = require('url');
const state = require('./state');

const PlayerUtils = {
	wait: function(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	},
	normalizeYouTubeUrl: function(str) {
		if (!str || typeof str !== 'string') {
			return str;
		}

		try {
			const parsed = new URL(str);
			const host = parsed.hostname.toLowerCase();

			if (host.includes('youtu.be')) {
				const id = parsed.pathname.replace('/', '').trim();
				if (id.length > 0) {
					return `https://www.youtube.com/watch?v=${id}`;
				}
			}

			if (host.includes('youtube.com')) {
				if (parsed.pathname === '/watch') {
					const videoId = parsed.searchParams.get('v');
					if (videoId) {
						return `https://www.youtube.com/watch?v=${videoId}`;
					}
				}

				if (parsed.pathname.startsWith('/shorts/')) {
					const id = parsed.pathname.split('/')[2];
					if (id) {
						return `https://www.youtube.com/watch?v=${id}`;
					}
				}
			}
		}
		catch {
			return str;
		}

		return str;
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
	getMemesPerGuild(guildId) {
		const memes = state.memeNames;
		const returnMemes = [];
		for (let i = 0; i < memes.length; i++) {
			if (memes[i].guildId === guildId) {
				returnMemes.push(memes[i].titleLower);
			}
		}
		return returnMemes;
	},
};

module.exports = PlayerUtils;