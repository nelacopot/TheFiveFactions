import Link from "next/link";
import type { Metadata } from "next";
import { FactionIcon } from "@/components/faction-icon";

export const metadata: Metadata = {
  title: "Ločine · The Five Factions",
  description: "Spoznaj Altruism, Intellect, Grit, Harmony in Verity ter vrline, ki jih predstavljajo.",
};

const factions = [
  {
    name: "Altruism",
    belief: "Them before I.",
    description: "This faction values the needs of others above its own.",
    invitation: "Choose this faction if you would like to help others more.",
  },
  {
    name: "Intellect",
    description: "Members devote themselves to the pursuit of knowledge through reading, research, and exploring ideas on computers.",
    invitation: "Choose this faction if you would like to learn more about the world, develop your thinking, and use your mind more.",
  },
  {
    name: "Grit",
    description: "This faction is dedicated to courage, bravery, physical and emotional strength, and fearlessness.",
    invitation: "Choose this faction if you would like to become physically and mentally stronger.",
  },
  {
    name: "Harmony",
    description: "This faction values peacefulness, kindness, forgiveness, trust, self-sufficiency, and neutrality.",
    invitation: "Choose this faction if you would like to find inner peace, grow spiritually, learn about nature, and get in touch with yourself.",
  },
  {
    name: "Verity",
    description: "Members see honesty and trustworthiness as the foundations of morality and character.",
    invitation: "Choose this faction if you value truth and justice.",
  },
];

export default function FactionsPage() {
  return (
    <main className="retro-site min-h-screen">
      <div className="retro-window">
        <header className="retro-titlebar flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-white no-underline">5 · THE FIVE FACTIONS</Link>
          <nav aria-label="Glavni meni" className="flex flex-wrap gap-2">
            <Link href="/" className="retro-nav-link">Domov</Link>
            <Link href="/login" className="retro-nav-link">Prijava</Link>
            <Link href="/register" className="retro-nav-link">Registracija</Link>
          </nav>
        </header>

        <section className="p-4 sm:p-6">
          <h1 className="border-b-2 border-double border-[#a68ac9] pb-3 text-3xl sm:text-4xl">Ločine</h1>
          <p className="mt-3 text-sm text-[#ded3ec]">Izberi eno ali več ločin, ki jih želiš razvijati.</p>

          <div className="mt-5 divide-y-2 divide-dotted divide-[#9279b2] border-y-2 border-double border-[#9279b2]">
            {factions.map((faction) => (
              <article key={faction.name} className="grid gap-4 bg-[#100d25]/65 p-4 sm:grid-cols-[104px_1fr] sm:items-start sm:gap-5 sm:p-5 even:bg-[#1d1533]/75">
                <FactionIcon name={faction.name} size={96} />
                <div>
                  <h2 className="text-2xl">{faction.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#e1d8ed]">{faction.description}</p>
                  {faction.belief && <p className="mt-3 font-serif text-lg italic text-[#e7ed86]">“{faction.belief}”</p>}
                  <p className="mt-3 border-l-2 border-[#e7ed86] pl-3 text-sm leading-6 text-[#d7c2f3]">{faction.invitation}</p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-5 text-sm"><Link href="/register">Ustvari račun in izberi ločine »</Link></p>
        </section>

        <footer className="border-t-2 border-double border-[#8e76ae] px-4 py-3 font-mono text-[11px] text-[#d5c8e8]">
          <Link href="/">← Nazaj na začetno stran</Link>
        </footer>
      </div>
    </main>
  );
}
