# Memeroni

Discord bot for:
- Meme sound playback from local files and Mongo-backed lookup
- YouTube audio playback with queue controls
- Time-announcement audio clips

## Features

- Slash commands:
	- `/sd meme:<name>`: Play a meme sound
	- `/yt url:<youtube-url>`: Queue YouTube audio
	- `/time`: Play the current time clip
	- `/eclipse`: Play the eclipse clip
- Queue controls (buttons on `/yt` embed):
	- `Stop`
	- `Skip`
	- `Resume`

## Tech Stack

- Node.js
- discord.js v14
- @discordjs/voice
- MongoDB driver
- yt-dlp-wrap for resilient YouTube audio URL extraction

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- A Discord application + bot token
- A target Discord server (guild) where commands should be registered
- Optional: MongoDB Atlas cluster for meme metadata

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure bot values in `config.json`:

```json
{
	"token": "YOUR_DISCORD_BOT_TOKEN",
	"guildId": "YOUR_GUILD_ID",
	"clientId": "YOUR_APPLICATION_CLIENT_ID",
	"mongoUser": "YOUR_DB_USER",
	"mongoPassword": "YOUR_DB_PASSWORD",
	"mongoCluster": "YOUR_CLUSTER_HOST_AND_DB",
	"roleId": 1234567890
}
```

Example `mongoCluster` format:

```text
cluster0.example.mongodb.net/test
```

## First-Time Setup

1. Register slash commands to your guild:

```bash
node deploy-commands.js
```

2. Optional: import local meme sound records into MongoDB:

```bash
node deploy-sounds.js
```

## Run

```bash
npm start
```

Expected startup logs:
- `Ready!`
- `Loaded Memes from DB` (if Mongo is reachable)

If Mongo is unavailable, the bot continues running and logs a warning.

## Development Commands

- Lint:

```bash
npm run lint
```

- Start directly:

```bash
node .
```

## Updating Dependencies

### Safe updates (within version ranges)

```bash
npm outdated
npm update
npm run lint
```

### Major version updates

1. Upgrade package(s):

```bash
npm install <package>@latest
```

2. Validate:

```bash
npm run lint
npm start
```

### YouTube backend notes

- The bot uses `yt-dlp-wrap` and downloads `yt-dlp.exe` to `bin/yt-dlp.exe` automatically if missing.
- To refresh the yt-dlp binary manually:
	1. Stop the bot
	2. Delete `bin/yt-dlp.exe`
	3. Start bot again with `npm start`

## Troubleshooting

### `Unknown interaction` errors

- Most commonly caused by multiple bot instances running at once.
- Ensure only one `node .` process is active for this project.

### MongoDB connection warnings

- If the cluster is paused/inactive, startup may log Mongo warnings.
- The bot is designed to keep running, but Mongo-backed lookups may be limited.

### YouTube playback errors

- Verify the URL is public and playable in browser.
- Retry with a plain watch URL format:

```text
https://www.youtube.com/watch?v=<VIDEO_ID>
```

- If extraction behavior changes over time, restart bot to refresh yt-dlp binary logic.

### Windows PowerShell `npm.ps1` execution policy error

Run once in PowerShell:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

Then reopen terminal.

## Project Structure (high level)

- `index.js`: bot bootstrap, interaction routing
- `commands/`: slash command handlers
- `shared/player.js`: voice playback and queue engine
- `shared/db.js`: MongoDB helper layer
- `deploy-commands.js`: guild command registration
- `deploy-sounds.js`: import local sound map into DB
- `sounds/`: local audio clips

## Security Notes

- Do not commit live tokens/passwords.
- If credentials were exposed, rotate them immediately:
	- Discord bot token
	- MongoDB user/password
