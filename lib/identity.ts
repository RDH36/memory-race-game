import { db } from "@/lib/instant";
import { id, tx } from "@instantdb/react-native";

// --- Auth ---

export function useCurrentUser() {
  const { isLoading, user, error } = db.useAuth();
  return { user, isLoading, error };
}

export async function ensureSignedIn() {
  try {
    const user = await db.getAuth();
    return user;
  } catch {
    await db.auth.signInAsGuest();
    return db.getAuth();
  }
}

// --- Profile ---

export function useProfile(userId: string | undefined) {
  const { data, isLoading } = db.useQuery(
    userId ? { profiles: { $: { where: { userId } } } } : null,
  );
  const profile = data?.profiles?.[0] ?? null;
  return { profile, isLoading };
}

export async function saveProfile(
  userId: string,
  profileId: string | null,
  updates: { nickname?: string; avatar?: string; selectedTable?: string },
) {
  if (profileId) {
    await db.transact(tx.profiles[profileId].update(updates));
  } else {
    const newId = id();
    await db.transact(
      tx.profiles[newId].update({
        userId,
        createdAt: Date.now(),
        ...updates,
      }),
    );
  }
}
