import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/login/actions";
import { AuthLoading } from "@/app/auth-loading";

export const metadata: Metadata = {
  title: "Moj račun · The Five Factions",
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
    <main className="min-h-screen bg-[#f5f2ea] px-5 py-8 text-[#20251f] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Začetna stran">
            <span className="grid size-10 place-items-center rounded-full bg-[#263a31] font-serif text-lg text-[#f5f2ea]">5</span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">The Five Factions</span>
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="rounded-full border border-[#263a31] px-4 py-2 text-xs font-semibold text-[#263a31] transition hover:bg-[#263a31] hover:text-white">
              Odjava
            </button>
          </form>
        </header>

        <section className="mx-auto mt-14 max-w-3xl rounded-3xl border border-[#ded9ce] bg-[#fbfaf6] p-8 shadow-[0_24px_70px_-48px_rgba(32,37,31,0.4)] sm:mt-20 sm:p-12">
          {confirmed === "1" && <p role="status" className="mb-6 rounded-xl border border-[#c8d8c9] bg-[#edf5ed] px-4 py-3 text-sm text-[#294738]">E-poštni naslov je potrjen. Tvoj račun je pripravljen.</p>}
          {logout === "failed" && <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Odjava ni uspela. Poskusi znova.</p>}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6942]">Moj račun</p>
          <h1 className="mt-3 font-serif text-4xl">Živjo, {username}</h1>
          <p className="mt-4 text-sm leading-7 text-[#6c746a]">Prijavljen_a si z naslovom <span className="font-medium text-[#20251f]">{user.email}</span>.</p>
          <p className="mt-2 text-sm text-[#788075]">Tvoje trenutno aktivne ločine in napredek.</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <h2 className="font-serif text-2xl">Moje ločine</h2>
            {activeFactions.length > 1 && <span className="rounded-full border border-[#d5c4a9] bg-[#f4ede1] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#725b3e]">Divergent</span>}
          </div>
          {activeFactions.length ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {activeFactions.map((faction) => (
                <li key={faction.id} className="rounded-xl border border-[#ded9ce] bg-white/70 p-4">
                  <h3 className="font-serif text-xl">{faction.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#6c746a]">{faction.description}</p>
                  <p className="mt-3 text-xs font-medium text-[#294738]">Rang {faction.rank} · Streak {faction.streak} ted.</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[#788075]">Še nimaš izbrane ločine.</p>
          )}
          <Link href="/account/profile" className="mt-7 inline-flex rounded-full border border-[#263a31] px-5 py-3 text-sm font-semibold text-[#263a31] transition hover:bg-[#263a31] hover:text-white">
            Uredi profil
          </Link>
          <Link href="/account/profile#factions" className="ml-3 mt-7 inline-flex rounded-full border border-[#263a31] px-5 py-3 text-sm font-semibold text-[#263a31] transition hover:bg-[#263a31] hover:text-white">
            Spremeni ločine
          </Link>
          <Link href="/factions" className="ml-3 mt-7 inline-flex rounded-full bg-[#263a31] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#344d41]">
            Spoznaj ločine
          </Link>
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
