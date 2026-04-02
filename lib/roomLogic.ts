import { db } from "@/lib/instant";
import { id, tx } from "@instantdb/react-native";
import { initGame, type CpuDifficulty, type LocalGameState } from "./gameLogic";
import { APP_VERSION } from "./constants";

export interface RoomData {
  id: string;
  code: string;
  hostId: string;
  guestId?: string;
  hostNickname: string;
  hostAvatar: string;
  guestNickname?: string;
  guestAvatar?: string;
  difficulty: string;
  status: "waiting" | "playing" | "finished" | "forfeit";
  gameState?: string;
  currentPlayerId?: string;
  lastMoveAt?: number;
  winnerId?: string;
  startAt?: number;
  appVersion?: string;
  matchmaking?: boolean;
  createdAt: number;
}

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 for clarity

export function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function createRoom(
  hostId: string,
  hostNickname: string,
  hostAvatar: string,
  difficulty: CpuDifficulty,
): Promise<{ roomId: string; code: string }> {
  const roomId = id();
  const code = generateRoomCode();

  await db.transact(
    tx.rooms[roomId].update({
      code,
      hostId,
      hostNickname,
      hostAvatar,
      difficulty,
      status: "waiting",
      appVersion: APP_VERSION,
      createdAt: Date.now(),
    }),
  );

  return { roomId, code };
}

export async function joinRoom(
  code: string,
  guestId: string,
  guestNickname: string,
  guestAvatar: string,
): Promise<{ roomId: string; error?: string }> {
  const { data } = await db.queryOnce({
    rooms: { $: { where: { code: code.toUpperCase() } } },
  });

  const room = data?.rooms?.[0];
  if (!room) return { roomId: "", error: "notFound" };
  if (room.guestId) return { roomId: "", error: "full" };
  if (room.status !== "waiting") return { roomId: "", error: "started" };

  // Version check
  const roomVersion = (room as { appVersion?: string }).appVersion;
  if (roomVersion && roomVersion !== APP_VERSION) {
    if (roomVersion > APP_VERSION) return { roomId: "", error: "versionOld" };
    return { roomId: "", error: "versionNew" };
  }

  await db.transact(
    tx.rooms[room.id].update({
      guestId,
      guestNickname,
      guestAvatar,
    }),
  );

  return { roomId: room.id };
}

export function initRoomGame(
  difficulty: CpuDifficulty,
  hostId: string,
  guestId: string,
): { gameState: string; currentPlayerId: string } {
  const game = initGame(difficulty);
  const firstIsHost = Math.random() < 0.5;
  const currentPlayerId = firstIsHost ? hostId : guestId;
  // currentTurn 1 = host, 2 = guest
  game.currentTurn = firstIsHost ? 1 : 2;

  return {
    gameState: JSON.stringify(game),
    currentPlayerId,
  };
}

export async function startRoom(
  roomId: string,
  difficulty: CpuDifficulty,
  hostId: string,
  guestId: string,
) {
  const { gameState, currentPlayerId } = initRoomGame(
    difficulty,
    hostId,
    guestId,
  );
  const now = Date.now();

  await db.transact(
    tx.rooms[roomId].update({
      status: "playing",
      gameState,
      currentPlayerId,
      lastMoveAt: now + 10000, // after countdown
      startAt: now + 10000,
    }),
  );
}

export async function updateRoomGameState(
  roomId: string,
  newState: LocalGameState,
  currentPlayerId: string,
  finished?: { winnerId?: string },
) {
  const updates: Record<string, unknown> = {
    gameState: JSON.stringify(newState),
    currentPlayerId,
    lastMoveAt: Date.now(),
  };

  if (finished) {
    updates.status = "finished";
    updates.winnerId = finished.winnerId;
  }

  await db.transact(tx.rooms[roomId].update(updates));
}

export async function forfeitRoom(roomId: string, winnerId: string) {
  await db.transact(
    tx.rooms[roomId].update({
      status: "forfeit",
      winnerId,
    }),
  );
}

export async function deleteRoom(roomId: string) {
  await db.transact(tx.rooms[roomId].delete());
}

const DIFFICULTIES: CpuDifficulty[] = ["easy", "medium", "hard"];

function randomDifficulty(): CpuDifficulty {
  return DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];
}

export async function findMatchmakingRoom(
  userId: string,
): Promise<RoomData | null> {
  const { data } = await db.queryOnce({
    rooms: {
      $: {
        where: {
          matchmaking: true,
          status: "waiting",
        },
      },
    },
  });

  const rooms = (data?.rooms ?? []) as RoomData[];
  // Find a room where we're not the host and no guest yet
  return rooms.find((r) => r.hostId !== userId && !r.guestId) ?? null;
}

export async function createMatchmakingRoom(
  hostId: string,
  hostNickname: string,
  hostAvatar: string,
): Promise<{ roomId: string; code: string; difficulty: CpuDifficulty }> {
  const roomId = id();
  const code = generateRoomCode();
  const difficulty = randomDifficulty();

  await db.transact(
    tx.rooms[roomId].update({
      code,
      hostId,
      hostNickname,
      hostAvatar,
      difficulty,
      status: "waiting",
      matchmaking: true,
      appVersion: APP_VERSION,
      createdAt: Date.now(),
    }),
  );

  return { roomId, code, difficulty };
}

export async function joinMatchmakingRoom(
  room: RoomData,
  guestId: string,
  guestNickname: string,
  guestAvatar: string,
): Promise<{ roomId: string; error?: string }> {
  // Re-check room is still available
  const { data } = await db.queryOnce({
    rooms: { $: { where: { id: room.id } } },
  });
  const current = data?.rooms?.[0] as RoomData | undefined;
  if (!current || current.guestId || current.status !== "waiting") {
    return { roomId: "", error: "full" };
  }

  // Version check
  if (current.appVersion && current.appVersion !== APP_VERSION) {
    if (current.appVersion > APP_VERSION) return { roomId: "", error: "versionOld" };
    return { roomId: "", error: "versionNew" };
  }

  await db.transact(
    tx.rooms[room.id].update({
      guestId,
      guestNickname,
      guestAvatar,
    }),
  );

  return { roomId: room.id };
}

export function useRoom(code: string | undefined) {
  const { data, isLoading } = db.useQuery(
    code ? { rooms: { $: { where: { code: code.toUpperCase() } } } } : null,
  );
  const room = (data?.rooms?.[0] as RoomData | undefined) ?? null;
  return { room, isLoading };
}

export function useRoomById(roomId: string | undefined) {
  const { data, isLoading } = db.useQuery(
    roomId ? { rooms: { $: { where: { id: roomId } } } } : null,
  );
  const room = (data?.rooms?.[0] as RoomData | undefined) ?? null;
  return { room, isLoading };
}
