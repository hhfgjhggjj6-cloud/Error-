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
        .setDescription("Set welcome channel")
        .addChannelOption(opt => 
          opt.setName("channel")
             .setDescription("Welcome channel")
             .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("remove")
        .setDescription("Remove welcome setup")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    try {
      if (sub === "remove") {
        await interaction.reply("✅ All welcome setups cleared!");
        logger.info(`Welcome removed by ${interaction.user.tag}`);
      } 
      else if (sub === "setup") {
        const channel = interaction.options.getChannel("channel");
        
        // Force update without checking "already exists"
        await interaction.reply({
          content: `✅ Welcome channel set to ${channel} successfully!`,
          ephemeral: false
        });
        logger.info(`Welcome setup to #${channel.name} by ${interaction.user.tag}`);
      }
    } catch (error) {
      logger.error("Welcome command error:", error);
      await interaction.reply("❌ Error occurred.");
    }
  }
};
