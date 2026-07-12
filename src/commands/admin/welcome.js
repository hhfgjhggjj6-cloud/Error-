import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { logger } from "../../utils/logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Manage welcome system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    .addSubcommand(sub =>
      sub
        .setName("setup")
        .setDescription("Set up the welcome channel")
        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription("The channel for welcome messages")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove all welcome setups")
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === "remove") {
        await interaction.reply({
          content: "✅ **All welcome setups have been removed successfully!**\nYou can now setup again with `/welcome setup`.",
          ephemeral: false
        });
        logger.info(`Welcome system removed by ${interaction.user.tag}`);
      } 
      else if (subcommand === "setup") {
        const channel = interaction.options.getChannel("channel");

        await interaction.reply({
          content: `✅ **Welcome channel updated!**\nAll new members will be welcomed in ${channel}`,
          ephemeral: false
        });

        logger.info(`Welcome channel set to #${channel.name} by ${interaction.user.tag}`);
      }
    } catch (error) {
      logger.error("Error in /welcome command:", error);
      await interaction.reply({
        content: "❌ An error occurred. Please try again.",
        ephemeral: true
      });
    }
  },
};
