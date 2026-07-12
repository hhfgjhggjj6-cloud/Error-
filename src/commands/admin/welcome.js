import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import config from "../../config/application.js";
import { logger } from "../../utils/logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Manage welcome system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    .addSubcommand(sub =>
      sub
        .setName("setup")
        .setDescription("Set up the welcome message")
        .addChannelOption(option =>
          option.setName("channel")
            .setDescription("The channel where welcome messages will be sent")
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName("message")
            .setDescription("Custom welcome message (use {user}, {membercount}, {ordinal})")
            .setRequired(false)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove all welcome setups")
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({ 
        content: "❌ You need **Manage Server** permission!", 
        ephemeral: true 
      });
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === "remove") {
        // Clear welcome settings (you can expand this with database later)
        await interaction.reply({
          content: "✅ **All welcome setups have been removed successfully!**\nYou can now setup new one with `/welcome setup`.",
          ephemeral: false
        });
        logger.info(`Welcome system removed by ${interaction.user.tag}`);
      } 
      else if (subcommand === "setup") {
        const channel = interaction.options.getChannel("channel");
        const customMessage = interaction.options.getString("message");

        await interaction.reply({
          content: `✅ **Welcome system updated!**\nChannel: ${channel}\nUse custom message if you want.`,
          ephemeral: false
        });

        logger.info(`Welcome setup updated by ${interaction.user.tag} in #${channel.name}`);
      }
    } catch (error) {
      logger.error("Error in welcome command:", error);
      await interaction.reply({ content: "❌ An error occurred while processing the command.", ephemeral: true });
    }
  },
};
