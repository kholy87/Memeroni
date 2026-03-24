const { MongoClient } = require('mongodb');
const { mongoUser, mongoPassword, mongoCluster } = require('../config.json');
const uri = `mongodb+srv://${mongoUser}:${mongoPassword}@${mongoCluster}`;
const state = require('./state');

let hasLoggedConnectionFailure = false;

function buildClient() {
	return new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
}

function logConnectionFailure(err) {
	if (hasLoggedConnectionFailure) {
		return;
	}

	hasLoggedConnectionFailure = true;
	const reason = err && (err.code || err.message) ? `${err.code || err.message}` : 'unknown error';
	console.warn(`MongoDB unavailable (${reason}). Continuing without database.`);
}

async function withMusicCollection(work) {
	const client = buildClient();

	try {
		await client.connect();
		const database = client.db('Bot');
		const musicCollection = database.collection('Music');
		return await work(musicCollection);
	}
	catch (err) {
		logConnectionFailure(err);
		return undefined;
	}
	finally {
		await client.close().catch(() => undefined);
	}
}

const dbHelper = {
	getFileName: async function(meme, guildId) {
		return withMusicCollection(async musicCollection => {
			const query = {
				'titleLower': meme.toLowerCase(),
				'guildId': guildId,
			};
			const result = await musicCollection.findOne(query, {
				sort: { title: 1 },
				projection: { path: 1 },
			});
			return result ? result.path : undefined;
		});
	},
	loadMusicArray: async function() {
		const results = await withMusicCollection(async musicCollection => {
			const projection = { titleLower: 1, guildId: 1, playCount: 1 };
			const sort = { playCount: -1 };
			return musicCollection.find().sort(sort).project(projection).toArray();
		});

		if (!Array.isArray(results)) {
			return [];
		}

		return results;
	},
	addPlayCount: async function(record) {
		await withMusicCollection(async musicCollection => {
			await musicCollection.findOneAndUpdate({ titleLower: record }, { $inc: { playCount: 1 } });
		});

		state.memeNames = await dbHelper.loadMusicArray();
	},
	importRecords: async function(records) {
		const entries = records instanceof Map ? Array.from(records.entries()) : Object.entries(records);

		if (entries.length === 0) {
			return;
		}

		const docs = entries.map(([key, value]) => ({
			title: key,
			titleLower: key.toLowerCase(),
			path: value,
			type: 'clip',
			style: 'meme',
			playCount: 0,
			guildId: '170668549042339840',
			createdBy: '118892076627787776',
			createdOn: new Date(),
			modifiedBy: '118892076627787776',
			modifiedOn: new Date(),
		}));

		await withMusicCollection(async musicCollection => {
			const options = { ordered: true };
			const result = await musicCollection.insertMany(docs, options);
			console.log(`${result.insertedCount} documents were inserted`);
		});
	},
};

module.exports = dbHelper;