import Link from "next/link";
import type { Metadata } from "next";
import { RegistrationForm } from "./registration-form";
import { FactionIcon } from "@/components/faction-icon";
import { FactionsLogo } from "@/components/factions-logo";

export const metadata: Metadata = {
  title: "The Five Factions",
  description: "Ustvari račun",
};

const factions = ["Altruism", "Intellect", "Grit", "Harmony", "Verity"];

export default function RegisterPage() {
  return (
    <main className="retro-site min-h-screen">
      <div className="retro-window">
        <header className="retro-titlebar flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-white no-underline"><FactionsLogo size={32} /> THE FIVE FACTIONS</Link>
          <nav aria-label="Glavni meni" className="flex gap-2">
            <Link href="/" className="retro-nav-link">Domov</Link>
            <Link href="/login" className="retro-nav-link">Prijava</Link>
          </nav>
        </header>

        <div className="grid gap-4 p-4 md:grid-cols-[190px_1fr] sm:p-5">
          <aside className="retro-paper p-3">
            <h2 className="border-b-2 border-double border-[#8d76a8] pb-2 font-mono text-sm">Ločine</h2>
            <ul className="old-link-list mt-2">
              {factions.map((name) => (
                <li key={name}>
                  <Link href="/factions" className="flex items-center gap-2 font-mono text-xs font-bold text-[#40275b]">
                    <FactionIcon name={name} size={42} /> {name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/factions" className="mt-3 block font-mono text-[10px] text-[#40275b]">Vsi opisi »</Link>
          </aside>

          <section className="retro-panel p-4 sm:p-5">
            <h1 className="border-b border-dotted border-[#9279b2] pb-2 text-2xl">Ustvari račun</h1>
            <p className="mb-5 mt-3 text-sm">Po registraciji ti pošljemo povezavo za potrditev e-poštnega naslova.</p>
            <RegistrationForm />
          </section>
        </div>
      </div>
    </main>
  );
}
