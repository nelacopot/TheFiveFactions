"use server";

import { createClient } from "@/lib/supabase/server";

export async function ensureCurrentWeekTaskAssignmentsAction(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return false;

    const { error } = await supabase.rpc("ensure_current_week_task_assignments");
    return !error;
  } catch {
    return false;
  }
}
