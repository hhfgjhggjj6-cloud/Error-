import { Events, EmbedBuilder } from "discord.js";
import { getOrdinal } from "../utils/ordinal.js";   // We'll create this
import config from "../config/application.js";
import { logger } from "../utils/logger.js";

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const guild = member.guild;
      const memberCount = guild.memberCount;
      const ordinal = getOrdinal(memberCount);

      // Welcome Channel (change if you have different setting)
      const welcomeChannel = guild.channels.cache.find(
        ch => ch.name.toLowerCase().includes("welcome") || 
              ch.name.toLowerCase().includes("general")
      );

      if (!welcomeChannel) return;

      const welcomeEmbed = new EmbedBuilder()
        .setColor(config.bot.embeds.colors.primary || "#5865F2")
        .setTitle("🎉 New Member!")
        .setDescription(
          `**WELCOME ${member} To The SERVER!**\n` +
          `You are the **${ordinal}** MEMBER!`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setTimestamp();

      await welcomeChannel.send({ embeds: [welcomeEmbed] });

      // Optional: Auto role
      // const autoRole = guild.roles.cache.get("ROLE_ID_HERE");
      // if (autoRole) await member.roles.add(autoRole);

    } catch (error) {
      logger.error("Error in welcome event:", error);
    }
  },
};
