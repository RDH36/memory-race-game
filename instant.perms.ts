// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react-native";

const rules = {
  games: {
    allow: {
      view: "true",
      create: "auth.id != null",
      delete: "false",
      update: "false",
    },
  },
  rooms: {
    allow: {
      view: "true",
      create: "auth.id != null",
      delete: "auth.id == data.hostId",
      update: "auth.id == data.hostId || auth.id == data.guestId",
    },
  },
  profiles: {
    allow: {
      view: "true",
      create: "auth.id != null",
      delete: "false",
      update: "auth.id == data.userId",
    },
  },
  leaderboard: {
    allow: {
      view: "true",
      create: "auth.id != null",
      delete: "false",
      update: "auth.id == data.userId",
    },
  },
} satisfies InstantRules;

export default rules;
