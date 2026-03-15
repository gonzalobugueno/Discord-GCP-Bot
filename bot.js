// ================================
// IMPORTS AND DEPENDENCIES
// ================================

import { logger } from './log.mjs';

// ================================
// CONFIGURATION AND CONSTANTS
// ================================

if (!process.env.WEBHOOKURL) {
    logger.error('WEBHOOKURL environment variable is not set.');
    process.exit(1);
}

const webhookUrl = process.env.WEBHOOKURL;
const uri = new URL(webhookUrl);
uri.searchParams.set('wait', 'true');

const botUsername = process.env.BOT_USERNAME || "GCP Bot";
const messageFlags = process.env.MFLAG ? parseInt(process.env.MFLAG) : 4096;

const conds = [
    {
        "name": "zscore >= 0.95",
        "cond": s => Number(s.zscore) >= 0.95,
        "avatar": "https://gcpdot.com/assets/2e69cae0/01.png",
        "message": "Significantly small network variance detected"
    },
    {
        "name": "zscore <= 0.05",
        "cond": s => Number(s.zscore) <= 0.05,
        "avatar": "https://gcpdot.com/assets/2e69cae0/11.png",
        "message": "Significantly large network variance detected"
    }
];

let lastCond = null;

// ================================
// UTILITY FUNCTIONS
// ================================

/**
 * Converts a Unix timestamp to a human-readable date-time string.
 *
 * @param {number} unixTimestamp - The Unix timestamp to convert.
 * @returns {string} The formatted date-time string.
 */
function unixToDateTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleString();
}

/**
 * Fetches and parses Global Consciousness Project samples
 *
 * @async
 * @function fetchGcpStats
 * @returns {Promise<Array<Object>|null>} Resolves with an array of sample statistics objects if successful, or null if an error occurs.
 */
async function fetchGcpStats() {
    try {
        const response = await fetch('https://global-mind.org/gcpdot/gcpindex.php');
        const xml = await response.text();

        const samplesRegex = [];
        let r;
        const pi = /<s t='([\d]+)'>([\d.]+)/img;
        while ((r = pi.exec(xml)) !== null) {
            samplesRegex.push({
                ts: r[1],
                zscore: r[2]
            });
        }

        const samples = samplesRegex;
        samples.sort((a, b) => b.ts - a.ts); // Sort by timestamp descending

        logger.debug('Fetched and parsed GCP stats:', samples);

        return samples;
    } catch (err) {
        logger.error('Error processing GCP stats:', err);
        return null;
    }
}

/**
 * Sends a message object to the Discord webhook asynchronously
 *
 * @param {Object} obj - Discord message object to send
 */
async function sendDiscordMessage(obj) {
    try {
        const res = await fetch(uri.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obj)
        });
        const body = await res.text();
        logger.info('Discord webhook response - Status:', res.status, 'Body:', body);
    } catch (err) {
        logger.error('Fetch error:', err);
    }
}

// ================================
// MAIN LOGIC
// ================================

/**
 * Checks for significant GCP Z-scores and sends a message to Discord if found.
 *
 * @async
 * @function checkAndNotifySignificantZScores
 */
async function checkAndNotifySignificantZScores() {
    try {
        const stats = await fetchGcpStats();
        if (!stats) return;

        let obj = null;
        for (const cond of conds) {
            if (lastCond === cond.name) continue; // Skip if this condition was already reported in the last check

            const significant = stats.filter(cond.cond);

            if (significant.length > 0) {
                const message = `Z-score: ${significant[0].zscore} at ${unixToDateTime(significant[0].ts)}`;

                obj = {
                    content: `${cond.message}: ${message}`,
                    username: botUsername,
                    avatar_url: cond.avatar,
                    flags: messageFlags,
                };

                lastCond = cond.name;
                break; // Only report the first condition that matches
            }
        }
        if (obj) {
            sendDiscordMessage(obj);
        }
    } catch (err) {
        logger.error('Interval error:', err);
    }
}

// ================================
// EXECUTION
// ================================

logger.info('GCP Bot starting up...');

// Send initial online message
if (process.env.ANNOUNCE_ONLINE)
    sendDiscordMessage({
        content: 'GCP Bot is now online and monitoring Z-scores.',
        username: botUsername,
        avatar_url: "https://gcpdot.com/assets/2e69cae0/01.png",
        flags: messageFlags,
    });

// Initial check immediately on startup
checkAndNotifySignificantZScores();

// Set up periodic checks every 60 seconds
setInterval(checkAndNotifySignificantZScores, 60000);