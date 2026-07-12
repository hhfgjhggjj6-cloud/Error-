import { logger } from '../utils/logger.js';

export const botConfig = {
  // =========================
  // BOT PRESENCE (what users see under the bot name)
  // =========================
  presence: {
    status: "online",   // Change to "dnd" or "idle" if you want

    activities: [
      {
        name: "Made with ❤️ | /help",
        type: 0,   // 0 = Playing
      },
    ],
  },

  // =========================
  // COMMAND BEHAVIOR
  // =========================
  commands: {
    owners: process.env.OWNER_IDS?.split(",") || [],
    defaultCooldown: 3, 
    deleteCommands: false,
    testGuildId: process.env.TEST_GUILD_ID,
  },

  // =========================
  // APPLICATIONS SYSTEM
  // =========================
  applications: {
    defaultQuestions: [
      { question: "What is your name?", required: true },
      { question: "How old are you?", required: true },
      { question: "Why do you want to join?", required: true },
    ],
    statusColors: {
      pending: "#FFA500",
      approved: "#00FF00",
      denied: "#FF0000",
    },
    applicationCooldown: 24, 
    deleteDeniedAfter: 7, 
    deleteApprovedAfter: 30, 
    managerRoles: [],
  },

  // =========================
  // EMBED COLORS & BRANDING
  // =========================
  embeds: {
    colors: {
      primary: "#336699", 
      secondary: "#2F3136", 
      success: "#57F287", 
      error: "#ED4245", 
      warning: "#FEE75C", 
      info: "#3498DB", 
      light: "#FFFFFF",
      dark: "#202225",
      gray: "#99AAB5",
      blurple: "#5865F2",
      green: "#57F287",
      yellow: "#FEE75C",
      fuchsia: "#EB459E",
      red: "#ED4245",
      black: "#000000",
      giveaway: { active: "#57F287", ended: "#ED4245" },
      ticket: {
        open: "#57F287",
        claimed: "#FAA61A",
        closed: "#ED4245",
        pending: "#99AAB5",
      },
      economy: "#F1C40F",
      birthday: "#E91E63",
      moderation: "#9B59B6",
      priority: {
        none: "#95A5A6",
        low: "#3498db",
        medium: "#2ecc71",
        high: "#f1c40f",
        urgent: "#e74c3c",
      },
    },
    footer: {
      text: "Titan Bot",
      icon: null,
    },
    thumbnail: null,
    author: {
      name: null,
      icon: null,
      url: null,
    },
  },

  // =========================
  // ECONOMY SETTINGS (rest remains same)
  // =========================
  economy: {
    currency: { name: "coins", namePlural: "coins", symbol: "$" },
    startingBalance: 0,
    baseBankCapacity: 100000,
    dailyAmount: 100,
    workMin: 10,
    workMax: 100,
    begMin: 5,
    begMax: 50,
    robSuccessRate: 0.4,
    robFailJailTime: 3600000, 
  },

  shop: {},
  tickets: { defaultCategory: null, supportRoles: [], priorities: { /* ... */ }, defaultPriority: "none", archiveCategory: null, logChannel: null },
  giveaways: { defaultDuration: 86400000, minimumWinners: 1, maximumWinners: 10, minimumDuration: 300000, maximumDuration: 2592000000, allowedRoles: [], bypassRoles: [] },
  birthday: { defaultRole: null, announcementChannel: null, timezone: "UTC" },
  verification: { /* long config */ defaultMessage: "Click the button below to verify yourself...", /* ... keep original */ },
  welcome: { defaultWelcomeMessage: "Welcome {user} to {server}! We now have {memberCount} members!", defaultGoodbyeMessage: "{user} has left the server...", defaultWelcomeChannel: null, defaultGoodbyeChannel: null },
  counters: { /* keep original */ },
  messages: { /* keep original */ },
  features: { /* keep original */ }
};

export default botConfig;
