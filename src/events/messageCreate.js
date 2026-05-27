import { Events, EmbedBuilder } from 'discord.js';
import { whitelistDB } from '../commands/Security/whitelist.js';
import { badwordsDB } from '../commands/Security/sr.js';

export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;
        const key = `${guildId}-${userId}`;

        // Skip punishment for whitelisted users
        if (whitelistDB.has(key)) return;

        const content = message.content.toLowerCase().trim();
        const badwords = badwordsDB.get(guildId) || [];

        let reason = null;
        let threat = "High";

        if (badwords.some(word => content.includes(word))) {
            reason = "Toxic / Offensive Language";
        } else if (message.channel.messages.cache.filter(m => m.author.id === userId).size >= 5) {
            reason = "Spam Messages";
        }

        if (reason) {
            await punishUser(message, reason, threat);
        }
    }
};

async function punishUser(message, reason, threat) {
    const member = message.member;
    if (!member) return;

    message.delete().catch(() => {});

    // Hard Punishment
    try {
        await member.timeout(30 * 60 * 1000, `Zero Tolerance: ${reason}`);
    } catch (e) {
        try {
            await member.kick(`Zero Tolerance: ${reason}`);
        } catch {}
    }

    // === DM to Punished User ===
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
            value: "**You have been punished for violating server rules.**\nOur system has **ZERO TOLERANCE**."
        })
        .setFooter({ text: "— ERROR EXE OFFICIAL SECURITY SYSTEM" });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});

    // ========================
    // STAFF ALERT + DELETED MESSAGE SCREENSHOT
    // ========================

    const staffBaseEmbed = new EmbedBuilder()
        .setTitle("🚨 ERROR EXE OFFICIAL — STAFF ALERT")
        .setColor("Orange")
        .addFields(
            { name: "👤 Punished User", value: `${message.author.tag} (${message.author.id})` },
            { name: "📍 Channel", value: `<#${message.channel.id}>` },
            { name: "📌 Reason", value: reason },
            { name: "🤖 Action Taken", value: "Timeout (30 Minutes)" },
            { name: "🕒 Time", value: `<t:${Math.floor(Date.now()/1000)}:F>` }
        )
        .setFooter({ text: "Zero Tolerance Mode • ERROR EXE OFFICIAL" });

    // === Deleted Message "Screenshot" Embed ===
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

    // Send to ALL Whitelisted Users
    const guildId = message.guild.id;
    for (const [mapKey, level] of whitelistDB.entries()) {
        if (mapKey.startsWith(guildId + "-")) {
            const staffId = mapKey.split("-")[1];
            const staffUser = await message.client.users.fetch(staffId).catch(() => null);
           
            if (staffUser) {
                staffUser.send({ 
                    embeds: [staffBaseEmbed, deletedMsgEmbed] 
                }).catch(() => {});
            }
        }
    }

    // Also send to Server Owner
    const owner = await message.client.users.fetch(message.guild.ownerId).catch(() => null);
    if (owner) {
        owner.send({ 
            embeds: [staffBaseEmbed, deletedMsgEmbed] 
        }).catch(() => {});
    }
}
