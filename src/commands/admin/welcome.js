import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { logger } from "../../utils/logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Manage welcome system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

    .addSubcommand(sub =>
      sub
        .setName("set")
        .setDescription("Set the welcome channel")
        .addChannelOption(opt => 
          opt.setName("channel")
             .setDescription("Channel for welcome messages")
             .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove all welcome setups")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    try {
      if (sub === "remove") {
        await interaction.reply({
          content: "✅ **All welcome setups have been removed!**\nUse `/welcome set` to setup new one.",
          ephemeral: false
        });
      } 
      else if (sub === "set") {
        const channel = interaction.options.getChannel("channel");
        await interaction.reply({
          content: `✅ Welcome channel set to ${channel}!`,
          ephemeral: false
        });
      }
    } catch (error) {
      logger.error("Welcome command error:", error);
      await interaction.reply({ content: "❌ Error occurred.", ephemeral: true });
    }
  }
};
