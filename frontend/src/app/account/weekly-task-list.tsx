import type { CurrentWeekTask } from "@/lib/tasks";
import { formatTaskDueDate, taskStatusLabels } from "@/lib/tasks";

const statusColors: Record<CurrentWeekTask["status"], string> = {
  to_do: "border-[#62518d] bg-[#27203c] text-[#d3c5ff]",
  in_progress: "border-[#354f86] bg-[#172341] text-[#c0d4ff]",
  awaiting_review: "border-[#74603b] bg-[#2a2418] text-[#f2d49e]",
  done: "border-[#3e6659] bg-[#172a25] text-[#b9eedb]",
  rejected: "border-[#704359] bg-[#2d1b28] text-[#ffc1d8]",
};

export function WeeklyTaskList({
  tasks,
  emptyMessage = "Tedenske naloge se pripravljajo.",
}: {
  tasks: CurrentWeekTask[];
  emptyMessage?: string;
}) {
  if (tasks.length === 0) {
    return <p className="mt-3 rounded-xl border border-dashed border-[#62518d] px-4 py-5 text-sm text-[#aaa5c0]">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-3 space-y-3">
      {tasks.map((task) => (
        <li key={task.id} className="rounded-xl border border-[#302b4b] bg-[#0e1122]/70 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h5 className="max-w-sm text-sm font-semibold text-[#e2d9ff]">{task.title}</h5>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusColors[task.status]}`}>
              {taskStatusLabels[task.status]}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#b9b4cf]">{task.description}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#aaa5c0]">
            <span>Ločina: {task.factionName}</span>
            <span>Rok: {formatTaskDueDate(task.dueDate)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
