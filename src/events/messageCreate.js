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
            value: "**Action Taken:** Timeout (30 Minutes)\n**Reason:** Zero Tolerance Mode"
        });

    message.author.send({ embeds: [dmEmbed] }).catch(() => {});

    // ========================
    // NEW: STAFF ALERT + DELETED MESSAGE "SCREENSHOT"
    // ========================

    const staffAlert = new EmbedBuilder()
        .setTitle("ERROR EXE OFFICIAL — STAFF ALERT")
        .addFields(
            { name: "Punished User", value: `${message.author.tag} (${message.author.id})`, inline: false },
            { name: "Channel", value: `${message.channel}`, inline: false },
            { name: "Reason", value: reason, inline: false },
            { name: "Action Taken", value: "Timeout (30 Minutes)", inline: false },
            { name: "Time", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
        )
        .setColor("Red")
        .setTimestamp();

    // Deleted Message Screenshot Embed
    const deletedMsgEmbed = new EmbedBuilder()
        .setAuthor({
            name: `${message.author.tag} - Deleted Message`,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription(message.content?.length > 0 ? message.content : "*No text content*")
        .setFooter({ text: `Message ID: ${message.id}` })
        .setTimestamp(message.createdTimestamp)
        .setColor("Orange");

    if (message.attachments.size > 0) {
        deletedMsgEmbed.setImage(message.attachments.first().url);
    }

    const logChannel = message.guild.channels.cache.get("YOUR_STAFF_LOG_CHANNEL_ID_HERE"); // ← Change this

    if (logChannel) {
        await logChannel.send({
            content: "Zero Tolerance Mode • ERROR EXE OFFICIAL",
            embeds: [staffAlert, deletedMsgEmbed]
        }).catch(console.error);
    }
}
