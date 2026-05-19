import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export const whitelistDB = new Map(); // In-memory storage

export default {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Whitelist a user (Bot Owner Only)')
        .addUserOption(option => option.setName('user').setDescription('User to whitelist').setRequired(true))
        .addStringOption(option =>
            option.setName('level')
                .setDescription('Permission Level')
                .setRequired(true)
                .addChoices(
                    { name: 'Full Access (Can do everything)', value: 'full' },
                    { name: 'Moderator', value: 'mod' },
                    { name: 'Safe (Normal)', value: 'safe' },
                    { name: 'Spam Allowed Only', value: 'spam' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        // Read from Railway Environment Variable
        const BOT_OWNER_ID = process.env.BOT_OWNER_ID;
        if (!BOT_OWNER_ID || !BOT_OWNER_ID.split(',').map(id => id.trim()).includes(interaction.user.id)) {
            return interaction.reply({ 
                content: "❌ **Only the Bot Owner** can use this!", 
                ephemeral: true 
            });
        }

        const target = interaction.options.getUser('user');
        const level = interaction.options.getString('level');
        const key = `${interaction.guild.id}-${target.id}`;

        whitelistDB.set(key, level);

        const embed = new EmbedBuilder()
            .setTitle("✅ User Whitelisted")
            .setColor("Gold")
            .setDescription(`**${target.tag}** has been whitelisted with level: **${level}**`);

        await interaction.reply({ embeds: [embed] });
    }
};
