const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sr')
        .setDescription('Add swear words (Owner Only)')
        .addStringOption(option => 
            option.setName('words')
                .setDescription('Words separated by comma')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (interaction.user.id !== interaction.guild.ownerId) 
            return interaction.reply({ content: "❌ Owner only!", ephemeral: true });

        const words = interaction.options.getString('words').toLowerCase().split(',');
        let badwords = await db.get(`badwords.${interaction.guild.id}`) || [];
        
        badwords = [...new Set([...badwords, ...words.map(w => w.trim())])];

        await db.set(`badwords.${interaction.guild.id}`, badwords);

        interaction.reply({ content: `✅ Added **${words.length}** bad words to blacklist!`, ephemeral: true });
    }
};
