import { Events, EmbedBuilder } from 'discord.js';
import { whitelistDB } from '../commands/Security/whitelist.js';
import { badwordsDB } from '../commands/Security/sr.js';

// Strike Counter (In-memory)
const strikeDB = new Map();

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;
        const key = `${guildId}-${userId}`;

        // Skip whitelisted users
        if (whitelistDB.has(key)) return;

        const content = message.content.toLowerCase().trim();
        const badwords = badwordsDB.get(guildId) || [];

        let reason = null;

        if (badwords.some(word => content.includes(word))) {
            reason = "Toxic / Offensive Language";
        } else if (message.channel.messages.cache.filter(m => m.author.id === userId).size >= 4) {
            reason = "Spam Messages";
        }

        if (reason) {
            await punishUser(message, reason);
        }
    }
};

async function punishUser(message, reason) {
    const member = message.member;
    if (!member) return;

    const guildId = message.guild.id;
    const userId = message.author.id;
    const strikeKey = `${guildId}-${userId}`;

    // Get current strikes
    let strikes = strikeDB.get(strikeKey) || 0;
    strikes++;
    strikeDB.set(strikeKey, strikes);

    message.delete().catch(() => {});

    let actionTaken = "";
    let duration = 0;

    // Progressive Punishment
    if (strikes === 1) {
        actionTaken = "Message Deleted (1st Offense)";
    } 
    else if (strikes === 2) {
        actionTaken = "Message Deleted + Warning (2nd Offense)";
        sendWarningDM(message, reason);
    } 
    else if (strikes === 3) {
        actionTaken = "Message Deleted + Warning + 5 Hours Timeout (3rd Offense)";
        duration = 5 * 60 * 60 * 1000; // 5 hours
        sendWarningDM(message, reason);
        await member.timeout(duration, `Zero Tolerance: ${reason} (Strike ${strikes})`).catch(() => {});
    } 
    else if (strikes === 4) {
        actionTaken = "Message Deleted + Warning + 2 Days Timeout (4th Offense)";
        duration = 2 * 24 * 60 * 60 * 1000; // 2 days
        sendWarningDM(message, reason);
        await member.timeout(duration, `Zero Tolerance: ${reason} (Strike ${strikes})`).catch(() => {});
    } 
    else if (strikes >= 5) {
        actionTaken = "Message Deleted + Warning + Permanent Ban (5th+ Offense)";
        sendWarningDM(message, reason);
        await member.ban({ reason: `Zero Tolerance: ${reason} (Strike ${strikes})` }).catch(() => {});
    }

    // Send Staff Alert with Screenshot
    await sendStaffAlert(message, reason, strikes, actionTaken);
}

// Helper: Send Warning DM
async function sendWarningDM(message, reason) {
    const dmEmbed = new EmbedBuilder()
        .setTitle("⚠️ ERROR EXE OFFICIAL — AUTOMATED SECURITY WARNING")
        .setColor("Red")
        .setDescription(`Hello ${message.author},`)
        .addFields(
            { name: "━━━━━━━━━━━━━━", value: "📌 DETECTED ACTIVITY:" },
            { name: "• Toxic / Offensive Language", value: reason.includes("Toxic") ? "✅ Detected" : "❌", inline: true },
            { name: "• Spam Messages", value: reason.includes("Spam") ? "✅ Detected" : "❌", inline: true }
        )
        .addFields({
            name: "━━━━━━━━━━━━━━",
            value: `**You have been punished for violating server rules.**\nStrike: **${strikeDB.get(`${message.guild.id}-${message.author.id}`)}**\nOur system has **ZERO TOLERANCE**.`
        })
        .setFooter({ text: "— ERROR EXE OFFICIAL SECURITY SYSTEM" });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});
}

// Helper: Send Staff Alert + Screenshot
async function sendStaffAlert(message, reason, strikes, actionTaken) {
    const staffBaseEmbed = new EmbedBuilder()
        .setTitle("🚨 ERROR EXE OFFICIAL — STAFF ALERT")
        .setColor("Orange")
        .addFields(
            { name: "👤 Punished User", value: `${message.author.tag} (${message.author.id})` },
            { name: "📍 Channel", value: `<#${message.channel.id}>` },
            { name: "📌 Reason", value: reason },
            { name: "🔢 Strike", value: `${strikes}` },
            { name: "🤖 Action Taken", value: actionTaken },
            { name: "🕒 Time", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
        )
        .setFooter({ text: "Zero Tolerance Mode • ERROR EXE OFFICIAL" });

    const deletedMsgEmbed = new EmbedBuilder()
        .setAuthor({
            name: `${message.author.tag} - Deleted Message`,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription(
            message.content?.length > 4096 
                ? message.content.slice(0, 4090) + "..." 
                : (message.content?.length > 0 ? message.content : "*No text content*")
        )
        .setFooter({ text: `Message ID: ${message.id}` })
        .setTimestamp(message.createdTimestamp)
        .setColor("Red");

    if (message.attachments.size > 0) {
        deletedMsgEmbed.setImage(message.attachments.first().url);
    }

    // Send to all whitelisted staff
    const guildId = message.guild.id;
    for (const [mapKey, level] of whitelistDB.entries()) {
        if (mapKey.startsWith(guildId + "-")) {
            const staffId = mapKey.split("-")[1];
            const staffUser = await message.client.users.fetch(staffId).catch(() => null);
            if (staffUser) {
                staffUser.send({ embeds: [staffBaseEmbed, deletedMsgEmbed] }).catch(() => {});
            }
        }
    }

    // Send to Server Owner
    const owner = await message.client.users.fetch(message.guild.ownerId).catch(() => null);
    if (owner) {
        owner.send({ embeds: [staffBaseEmbed, deletedMsgEmbed] }).catch(() => {});
    }
}
