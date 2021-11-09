const fs = require('fs');
const soundFiles = fs.readdirSync('./sounds').filter(file => file.endsWith('.mp3'));
// eslint-disable-next-line prefer-const
let soundMap = new Map();

for (const file of soundFiles) {
	const fileName = file.substr(0, file.indexOf('.'));
	soundMap.set(fileName, file);
}

module.exports = { isPlaying: false, playlist: [], soundMap: soundMap, currentSong: undefined, roleId: 0 };