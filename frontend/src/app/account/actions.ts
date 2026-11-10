"use server";

import { createClient } from "@/lib/supabase/server";
import { isNotificationEmailConfigured, sendNotificationEmail } from "@/lib/notifications/email";

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

export async function dispatchMyNotificationEmailsAction(): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user || !isNotificationEmailConfigured()) return;

    const { data: notifications, error } = await supabase.rpc("claim_my_notification_emails");
    if (error || !notifications?.length) return;

    for (const notification of notifications) {
      try {
        await sendNotificationEmail(supabase, user.id, notification);
        await supabase.rpc("finish_my_notification_email", { notification_id: notification.id });
      } catch (sendError) {
        const message = sendError instanceof Error ? sendError.message : "Pošiljanje e-pošte ni uspelo.";
        await supabase.rpc("retry_my_notification_email", {
          notification_id: notification.id,
          error_message: message,
        });
      }
    }
  } catch {
    // Mail delivery is best effort; failed items stay in the durable outbox for retry.
  }
}
