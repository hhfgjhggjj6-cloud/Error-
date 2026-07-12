import { Events, EmbedBuilder } from "discord.js";
import { getOrdinal } from "../utils/ordinal.js";
import config from "../config/application.js";
import { logger } from "../utils/logger.js";

export default {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      const guild = member.guild;
      const memberCount = guild.memberCount;
      const ordinal = getOrdinal(memberCount);

      // Find welcome channel (you can change logic)
      let welcomeChannel = guild.channels.cache.find(ch => 
        ch.name.toLowerCase().includes("welcome") || 
        ch.name.toLowerCase().includes("general")
      );

      if (!welcomeChannel) return;

      const isBot = member.user.bot ? "🤖 Bot" : "👤 Member";

      const embed = new EmbedBuilder()
        .setColor(config.bot.embeds.colors.primary || "#5865F2")
        .setTitle(`🎉 Welcome to ${guild.name}!`)
        .setDescription(
          `**${member} has joined the server!**\n` +
          `${isBot}\n` +
          `You are the **${ordinal}** member!`
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setTimestamp();

      await welcomeChannel.send({ embeds: [embed] });

      logger.info(`Welcomed ${member.user.tag} as ${ordinal} member`);

    } catch (error) {
      logger.error("Welcome event error:", error);
    }
  },
};
