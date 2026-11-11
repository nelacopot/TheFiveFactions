import type { CurrentWeekTask } from "@/lib/tasks";
import { formatTaskDueDate, taskStatusLabels } from "@/lib/tasks";

const statusColors: Record<CurrentWeekTask["status"], string> = {
  to_do: "border-[#9980b9] bg-[#29203d] text-[#e6d5fa]",
  in_progress: "border-[#8294c9] bg-[#1e2949] text-[#d4deff]",
  awaiting_review: "border-[#b7a568] bg-[#332d1f] text-[#f4e5b1]",
  done: "border-[#8db69c] bg-[#20352b] text-[#d1f0d8]",
  rejected: "border-[#c07d98] bg-[#3b2030] text-[#ffd3e2]",
};

export function WeeklyTaskList({
  tasks,
  emptyMessage = "Tedenske naloge se pripravljajo.",
}: {
  tasks: CurrentWeekTask[];
  emptyMessage?: string;
}) {
  if (tasks.length === 0) {
    return <p className="mt-3 border border-dashed border-[#a68ac9] px-3 py-4 text-sm text-[#d3c4e5]">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-3 space-y-3">
      {tasks.map((task) => (
        <li key={task.id} className="border border-[#79678e] bg-[#0e0b24]/80 p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h5 className="max-w-sm text-sm font-semibold text-[#f0e9fa]">{task.title}</h5>
            <span className={`border px-2 py-1 font-mono text-[10px] font-bold uppercase ${statusColors[task.status]}`}>
              {taskStatusLabels[task.status]}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#d9cfe8]">{task.description}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dotted border-[#79678e] pt-2 font-mono text-[10px] text-[#c7b8d7]">
            <span>Ločina: {task.factionName}</span>
            <span>Rok: {formatTaskDueDate(task.dueDate)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
