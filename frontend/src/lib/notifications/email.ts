import nodemailer from "nodemailer";
import type { SupabaseClient } from "@supabase/supabase-js";

type PendingNotification = {
  id: string;
  recipient_email: string;
  event_type: string;
  payload: Record<string, unknown>;
};

function getTransport() {
  const smtpUrl = process.env.SMTP_URL ??
    (process.env.NODE_ENV === "development" ? "smtp://127.0.0.1:54325" : undefined);
  if (!smtpUrl) return null;
  return nodemailer.createTransport(smtpUrl);
}

export function isNotificationEmailConfigured() {
  return Boolean(process.env.SMTP_URL || process.env.NODE_ENV === "development");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character] ?? character);
}

async function weeklyTasksContent(
  supabase: SupabaseClient,
  userId: string,
  payload: Record<string, unknown>,
) {
  const weekStart = String(payload.week_start_date ?? "");
  const factionId = Number(payload.faction_id);
  const factionName = String(payload.faction_name ?? "ločino");
  const { data: assignments } = await supabase
    .from("task_assignments")
    .select("task_id, due_date, status")
    .eq("user_id", userId)
    .eq("week_start_date", weekStart)
    .neq("status", "cancelled");
  const taskIds = (assignments ?? []).map((assignment) => assignment.task_id);
  const { data: tasks } = taskIds.length
    ? await supabase.from("tasks").select("id, title, faction_id").in("id", taskIds).eq("faction_id", factionId)
    : { data: [] };
  const factionTasks = tasks ?? [];
  const assignmentByTask = new Map((assignments ?? []).map((assignment) => [assignment.task_id, assignment]));
  const rows = factionTasks.map((task) => {
    const assignment = assignmentByTask.get(task.id);
    return `<li><strong>${escapeHtml(task.title)}</strong> — rok ${escapeHtml(String(assignment?.due_date ?? ""))}</li>`;
  }).join("");
  return {
    subject: `Nove tedenske naloge · ${factionName}`,
    text: `Na voljo so nove tedenske naloge za ločino ${factionName}. Odpri The Five Factions za pregled nalog.`,
    html: `<p>Na voljo so nove tedenske naloge za ločino <strong>${escapeHtml(factionName)}</strong>.</p><ul>${rows}</ul><p>Odpri The Five Factions za pregled nalog in njihovih statusov.</p>`,
  };
}

export async function sendNotificationEmail(
  supabase: SupabaseClient,
  userId: string,
  notification: PendingNotification,
) {
  const transport = getTransport();
  if (!transport) throw new Error("SMTP ni konfiguriran.");

  let content: { subject: string; text: string; html: string };
  if (notification.event_type === "weekly_tasks") {
    content = await weeklyTasksContent(supabase, userId, notification.payload);
  } else {
    const approved = notification.event_type === "evidence_approved";
    const taskTitle = String(notification.payload.task_title ?? "nalogo");
    const factionName = String(notification.payload.faction_name ?? "ločino");
    const status = approved ? "potrjeno" : "zavrnjeno";
    content = {
      subject: `Dokazilo je ${status} · The Five Factions`,
      text: `Tvoje dokazilo za nalogo »${taskTitle}« v ločini ${factionName} je bilo ${status}.`,
      html: `<p>Tvoje dokazilo za nalogo <strong>${escapeHtml(taskTitle)}</strong> v ločini <strong>${escapeHtml(factionName)}</strong> je bilo ${status}.</p><p>Odpri The Five Factions za podrobnosti.</p>`,
    };
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM ?? "The Five Factions <no-reply@thefivefactions.local>",
    to: notification.recipient_email,
    ...content,
  });
}
