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
      // Three OR-clauses cover every legitimate writer:
      //  1. data.hostId == auth.id          → host updating their own room
      //  2. data.guestId == auth.id         → guest updating after they joined
      //  3. newData.guestId == auth.id      → guest joining for the first time
      //     (data.guestId is null at this point, so clause 2 fails — clause 3
      //     accepts the write only if the joiner sets themselves, not someone else)
      update:
        "auth.id == data.hostId || auth.id == data.guestId || auth.id == newData.guestId",
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
