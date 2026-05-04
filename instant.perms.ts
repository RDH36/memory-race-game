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
      // `data` = old/saved state, `newData` = values being written.
      // Block updates after status=finished/forfeit so a client can't rewrite
      // winnerId/scores post-game. The legitimate playing→finished write passes
      // because data.status (old) is still 'playing' at evaluation time.
      update:
        "(auth.id == data.hostId || auth.id == data.guestId) && data.status != 'finished' && data.status != 'forfeit'",
      delete: "auth.id == data.hostId",
    },
  },
} satisfies InstantRules;

export default rules;
