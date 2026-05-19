import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

const BOT_OWNERS = ["858482656252657674", "1409273535238508585"];
export const whitelistDB = new Map();

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
                    { name: 'Full Access', value: 'full' },
                    { name: 'Moderator', value: 'mod' },
                    { name: 'Safe', value: 'safe' },
                    { name: 'Spam Allowed', value: 'spam' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!BOT_OWNERS.includes(interaction.user.id)) {
            return interaction.reply({ content: "❌ Only Bot Owner can use this!", ephemeral: true });
        }

        const target = interaction.options.getUser('user');
        const level = interaction.options.getString('level');
        const key = `${interaction.guild.id}-${target.id}`;

        whitelistDB.set(key, level);

        const embed = new EmbedBuilder()
            .setTitle("✅ User Whitelisted")
            .setColor("Gold")
            .setDescription(`**${target.tag}** whitelisted with level: **${level}**`);

        await interaction.reply({ embeds: [embed] });
    }
};
