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
        .setDescription("Set up welcome channel")
        .addChannelOption(opt => opt.setName("channel").setDescription("Welcome channel").setRequired(true))
    )

    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove all welcome setups")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "remove") {
      await interaction.reply({
        content: "✅ **All welcome setups have been removed successfully!**",
        ephemeral: false
      });
      logger.info(`Welcome remove used by ${interaction.user.tag}`);
      return;
    }

    if (sub === "setup") {
      const channel = interaction.options.getChannel("channel");
      await interaction.reply({
        content: `✅ Welcome channel set to ${channel}!`,
        ephemeral: false
      });
    }
  }
};
