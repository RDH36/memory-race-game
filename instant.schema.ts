// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react-native";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $streams: i.entity({
      abortReason: i.string().optional(),
      clientId: i.string().unique().indexed(),
      done: i.boolean().optional(),
      size: i.number().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    games: i.entity({
      createdAt: i.number().indexed(),
      difficulty: i.string().indexed(),
      duration: i.number(),
      player1Id: i.string().indexed(),
      player2Id: i.string().optional(),
      player2Type: i.string(),
      scoreP1: i.number(),
      scoreP2: i.number(),
      winnerId: i.string().optional(),
    }),
    leaderboard: i.entity({
      bestStreak: i.number(),
      currentStreak: i.number(),
      gamesPlayed: i.number(),
      gamesWon: i.number(),
      points: i.number().indexed(),
      updatedAt: i.number().indexed(),
      userId: i.string().unique().indexed(),
    }),
    profiles: i.entity({
      avatar: i.string().optional(),
      createdAt: i.number().indexed(),
      nickname: i.string().unique().optional(),
      selectedTable: i.string().optional(),
      userId: i.string().unique().indexed(),
      // Builds economy — soft currency earned per game, spent on abilities.
      gold: i.number().optional(),
      // Equipped ability id (defaults to "tornado" when unset).
      equippedAbility: i.string().optional(),
      // JSON map of owned abilities -> level, e.g. {"freeze":2}.
      abilities: i.string().optional(),
    }),
    rooms: i.entity({
      appVersion: i.string().optional(),
      code: i.string().unique().indexed(),
      createdAt: i.number().indexed(),
      currentPlayerId: i.string().optional(),
      difficulty: i.string(),
      gameState: i.string().optional(),
      guestAvatar: i.string().optional(),
      guestId: i.string().optional(),
      guestNickname: i.string().optional(),
      hostAvatar: i.string(),
      hostId: i.string().indexed(),
      hostNickname: i.string(),
      lastMoveAt: i.number().optional(),
      matchmaking: i.boolean().indexed().optional(),
      startAt: i.number().optional(),
      status: i.string().indexed(),
      winnerId: i.string().optional(),
    }),
  },
  links: {
    $streams$files: {
      forward: {
        on: "$streams",
        has: "many",
        label: "$files",
      },
      reverse: {
        on: "$files",
        has: "one",
        label: "$stream",
        onDelete: "cascade",
      },
    },
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    gamesPlayer: {
      forward: {
        on: "games",
        has: "one",
        label: "player",
      },
      reverse: {
        on: "profiles",
        has: "many",
        label: "games",
      },
    },
    leaderboardProfile: {
      forward: {
        on: "leaderboard",
        has: "one",
        label: "profile",
      },
      reverse: {
        on: "profiles",
        has: "one",
        label: "leaderboard",
      },
    },
  },
  rooms: {},
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
