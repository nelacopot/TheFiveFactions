import { NextResponse } from "next/server";
import { isNotificationEmailConfigured, sendNotificationEmail } from "@/lib/notifications/email";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.NOTIFICATION_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isNotificationEmailConfigured()) {
    return NextResponse.json({ error: "SMTP is not configured" }, { status: 503 });
  }

  const supabase = createAdminClient();
  const { data: notifications, error } = await supabase.rpc("claim_notification_emails_for_dispatch");
  if (error) return NextResponse.json({ error: "Could not claim notifications" }, { status: 500 });

  let sent = 0;
  let failed = 0;
  for (const notification of notifications ?? []) {
    try {
      await sendNotificationEmail(supabase, notification.user_id, notification);
      await supabase.from("notification_outbox")
        .update({ status: "sent", sent_at: new Date().toISOString(), locked_at: null, last_error: null })
        .eq("id", notification.id).eq("status", "sending");
      sent += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Email delivery failed.";
      const { data: current } = await supabase.from("notification_outbox")
        .select("attempt_count").eq("id", notification.id).maybeSingle();
      const attempts = (current?.attempt_count ?? 0) + 1;
      await supabase.from("notification_outbox").update({
        status: "pending",
        attempt_count: attempts,
        next_attempt_at: new Date(Date.now() + Math.min(3_600, 30 * 2 ** Math.min(attempts - 1, 7)) * 1000).toISOString(),
        locked_at: null,
        last_error: message.slice(0, 1000),
      }).eq("id", notification.id).eq("status", "sending");
      failed += 1;
    }
  }

  return NextResponse.json({ sent, failed });
}
