import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthLoading } from "@/app/auth-loading";
import { AccountNavigation } from "@/app/account/account-navigation";
import { DashboardAutoRefresh } from "@/app/account/dashboard-auto-refresh";
import { RankShield, StreakFlame } from "@/app/account/progress-icons";
import { EvidenceForm } from "@/app/account/evidence-form";
import { formatTaskDueDate, getCurrentWeekTasks, taskStatusLabels, type CurrentWeekTask } from "@/lib/tasks";
import { FactionIcon } from "@/components/faction-icon";

const taskStatusColors: Record<CurrentWeekTask["status"], string> = {
  to_do: "border-[#9980b9] bg-[#29203d] text-[#e6d5fa]",
  in_progress: "border-[#8294c9] bg-[#1e2949] text-[#d4deff]",
  awaiting_review: "border-[#b7a568] bg-[#332d1f] text-[#f4e5b1]",
  done: "border-[#8db69c] bg-[#20352b] text-[#d1f0d8]",
  rejected: "border-[#c07d98] bg-[#3b2030] text-[#ffd3e2]",
};

async function FactionDashboardContent({
  params,
}: {
  params: Promise<{ factionId: string }>;
}) {
  await connection();
  const { factionId: rawFactionId } = await params;
  if (!/^\d+$/.test(rawFactionId)) notFound();
  const factionId = Number(rawFactionId);

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?status=required");

  const { data: membership, error: membershipError } = await supabase
    .from("user_factions")
    .select("rank_level, current_streak_weeks")
    .eq("user_id", user.id)
    .eq("faction_id", factionId)
    .eq("membership_status", "active")
    .maybeSingle();
  if (membershipError || !membership) notFound();

  const { data: faction, error: factionError } = await supabase
    .from("factions")
    .select("id, name, description")
    .eq("id", factionId)
    .eq("is_active", true)
    .maybeSingle();
  if (factionError || !faction) notFound();
  const weeklyTasks = await getCurrentWeekTasks(supabase, user.id, factionId);

  return (
    <main className="retro-site min-h-screen">
      <div className="retro-window p-3 sm:p-5">
        <AccountNavigation />

        <section className="retro-panel mt-5 p-4 sm:p-6">
          <DashboardAutoRefresh />
          <Link href="/account" className="font-mono text-xs">← Nadzorna plošča</Link>
          <div className="mt-4 flex items-center gap-4 border-b-2 border-dotted border-[#9279b2] pb-4">
            <FactionIcon name={faction.name} size={78} />
            <div>
              <p className="retro-label">Ločina</p>
              <h1 className="mt-1 text-3xl sm:text-4xl">{faction.name}</h1>
              <p className="mt-1 text-sm text-[#d9cfe8]">{faction.description}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <article className="retro-paper flex items-center gap-4 p-3">
              <RankShield rank={membership.rank_level} />
              <div>
                <p className="font-mono text-xs font-bold uppercase">Trenutni rang</p>
              </div>
            </article>
            <article className="retro-paper flex items-center gap-4 p-3">
              <StreakFlame weeks={membership.current_streak_weeks} />
              <div>
                <p className="font-mono text-xs font-bold uppercase">Zaporedni aktivni tedni</p>
              </div>
            </article>
          </div>
        </section>

        <section className="retro-panel mt-5 p-4 sm:p-6">
          <h2 className="border-b-2 border-double border-[#9279b2] pb-2 text-2xl">Opravila — ta teden</h2>
          {weeklyTasks.length === 0 ? (
            <p className="mt-3 border border-dashed border-[#a68ac9] px-4 py-5 text-sm text-[#d3c4e5]">
              Za ločino {faction.name} še ni dodeljenih opravil za ta teden.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {weeklyTasks.map((task) => {
                const canSubmit = ["to_do", "in_progress", "rejected"].includes(task.status);
                return (
                  <li key={task.id}>
                    <details className="group border-2 border-[#8974a8] bg-[#0e0b24]/80 open:border-[#e7ed86]">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 marker:hidden [&::-webkit-details-marker]:hidden">
                        <span className="min-w-0">
                          <span className="block font-serif text-lg text-[#f0e9fa]">{task.title}</span>
                          <span className="mt-1 block font-mono text-[11px] text-[#c6b7d7]">Rok: {formatTaskDueDate(task.dueDate)}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className={`border px-2 py-1 font-mono text-[10px] font-bold uppercase ${taskStatusColors[task.status]}`}>
                            {taskStatusLabels[task.status]}
                          </span>
                          <span aria-hidden="true" className="text-lg text-[#c9b9ff] transition-transform group-open:rotate-180">⌄</span>
                        </span>
                      </summary>
                      <div className="border-t border-dotted border-[#8974a8] px-4 pb-4 pt-3">
                        <p className="text-sm leading-6 text-[#e0d7ec]">{task.description}</p>
                        {canSubmit ? (
                          <EvidenceForm assignmentId={task.id} />
                        ) : task.status === "awaiting_review" ? (
                          <p className="mt-5 text-sm text-[#f2d49e]">Dokazilo je oddano in čaka na preverjanje.</p>
                        ) : task.status === "done" ? (
                          <p className="mt-5 text-sm text-[#b9eedb]">Dokazilo je potrjeno.</p>
                        ) : null}
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

export default function FactionDashboardPage({
  params,
}: {
  params: Promise<{ factionId: string }>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <FactionDashboardContent params={params} />
    </Suspense>
  );
}
