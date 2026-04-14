import type { InstantRules } from "@instantdb/core";

const rules = {
  profiles: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id == data.userId",
      delete: "false",
    },
  },
  games: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "false",
      delete: "false",
    },
  },
  leaderboard: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id == data.userId",
      delete: "false",
    },
  },
  rooms: {
    allow: {
      view: "true",
      create: "auth.id != null",
      update: "auth.id == data.hostId || auth.id == data.guestId",
      delete: "auth.id == data.hostId",
    },
  },
} satisfies InstantRules;

export default rules;
