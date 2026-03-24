// Require the necessary discord.js classes
const fs = require('fs');
const { Client, GatewayIntentBits, Collection, MessageFlags } = require('discord.js');
const { token, roleId } = require('./config.json');
const state = require('./shared/state');
const dbHelper = require('./shared/db');

function isIgnorableInteractionError(error) {
	return error && (error.code === 10062 || error.code === 40060);
}

// Create a new client instance
state.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] });

// When the client is ready, run this code (only once)
state.client.once('clientReady', async () => {
	console.log('Ready!');
	// Load initial music title's into array
	state.memeNames = await dbHelper.loadMusicArray();
	if (Array.isArray(state.memeNames) && state.memeNames.length > 0) {
		console.log('Loaded Memes from DB');
	}
	else {
		console.log('DB unavailable or no memes found; continuing with in-memory commands only.');
	}
});

// Reconnecting
state.client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

// load commands
state.client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	state.client.commands.set(command.data.name, command);
}

// Reply to slash commands
state.client.on('interactionCreate', async interaction => {
	if (interaction.isButton()) {
		const command = state.client.commands.get(interaction.message.interaction.commandName);
		if (!command) return;
		try {
			await command.executeButton(interaction);
		}
		catch (error) {
			if (isIgnorableInteractionError(error)) {
				console.warn(`Ignoring Discord interaction error code ${error.code} for button.`);
				return;
			}

			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral }).catch(() => undefined);
			}
			else {
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral }).catch(() => undefined);
			}
		}
	}
	if (interaction.isChatInputCommand()) {
		const command = state.client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.execute(interaction);
		}
		catch (error) {
			if (isIgnorableInteractionError(error)) {
				console.warn(`Ignoring Discord interaction error code ${error.code} for command ${interaction.commandName}.`);
				return;
			}

			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral }).catch(() => undefined);
			}
			else {
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral }).catch(() => undefined);
			}
		}
	}
	if (interaction.isAutocomplete()) {
		const command = state.client.commands.get(interaction.commandName);

		if (!command) return;

		try {
			await command.stringSearch(interaction);
		}
		catch (error) {
			console.error(error);
		}
	}
});

process.on('unhandledRejection', error => {
	console.error('Unhandled promise rejection:', error);
});

state.client.on('error', error => {
	console.error('Discord client error:', error);
});

// Set interval for Grandfather Clock
// player.grandfatherClockInterval = setInterval(player.grandfatherClockFn, 15000);

// Set roleId in the state
state.roleId = roleId;

// Login to Discord with your client's token
state.client.login(token);