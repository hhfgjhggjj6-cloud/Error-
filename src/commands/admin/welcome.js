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
        .setName("set")
        .setDescription("Set welcome channel")
        .addChannelOption(option =>
          option
            .setName("channel")
            .setDescription("The channel where welcome messages will be sent")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove all welcome setups and channels")
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: "❌ You need **Manage Server** permission to use this command!",
        ephemeral: true
      });
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      if (subcommand === "remove") {
        // You can expand this to clear database settings if you have any
        await interaction.reply({
          content: "✅ All welcome channels and settings have been removed successfully!\nYou can now set a new one using `/welcome set`.",
          ephemeral: false
        });

        logger.info(`Welcome system removed by ${interaction.user.tag}`);
      } 
      
      else if (subcommand === "set") {
        const channel = interaction.options.getChannel("channel");

        if (!channel) {
          return interaction.reply({
            content: "❌ Please select a valid text channel!",
            ephemeral: true
          });
        }

        if (channel.type !== 0) { // 0 = Text Channel
          return interaction.reply({
            content: "❌ Please select a **text channel** only!",
            ephemeral: true
          });
        }

        await interaction.reply({
          content: `✅ **Welcome system updated!**\nWelcome messages will now be sent to ${channel}`,
          ephemeral: false
        });

        logger.info(`Welcome channel set to #${channel.name} by ${interaction.user.tag}`);
      }
    } catch (error) {
      logger.error("Error in welcome command:", error);
      await interaction.reply({
        content: "❌ An error occurred while setting up welcome system.",
        ephemeral: true
      });
    }
  },
};
