import type { InstantRules } from "@instantdb/core";

const rules = {
  profiles: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "true",
    },
  },
  games: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "true",
    },
  },
  leaderboard: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "true",
    },
  },
} satisfies InstantRules;

export default rules;
