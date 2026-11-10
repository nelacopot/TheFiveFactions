import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/login/actions";
import { AuthLoading } from "@/app/auth-loading";
import { DashboardAutoRefresh } from "./dashboard-auto-refresh";
import { RankShield, StreakFlame } from "./progress-icons";

export const metadata: Metadata = {
  title: "Nadzorna plošča · The Five Factions",
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

  const { confirmed, logout } = await searchParams;
  const username = profile?.username ?? user.email;

  return (
    <main className="min-h-screen bg-[#090b18] px-5 py-8 text-[#f0edfa] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Začetna stran">
            <span className="grid size-10 place-items-center rounded-full bg-[#22203d] font-serif text-lg text-[#f0edfa]">5</span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">The Five Factions</span>
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="rounded-full border border-[#7762be] px-4 py-2 text-xs font-semibold text-[#c9b9ff] transition hover:bg-[#38305f] hover:text-white">
              Odjava
            </button>
          </form>
        </header>

        <section className="mx-auto mt-10 max-w-5xl sm:mt-14">
          <DashboardAutoRefresh />
          {confirmed === "1" && <p role="status" className="mb-6 rounded-xl border border-[#51416f] bg-[#211b36] px-4 py-3 text-sm text-[#c9b9ff]">E-poštni naslov je potrjen. Tvoj račun je pripravljen.</p>}
          {logout === "failed" && <p role="alert" className="mb-6 rounded-xl border border-[#55344f] bg-[#271827] px-4 py-3 text-sm text-[#ffc1d8]">Odjava ni uspela. Poskusi znova.</p>}
          <div className="flex flex-col gap-7 rounded-3xl border border-[#302b4b] bg-gradient-to-br from-[#171a31] to-[#111326] p-7 shadow-[0_24px_70px_-48px_rgba(12,8,38,0.8)] sm:flex-row sm:items-end sm:justify-between sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c3a8ff]">Tvoj prostor za rast</p>
              <h1 className="mt-3 font-serif text-4xl sm:text-5xl">Živjo, {username}</h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#b9b4cf]">Izberi eno od svojih poti in nadaljuj z razvijanjem vrlin, ki so ti pomembne.</p>
              {user.email && <p className="mt-3 text-xs text-[#aaa5c0]">Prijavljen_a si kot {user.email}</p>}
            </div>
            <div className="flex gap-3">
              <div className="min-w-28 rounded-2xl border border-[#302b4b] bg-[#0e1122]/70 p-4">
                <p className="text-xs uppercase tracking-wider text-[#aaa5c0]">Aktivne ločine</p>
                <p className="mt-2 font-serif text-3xl text-[#d3c5ff]">{activeFactions.length}</p>
              </div>
              <div className="min-w-28 rounded-2xl border border-[#302b4b] bg-[#0e1122]/70 p-4">
                <p className="text-xs uppercase tracking-wider text-[#aaa5c0]">Tvoj status</p>
                <p className="mt-2 font-serif text-xl text-[#d3c5ff]">{activeFactions.length > 1 ? "Divergent" : activeFactions.length === 1 ? "Član" : "Factionless"}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl">Moje ločine</h2>
              <p className="mt-2 text-sm text-[#aaa5c0]">Odpri ločino za pregled ranga, streaka in tedenskih opravil.</p>
            </div>
            <div className="flex items-center gap-3">
              {activeFactions.length > 1 && <span title="Trenutno razvijaš več kot eno vrlino." className="rounded-full border border-[#62518d] bg-[#27203c] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#d3c5ff]">Divergent</span>}
              <Link href="/account/profile#factions" className="text-sm font-semibold text-[#c9b9ff] underline underline-offset-4">Uredi izbor</Link>
            </div>
          </div>
          {activeFactions.length ? (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {activeFactions.map((faction) => (
                <li key={faction.id}>
                  <Link href={`/account/factions/${faction.id}`} aria-label={`Odpri ločino ${faction.name}`} className="group block h-full rounded-2xl border border-[#302b4b] bg-[#171a31] p-6 transition hover:-translate-y-1 hover:border-[#7762be] hover:bg-[#1d1a38] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b9a5ff]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b9a5ff]">Moja pot</p>
                        <h3 className="mt-2 font-serif text-3xl">{faction.name}</h3>
                      </div>
                      <span className="grid size-12 place-items-center rounded-full border border-[#62518d] bg-[#27203c] font-serif text-2xl text-[#d3c5ff]">{faction.name.slice(0, 1)}</span>
                    </div>
                    <p className="mt-4 min-h-12 text-sm leading-6 text-[#b9b4cf]">{faction.description}</p>
                    <div className="mt-6 flex items-center gap-8">
                      <div className="flex items-center gap-3">
                        <RankShield rank={faction.rank} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#aaa5c0]">Rang</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <StreakFlame weeks={faction.streak} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#aaa5c0]">Streak</span>
                      </div>
                    </div>
                    <p className="mt-5 text-sm font-semibold text-[#c9b9ff] group-hover:text-white">Odpri ločino <span aria-hidden="true">→</span></p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#62518d] bg-[#171a31] p-8 text-center">
              <p className="font-serif text-2xl">Začni svojo pot</p>
              <p className="mt-2 text-sm text-[#aaa5c0]">Izberi vsaj eno ločino, da se ti tukaj prikaže njen napredek.</p>
              <Link href="/account/profile#factions" className="mt-5 inline-flex rounded-full bg-[#22203d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#423875]">Izberi ločine</Link>
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-5 border-t border-[#302b4b] pt-6 text-sm">
            <Link href="/account/profile" className="font-semibold text-[#c9b9ff] underline underline-offset-4">Uredi profil</Link>
            <Link href="/factions" className="font-semibold text-[#c9b9ff] underline underline-offset-4">Spoznaj vse ločine</Link>
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
