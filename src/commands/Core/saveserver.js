import { SlashCommandBuilder } from "discord.js";
import { getFromDb, setInDb } from "../../utils/database.js";
import { logger } from "../../utils/logger.js";
import { createEmbed } from "../../utils/embeds.js";
import crypto from "crypto";

export default {
    data: new SlashCommandBuilder()
        .setName("save")
        .setDescription("Owner only: Create full server backup (including owner's messages & files)")
        .addSubcommand(sub =>
            sub.setName("server").setDescription("Save complete server backup")
        ),

    async execute(interaction) {
        const ownerIds = process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',').map(id => id.trim()) : [];
        if (!ownerIds.includes(interaction.user.id)) {
            return interaction.reply({ content: "❌ Owner only command.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const guild = interaction.guild;
            const ownerId = interaction.user.id;

            const backup = {
                guildId: guild.id,
                guildName: guild.name,
                createdAt: Date.now(),
                ownerId: ownerId,
                roles: [],
                channels: [],
                ownerMessages: [],
                backupCode: "SV-" + crypto.randomBytes(8).toString('hex').toUpperCase()
            };

            // Save Roles
            backup.roles = guild.roles.cache
                .filter(r => !r.managed)
                .map(role => ({
                    name: role.name,
                    color: role.color,
                    hoist: role.hoist,
                    permissions: role.permissions.bitfield.toString()
                }));

            // Save Channel Structure
            guild.channels.cache.forEach(channel => {
                if (channel.type === 4) { // Category
                    backup.channels.push({
                        type: "category",
                        name: channel.name,
                        position: channel.position
                    });
                } else if (channel.isTextBased()) {
                    backup.channels.push({
                        type: "text",
                        name: channel.name,
                        position: channel.position,
                        parent: channel.parent ? channel.parent.name : null
                    });
                }
            });

            // === SAVE ALL MESSAGES & FILES SENT BY OWNER ===
            await interaction.editReply({ content: "🔍 Scanning all channels for your messages... This may take a while." });

            const textChannels = guild.channels.cache.filter(ch => ch.isTextBased());

            for (const channel of textChannels.values()) {
                try {
                    let lastId = null;
                    let fetched = 0;

                    while (true) {
                        const options = { limit: 100 };
                        if (lastId) options.before = lastId;

                        const messages = await channel.messages.fetch(options);
                        if (messages.size === 0) break;

                        for (const msg of messages.values()) {
                            if (msg.author.id === ownerId) {
                                const attachments = msg.attachments.map(att => ({
                                    name: att.name,
                                    url: att.url,
                                    size: att.size
                                }));

                                backup.ownerMessages.push({
                                    channelName: channel.name,
                                    content: msg.content,
                                    timestamp: msg.createdTimestamp,
                                    attachments: attachments
                                });
                            }
                        }

                        lastId = messages.last().id;
                        fetched += messages.size;

                        if (messages.size < 100) break;
                    }
                } catch (err) {
                    logger.warn(`Could not scan channel ${channel.name}: ${err.message}`);
                }
            }

            // Save backup
            await setInDb(`server_backup:${backup.backupCode}`, backup, 60 * 60 * 24 * 30); // 30 days

            const embed = createEmbed({
                title: "✅ Full Server Backup Created",
                description: `**Backup Code:** \`${backup.backupCode}\``,
                color: "success"
            });

            embed.addFields(
                { name: "📊 Saved", value: 
                    `${backup.roles.length} Roles\n` +
                    `${backup.channels.length} Channels\n` +
                    `${backup.ownerMessages.length} Messages from Owner (with files)`, 
                inline: false }
            );

            await interaction.editReply({ embeds: [embed] });

            logger.info(`Full server backup created: ${backup.backupCode} | Messages: ${backup.ownerMessages.length}`);

        } catch (error) {
            logger.error("Save server error:", error);
            await interaction.editReply({ content: "❌ Failed to create backup. Please try again." });
        }
    }
};
