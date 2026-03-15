# GCP Discord Bot

A simple node.js bot that monitors the [Global Consciousness Project](https://global-mind.org/gcpdot/) (GCP) Z-scores and sends notifications to a Discord channel via webhook when significant network variance is detected.

## Features

- Periodically fetches GCP Z-score data.
- Detects significant deviations (>=0.95/<=0.05 Z-scores).
- Sends formatted alerts to Discord using webhooks.
- Logging with configurable log levels.

## Run with Docker
```bash
docker run --rm -e WEBHOOK_URL=your_url gonzalobugueno/discordgcpbot
```
## Run locally
### Clone
```bash
git clone https://github.com/gonzalobugueno/Discord-GCP-Bot
cd Discord-GCP-Bot
```
### Run
```bash
WEBHOOKURL=your_url node bot.js
```
or alternatively, if running node=>20 
```bash
echo "WEBHOOKURL=your_url" > .env
node --env-file=.env bot.js
```

## Configuration 

    - `WEBHOOKURL` — Your Discord webhook URL.
    - `ANNOUNCE_ONLINE` — Set to `1` to announce bot startup (optional).
    - `LOG_LEVEL` — Set log level (`DEBUG`, `INFO`, `WARN`, `ERROR`).

## Files

- `bot.js` — Main bot logic.
- `log.mjs` — Simple logger utility.

## License

MIT