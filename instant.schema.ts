import { i } from "@instantdb/core";

const _schema = i.schema({
  entities: {
    profiles: i.entity({
      userId: i.string().unique().indexed(),
      nickname: i.string().unique().optional(),
      avatar: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
    games: i.entity({
      difficulty: i.string().indexed(),
      winnerId: i.string().optional(),
      player1Id: i.string().indexed(),
      player2Type: i.string(), // 'cpu' | 'human'
      player2Id: i.string().optional(),
      scoreP1: i.number(),
      scoreP2: i.number(),
      duration: i.number(),
      createdAt: i.number().indexed(),
    }),
    leaderboard: i.entity({
      userId: i.string().unique().indexed(),
      gamesPlayed: i.number(),
      gamesWon: i.number(),
      currentStreak: i.number(),
      bestStreak: i.number(),
      points: i.number().indexed(),
      updatedAt: i.number().indexed(),
    }),
  },
  links: {
    profileGames: {
      forward: {
        on: "games",
        has: "one",
        label: "player",
      },
      reverse: { on: "profiles", has: "many", label: "games" },
    },
    profileLeaderboard: {
      forward: {
        on: "leaderboard",
        has: "one",
        label: "profile",
      },
      reverse: { on: "profiles", has: "one", label: "leaderboard" },
    },
  },
  rooms: {},
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
