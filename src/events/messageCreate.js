import { Events, EmbedBuilder } from 'discord.js';
import { whitelistDB } from '../commands/Security/whitelist.js';
import { badwordsDB } from '../commands/Security/sr.js';

// Strike Counter
const strikeDB = new Map();

const ALLOWED_IMAGE_CHANNEL = "1503477652894388438";

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;
        const key = `${guildId}-${userId}`;

        // Skip whitelisted users
        if (whitelistDB.has(key)) return;

        // ========================
        // ANTI-MEDIA / ANTI-LINK SYSTEM
        // ========================
        const hasLink = /https?:\/\/[^\s]+/gi.test(message.content);
        const attachments = message.attachments;

        let violationReason = null;

        if (hasLink) {
            violationReason = "Link Posted";
        } 
        else if (attachments.size > 0) {
            let hasNonImage = false;
            let hasImage = false;

            attachments.forEach(att => {
                if (att.contentType && att.contentType.startsWith("image/")) {
                    hasImage = true;
                } else {
                    hasNonImage = true;
                }
            });

            if (message.channel.id === ALLOWED_IMAGE_CHANNEL) {
                // In allowed channel: Only images allowed → No files, no mixed
                if (hasNonImage) violationReason = "Non-Image File Posted";
            } else {
                // In other channels: No images and no files allowed
                violationReason = hasImage ? "Image Posted Outside Allowed Channel" : "File Posted Outside Allowed Channel";
            }
        }

        if (violationReason) {
            await punishMediaViolation(message, violationReason);
            return;
        }

        // ========================
        // OLD BADWORD + SPAM SYSTEM
        // ========================
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

// ========================
// MEDIA VIOLATION PUNISHMENT
// ========================
async function punishMediaViolation(message, reason) {
    const member = message.member;
    if (!member) return;

    message.delete().catch(() => {});

    // 30 Minutes Timeout
    try {
        await member.timeout(30 * 60 * 1000, reason);
    } catch (e) {}

    // Warning DM
    const dmEmbed = new EmbedBuilder()
        .setTitle("⚠️ ERROR EXE OFFICIAL — AUTOMATED SECURITY WARNING")
        .setColor("Red")
        .setDescription(`Hello ${message.author},`)
        .addFields(
            { name: "━━━━━━━━━━━━━━", value: "📌 DETECTED ACTIVITY:" },
            { name: "• Violation", value: reason }
        )
        .addFields({
            name: "━━━━━━━━━━━━━━",
            value: "**Images are only allowed in the designated media channel.**\nLinks and other files are not allowed anywhere."
        })
        .setFooter({ text: "— ERROR EXE OFFICIAL SECURITY SYSTEM" });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});

    // Send Staff Alert with Screenshot
    await sendStaffAlert(message, reason, "30 Minutes Timeout");
}

// ========================
// OLD PUNISHMENT SYSTEM (Spam + Badwords)
// ========================
async function punishUser(message, reason) {
    const member = message.member;
    if (!member) return;

    const guildId = message.guild.id;
    const userId = message.author.id;
    const strikeKey = `${guildId}-${userId}`;

    let strikes = strikeDB.get(strikeKey) || 0;
    strikes++;
    strikeDB.set(strikeKey, strikes);

    message.delete().catch(() => {});

    let actionTaken = "";

    if (strikes === 1) actionTaken = "Message Deleted (1st Offense)";
    else if (strikes === 2) {
        actionTaken = "Message Deleted + Warning (2nd Offense)";
        sendWarningDM(message, reason);
    }
    else if (strikes === 3) {
        actionTaken = "Message Deleted + Warning + 5 Hours Timeout (3rd Offense)";
        sendWarningDM(message, reason);
        await member.timeout(5 * 60 * 60 * 1000, `Zero Tolerance: ${reason}`).catch(() => {});
    }
    else if (strikes === 4) {
        actionTaken = "Message Deleted + Warning + 2 Days Timeout (4th Offense)";
        sendWarningDM(message, reason);
        await member.timeout(2 * 24 * 60 * 60 * 1000, `Zero Tolerance: ${reason}`).catch(() => {});
    }
    else if (strikes >= 5) {
        actionTaken = "Message Deleted + Warning + Permanent Ban (5th+ Offense)";
        sendWarningDM(message, reason);
        await member.ban({ reason: `Zero Tolerance: ${reason}` }).catch(() => {});
    }

    await sendStaffAlert(message, reason, actionTaken);
}

// Helper Functions (Same as before)
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
            value: `**Strike: ${strikeDB.get(`${message.guild.id}-${message.author.id}`)}**\nZero Tolerance Mode Active.`
        })
        .setFooter({ text: "— ERROR EXE OFFICIAL SECURITY SYSTEM" });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});
}

async function sendStaffAlert(message, reason, actionTaken) {
    const staffBaseEmbed = new EmbedBuilder()
        .setTitle("🚨 ERROR EXE OFFICIAL — STAFF ALERT")
        .setColor("Orange")
        .addFields(
            { name: "👤 Punished User", value: `${message.author.tag} (${message.author.id})` },
            { name: "📍 Channel", value: `<#${message.channel.id}>` },
            { name: "📌 Reason", value: reason },
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

    // Send to all whitelisted staff + Owner
    const guildId = message.guild.id;
    for (const [mapKey, level] of whitelistDB.entries()) {
        if (mapKey.startsWith(guildId + "-")) {
            const staffId = mapKey.split("-")[1];
            const staffUser = await message.client.users.fetch(staffId).catch(() => null);
            if (staffUser) staffUser.send({ embeds: [staffBaseEmbed, deletedMsgEmbed] }).catch(() => {});
        }
    }

    const owner = await message.client.users.fetch(message.guild.ownerId).catch(() => null);
    if (owner) owner.send({ embeds: [staffBaseEmbed, deletedMsgEmbed] }).catch(() => {});
}
