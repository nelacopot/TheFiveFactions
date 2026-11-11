import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AuthLoading } from "@/app/auth-loading";
import { AccountNavigation } from "./account-navigation";
import { DashboardAutoRefresh } from "./dashboard-auto-refresh";
import { RankShield, StreakFlame } from "./progress-icons";
import { WeeklyTaskList } from "./weekly-task-list";
import { getCurrentWeekTasks } from "@/lib/tasks";
import { FactionIcon } from "@/components/faction-icon";

export const metadata: Metadata = {
  title: "The Five Factions",
  robots: { index: false, follow: false },
};

async function AccountPageContent({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; logout?: string }>;
}) {
  await connection();
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?status=required");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data: memberships } = await supabase
    .from("user_factions")
    .select("faction_id, rank_level, current_streak_weeks")
    .eq("user_id", user.id)
    .eq("membership_status", "active");
  const factionIds = memberships?.map((membership) => membership.faction_id) ?? [];
  const { data: factions } = factionIds.length
    ? await supabase.from("factions").select("id, name, description").in("id", factionIds).eq("is_active", true)
    : { data: [] };
  const factionById = new Map((factions ?? []).map((faction) => [faction.id, faction]));
  const activeFactions = (memberships ?? []).flatMap((membership) => {
    const faction = factionById.get(membership.faction_id);
    return faction ? [{ ...faction, rank: membership.rank_level, streak: membership.current_streak_weeks }] : [];
  });
  const weeklyTasks = await getCurrentWeekTasks(supabase, user.id);
  const tasksByFaction = new Map<number, typeof weeklyTasks>();
  for (const task of weeklyTasks) {
    const factionTasks = tasksByFaction.get(task.factionId) ?? [];
    factionTasks.push(task);
    tasksByFaction.set(task.factionId, factionTasks);
  }

  const { confirmed, logout } = await searchParams;
  const username = profile?.username ?? user.email;

  return (
    <main className="retro-site min-h-screen">
      <div className="retro-window p-3 sm:p-5">
        <AccountNavigation />

        <section className="mt-5">
          <DashboardAutoRefresh />
          {confirmed === "1" && <p role="status" className="retro-paper mb-4 px-3 py-2 text-sm">E-poštni naslov je potrjen. Tvoj račun je pripravljen.</p>}
          {logout === "failed" && <p role="alert" className="mb-4 border-2 border-[#d485a8] bg-[#401c36] px-3 py-2 text-sm text-[#ffd4e5]">Odjava ni uspela. Poskusi znova.</p>}
          <div className="retro-panel grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:p-5">
            <div>
              <h1 className="mt-2 text-3xl">Hej, {username}</h1>
              {user.email && <p className="mt-2 font-mono text-xs text-[#d3c4e5]">Prijavljen/a: {user.email}</p>}
            </div>
            <dl className="flex flex-wrap gap-2">
              <div className="retro-paper min-w-28 px-3 py-2">
                <dt className="font-mono text-[10px] uppercase">Ločine</dt>
                <dd className="mt-1 font-serif text-2xl">{activeFactions.length}</dd>
              </div>
              <div className="retro-paper min-w-28 px-3 py-2">
                <dt className="font-mono text-[10px] uppercase">Status</dt>
                <dd className="mt-1 font-serif text-lg">{activeFactions.length > 1 ? "Divergent" : activeFactions.length === 1 ? "Član" : "Factionless"}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-double border-[#9279b2] pb-2">
            <div>
              <h2 className="text-2xl">Ločine</h2>
            </div>
            <div className="flex items-center gap-3">
              {activeFactions.length > 1 && <span title="Trenutno razvijaš več kot eno vrlino." className="border border-[#d8cc85] bg-[#e7ed86] px-2 py-1 font-mono text-[10px] font-bold uppercase text-[#1e1731]">Divergent</span>}
              <Link href="/account/profile#factions" className="font-mono text-xs">Uredi izbor</Link>
            </div>
          </div>
          {activeFactions.length ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {activeFactions.map((faction) => (
                <li key={faction.id}>
                  <Link href={`/account/factions/${faction.id}`} aria-label={`Odpri ločino ${faction.name}`} className="retro-bevel group block h-full bg-[#110e2a]/95 p-4 transition hover:bg-[#21183a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7ed86]">
                    <div className="flex items-start justify-between gap-4 border-b border-dotted border-[#7e6a99] pb-3">
                      <div>
                        <h3 className="text-2xl">{faction.name}</h3>
                      </div>
                      <FactionIcon name={faction.name} size={68} />
                    </div>
                    <p className="mt-3 min-h-12 text-sm leading-6 text-[#d9cfe8]">{faction.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-5 border-b border-dotted border-[#7e6a99] pb-4">
                      <div className="flex items-center gap-3">
                        <RankShield rank={faction.rank} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#aaa5c0]">Rang</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <StreakFlame weeks={faction.streak} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#aaa5c0]">Streak</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-serif text-lg">Opravila ta teden</h4>
                        <span className="font-mono text-xs text-[#d3c4e5]">{tasksByFaction.get(faction.id)?.length ?? 0} / 3</span>
                      </div>
                      <WeeklyTaskList
                        tasks={tasksByFaction.get(faction.id) ?? []}
                        emptyMessage="Za to ločino še ni dodeljenih opravil za ta teden."
                      />
                    </div>
                    <p className="mt-4 font-mono text-xs">Odpri ločino »</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="retro-panel mt-4 p-5">
              <p className="font-serif text-xl">Ni izbranih ločin</p>
              <p className="mt-2 text-sm text-[#d3c4e5]">Izbor uredi v profilu.</p>
              <Link href="/account/profile#factions" className="retro-button mt-4">Uredi izbor</Link>
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-5 border-t border-dotted border-[#9279b2] pt-4 font-mono text-xs">
            <Link href="/account/profile">Uredi profil</Link>
            <Link href="/factions">Opisi ločin</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; logout?: string }>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AccountPageContent searchParams={searchParams} />
    </Suspense>
  );
}
