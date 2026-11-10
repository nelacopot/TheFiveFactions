import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthLoading } from "@/app/auth-loading";
import { DashboardAutoRefresh } from "@/app/account/dashboard-auto-refresh";
import { RankShield, StreakFlame } from "@/app/account/progress-icons";

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

  return (
    <main className="min-h-screen bg-[#090b18] px-5 py-8 text-[#f0edfa] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link href="/account" className="inline-flex items-center gap-3" aria-label="Nazaj na nadzorno ploščo">
            <span className="grid size-10 place-items-center rounded-full bg-[#22203d] font-serif text-lg text-[#f0edfa]">5</span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">The Five Factions</span>
          </Link>
          <Link href="/account/profile#factions" className="text-sm font-semibold text-[#c9b9ff] underline underline-offset-4">Uredi ločine</Link>
        </header>

        <section className="mt-10 rounded-3xl border border-[#302b4b] bg-gradient-to-br from-[#1c1a39] via-[#15172f] to-[#101426] p-7 sm:mt-14 sm:p-12">
          <DashboardAutoRefresh />
          <Link href="/account" className="text-sm font-semibold text-[#c9b9ff] underline underline-offset-4">← Nadzorna plošča</Link>
          <p className="mt-9 text-xs font-semibold uppercase tracking-[0.2em] text-[#c3a8ff]">Tvoja pot</p>
          <h1 className="mt-3 font-serif text-5xl">{faction.name}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[#b9b4cf]">{faction.description}</p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            <article className="flex items-center gap-5 rounded-2xl border border-[#62518d] bg-[#17162f]/80 p-6">
              <RankShield rank={membership.rank_level} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#aaa5c0]">Trenutni rang</p>
                <p className="mt-2 text-sm text-[#aaa5c0]">Napreduj z rednim opravljanjem opravil.</p>
              </div>
            </article>
            <article className="flex items-center gap-5 rounded-2xl border border-[#62518d] bg-[#17162f]/80 p-6">
              <StreakFlame weeks={membership.current_streak_weeks} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#aaa5c0]">Zaporedni aktivni tedni</p>
                <p className="mt-2 text-sm text-[#aaa5c0]">Streak za ločino {faction.name}.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-[#302b4b] bg-[#12162a] p-7 sm:p-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c3a8ff]">Ta teden</p>
            <h2 className="mt-2 font-serif text-3xl">Opravila</h2>
          </div>
          <div className="mt-6 rounded-2xl border border-dashed border-[#62518d] bg-[#171a31] px-5 py-10 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#27203c] font-serif text-2xl text-[#d3c5ff]" aria-hidden="true">✦</span>
            <p className="mt-4 font-serif text-xl">Opravila prihajajo</p>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#aaa5c0]">Tedenska opravila za ločino {faction.name} bodo prikazana tukaj, ko bo na voljo njihovo dodeljevanje.</p>
          </div>
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
