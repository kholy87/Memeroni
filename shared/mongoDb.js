const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://dbUser:<password>@cluster0.smyk6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
	const collection = client.db('Bot').collection('Music').find();
	collection.each(function(err, item) {
		console.log(JSON.stringify(item));
	});
	// perform actions on the collection object
	client.close();

});

