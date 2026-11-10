import type { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type CurrentWeekTask = {
  id: string;
  title: string;
  description: string;
  factionId: number;
  factionName: string;
  dueDate: string;
  status: "to_do" | "in_progress" | "awaiting_review" | "done" | "rejected";
};

export const taskStatusLabels: Record<CurrentWeekTask["status"], string> = {
  to_do: "To-Do",
  in_progress: "In Progress",
  awaiting_review: "Awaiting Review",
  done: "Done",
  rejected: "Rejected",
};

export function getCurrentWeekStartDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Ljubljana",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) => Number(parts.find((item) => item.type === type)?.value);
  const localDate = new Date(Date.UTC(part("year"), part("month") - 1, part("day")));
  const daysSinceMonday = (localDate.getUTCDay() + 6) % 7;
  localDate.setUTCDate(localDate.getUTCDate() - daysSinceMonday);
  return localDate.toISOString().slice(0, 10);
}

export function formatTaskDueDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("sl-SI", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export async function getCurrentWeekTasks(
  supabase: ServerSupabaseClient,
  userId: string,
  factionId?: number,
): Promise<CurrentWeekTask[]> {
  const { data: assignments, error: assignmentsError } = await supabase
    .from("task_assignments")
    .select("id, task_id, due_date, status")
    .eq("user_id", userId)
    .eq("week_start_date", getCurrentWeekStartDate())
    .neq("status", "cancelled")
    .order("due_date", { ascending: true });

  if (assignmentsError || !assignments?.length) return [];
  const taskIds = [...new Set(assignments.map((assignment) => assignment.task_id))];
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("id, title, description, faction_id")
    .in("id", taskIds);
  if (tasksError || !tasks?.length) return [];

  const factionIds = [...new Set(tasks.map((task) => task.faction_id))];
  const { data: factions, error: factionsError } = await supabase
    .from("factions")
    .select("id, name")
    .in("id", factionIds);
  if (factionsError || !factions?.length) return [];

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const factionById = new Map(factions.map((faction) => [faction.id, faction]));
  return assignments.flatMap((assignment) => {
    const task = taskById.get(assignment.task_id);
    if (!task || (factionId !== undefined && task.faction_id !== factionId)) return [];
    const faction = factionById.get(task.faction_id);
    if (!faction || !(assignment.status in taskStatusLabels)) return [];

    return [{
      id: assignment.id,
      title: task.title,
      description: task.description,
      factionId: task.faction_id,
      factionName: faction.name,
      dueDate: assignment.due_date,
      status: assignment.status as CurrentWeekTask["status"],
    }];
  });
}
