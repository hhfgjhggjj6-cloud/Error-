import { Events } from "discord.js";
import { logger, startupLog } from "../utils/logger.js";
import config from "../config/application.js";

export default {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    try {
      // Force Online Status
      await client.user.setPresence({
        status: "online",
        activities: [{
          name: "Made with ❤️ | /help",
          type: 0
        }]
      });

      startupLog(`✅ Ready! Logged in as ${client.user.tag}`);
      startupLog(`Serving ${client.guilds.cache.size} guild(s)`);

    } catch (error) {
      logger.error("Ready event error:", error);
      client.user.setStatus("online"); // Fallback
    }
  },
};
