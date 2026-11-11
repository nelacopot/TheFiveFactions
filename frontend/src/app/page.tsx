import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthLoading } from "@/app/auth-loading";
import { FactionIcon } from "@/components/faction-icon";
import { FactionsLogo } from "@/components/factions-logo";

const factions = ["Altruism", "Intellect", "Grit", "Harmony", "Verity"];

async function HomeContent() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/account");

  return (
    <main className="retro-site min-h-screen">
      <div className="retro-window">
        <header className="retro-titlebar flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="no-underline text-white" aria-label="The Five Factions — začetna stran">
            <FactionsLogo size={36} />
            THE FIVE FACTIONS
          </Link>
          <nav aria-label="Glavni meni" className="flex flex-wrap items-center gap-2">
            <Link href="/factions" className="retro-nav-link">Ločine</Link>
            <Link href="/login" className="retro-nav-link">Prijava</Link>
            <Link href="/register" className="retro-nav-link">Registracija</Link>
          </nav>
        </header>

        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="retro-panel p-5 sm:p-7">
            <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">The Five Factions</h1>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/factions" className="retro-button">Seznam ločin</Link>
              <Link href="/register" className="retro-button">Ustvari račun</Link>
            </div>
          </section>

          <aside className="retro-paper p-4 sm:p-5">
            <h2 className="border-b-2 border-double border-[#8d76a8] pb-2 text-xl">Ločine</h2>
            <ul className="old-link-list mt-2 grid grid-cols-2 gap-x-4">
              {factions.map((name) => (
                <li key={name}>
                  <Link href="/factions" className="faction-index-link flex items-center gap-2 font-mono text-sm font-bold text-[#40275b]">
                    <FactionIcon name={name} size={50} />
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-dotted border-[#8d76a8] pt-3 font-mono text-xs text-[#59496a]">
              <Link href="/factions" className="text-[#40275b]">Odpri opise ločin »</Link>
            </p>
          </aside>
        </div>

        <footer className="border-t-2 border-double border-[#8e76ae] px-4 py-3 text-center font-mono text-[11px] text-[#d5c8e8]">
          <Link href="/login">Prijava</Link> · <Link href="/register">Registracija</Link>
        </footer>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <HomeContent />
    </Suspense>
  );
}
