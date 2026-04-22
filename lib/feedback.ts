import { Platform } from "react-native";
import { supabase } from "./supabase";

export type FeedbackCategory = "bug" | "feature" | "question" | "other";

const PROJECT_SLUG = "flipia";
const APP_VERSION = "1.0.0";

export async function submitFeedback(input: {
  category: FeedbackCategory;
  message: string;
  email?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("feedback").insert({
      project: PROJECT_SLUG,
      category: input.category,
      message: input.message.trim(),
      email: input.email?.trim() || null,
      app_version: APP_VERSION,
      device_platform: Platform.OS,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? "Unknown error" };
  }
}
