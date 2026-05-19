import { Events, EmbedBuilder } from 'discord.js';
import { whitelistDB } from '../commands/Security/whitelist.js';
import { badwordsDB } from '../commands/Security/sr.js';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        // Skip whitelisted users
        const key = `${guildId}-${userId}`;
        if (whitelistDB.has(key)) return;

        const content = message.content.toLowerCase().trim();
        const badwords = badwordsDB.get(guildId) || [];

        let reason = null;
        let threat = "Medium";

        // Swear Detection (Improved)
        if (badwords.some(word => content.includes(word))) {
            reason = "Toxic / Offensive Language";
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

async function punishUser(message, reason, threat) {
    const member = message.member;
    if (!member) return;

    // Force Delete Message
    try {
        await message.delete();
        console.log(`✅ Deleted message from ${message.author.tag}`);
    } catch (err) {
        console.error("Delete failed:", err.message);
    }

    let action = "Warning";
    if (threat === "High") {
        action = "Timeout (10m)";
        try {
            await member.timeout(10 * 60 * 1000, reason);
        } catch (err) {
            console.error("Timeout failed:", err.message);
        }
    }

    // DM to User
    const dmEmbed = new EmbedBuilder()
        .setTitle("⚠️ ERROR EXE OFFICIAL — AUTOMATED SECURITY WARNING")
        .setColor("Red")
        .setDescription(`Hello ${message.author},`)
        .addFields(
            { name: "━━━━━━━━━━━━━━", value: `**📌 DETECTED ACTIVITY:**\n• ${reason}` },
            { 
                name: "━━━━━━━━━━━━━━", 
                value: "Our advanced moderation system has detected activity from your account that violates the official community guidelines...\n\n⚠️ This warning is officially recorded." 
            },
            { 
                name: "Please understand:", 
                value: "Repeated violations may result in:\n• Temporary Timeout\n• Kick\n• Permanent Ban" 
            }
        )
        .setFooter({ text: "— ERROR EXE OFFICIAL SECURITY SYSTEM 🛡️" });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});

    // DM to Bot Owner(s)
    const BOT_OWNERS = process.env.BOT_OWNER_ID 
        ? process.env.BOT_OWNER_ID.split(',').map(id => id.trim())
        : ["858482656252657674", "1409273535238508585"];

    for (const ownerId of BOT_OWNERS) {
        try {
            const owner = await message.client.users.fetch(ownerId);
            const alertEmbed = new EmbedBuilder()
                .setTitle("🚨 ERROR EXE OFFICIAL — SECURITY ALERT")
                .setColor("DarkRed")
                .addFields(
                    { name: "👤 User", value: `${message.author.tag} (${message.author.id})` },
                    { name: "📍 Channel", value: `<#${message.channel.id}>` },
                    { name: "🕒 Time", value: `<t:${Math.floor(Date.now()/1000)}>` },
                    { name: "📌 DETECTED REASON", value: reason },
                    { name: "📊 Threat Level", value: threat },
                    { name: "🤖 Action", value: action }
                );

            await owner.send({ embeds: [alertEmbed] });
        } catch (e) {}
    }
}
