import { Events, EmbedBuilder } from 'discord.js';
import { whitelistDB } from '../commands/Security/whitelist.js';
import { badwordsDB } from '../commands/Security/sr.js';

// Default bad words (you can expand this)
const defaultBadWords = [
    "fuck", "shit", "bitch", "asshole", "cunt", "dick", "pussy", 
    "motherfucker", "bastard", "faggot", "nigger", "retard", 
    "whore", "slut", "damn", "hell" // add more as needed
];

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        // Skip whitelisted users
        const key = `${guildId}-${userId}`;
        if (whitelistDB.has(key)) return;

        let content = message.content.toLowerCase().trim();

        // Initialize badwords for this guild if not exist
        if (!badwordsDB.has(guildId)) {
            badwordsDB.set(guildId, [...defaultBadWords]);
        }

        const badwords = badwordsDB.get(guildId) || [];

        let reason = null;
        let threat = "Medium";

        // Improved Swear Detection
        const foundWord = badwords.find(word => {
            const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b|${word}`, 'i');
            return regex.test(content);
        });

        if (foundWord) {
            reason = `Bad Word: ${foundWord}`;
        }
        // Spam Detection
        else if (message.channel.messages.cache.filter(m => m.author.id === userId).size >= 5) {
            reason = "Spam Messages";
            threat = "High";
        }

        if (reason) {
            await punishUser(message, reason, threat);
        }
    }
};

// Keep your existing punishUser function below...
async function punishUser(message, reason, threat) {
    // ... (your current punishUser function - no need to change)
}
