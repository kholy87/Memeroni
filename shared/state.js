const fs = require('fs');
const soundFiles = fs.readdirSync('./sounds').filter(file => file.endsWith('.mp3'));

module.exports = { isPlaying: false, playlist: [], sounds: soundFiles }