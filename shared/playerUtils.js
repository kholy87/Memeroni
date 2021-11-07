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
};

module.exports = PlayerUtils;