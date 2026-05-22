import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { whitelistDB } from './whitelist.js';

const badwordsDB = new Map();

export default {
    data: new SlashCommandBuilder()
        .setName('sr')
        .setDescription('Add swear words')
        .addStringOption(option => 
            option.setName('words')
                .setDescription('Words separated by comma')
                .setRequired(true)),

    async execute(interaction) {
        const key = `${interaction.guild.id}-${interaction.user.id}`;
        const level = whitelistDB.get(key);

        // Only Bot Access or higher can use this
        if (!level || !['full', 'botaccess'].includes(level)) {
            return interaction.reply({ content: "❌ You don't have permission to use this command!", ephemeral: true });
        }

        const words = interaction.options.getString('words').toLowerCase().split(',');
        const guildId = interaction.guild.id;

        let badwords = badwordsDB.get(guildId) || [];
        badwords = [...new Set([...badwords, ...words.map(w => w.trim())])];

        badwordsDB.set(guildId, badwords);

        await interaction.reply({ 
            content: `✅ Successfully added **${words.length}** bad words!`, 
            ephemeral: true 
        });
    }
};

export { badwordsDB };
