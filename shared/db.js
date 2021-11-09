const {	MongoClient } = require('mongodb');
const { mongoUser, mongoPassword, mongoCluster } = require('../config.json');
const uri = `mongodb://${mongoUser}:${mongoPassword}@${mongoCluster}:27017/admin?authSource=admin&replicaSet=atlas-soxeer-shard-0&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=true`;
const client = new MongoClient(uri);
const database = client.db('Bot');

const dbHelper = {
	getFileName: async function(meme, guildId) {
		try {
			console.log(guildId);
			await client.connect();
			const music = database.collection('Music');
			const query = {
				'titleLower': meme,
				'guildId': guildId,
			};
			const options = {
				sort: {
					title: 1,
				},
			};
			const cursor = music.find(query, options);
			const cursorCount = await cursor.count();
			if (cursorCount === 0) {
				return undefined;
			}
			const cursorArray = await cursor.toArray();
			return cursorArray[0] !== undefined ? cursorArray[0].path : undefined;
		}
		catch (e) {
			console.log(e);
		}
		finally {

			await client.close();
		}
	},
	importRecords: async function(records) {
		// Replace the uri string with your MongoDB deployment's connection string.
		async function run() {
			try {
				await client.connect();
				// create a document to insert
				const music = database.collection('Music');
				// eslint-disable-next-line prefer-const
				let docs = [];
				records.forEach(async (value, key) => {
					const doc = {
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
					};
					docs.push(doc);
				});
				const options = { ordered: true };
				const result = await music.insertMany(docs, options);
				console.log(`${result.insertedCount} documents were inserted`);
			}
			finally {
				await client.close();
			}
		}
		run().catch(console.dir);
	},
};

module.exports = dbHelper;