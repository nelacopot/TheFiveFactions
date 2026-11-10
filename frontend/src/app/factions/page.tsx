import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pet ločin · The Five Factions",
  description: "Spoznaj Altruism, Intellect, Grit, Harmony in Verity ter vrline, ki jih predstavljajo.",
};

const factions = [
  {
    name: "Altruism",
    mark: "A",
    belief: "Them before I.",
    description: "This faction values the needs of others above its own.",
    invitation: "Choose this faction if you would like to help others more.",
  },
  {
    name: "Intellect",
    mark: "I",
    description: "Members devote themselves to the pursuit of knowledge through reading, research, and exploring ideas on computers.",
    invitation: "Choose this faction if you would like to learn more about the world, develop your thinking, and use your mind more.",
  },
  {
    name: "Grit",
    mark: "G",
    description: "This faction is dedicated to courage, bravery, physical and emotional strength, and fearlessness.",
    invitation: "Choose this faction if you would like to become physically and mentally stronger.",
  },
  {
    name: "Harmony",
    mark: "H",
    description: "This faction values peacefulness, kindness, forgiveness, trust, self-sufficiency, and neutrality.",
    invitation: "Choose this faction if you would like to find inner peace, grow spiritually, learn about nature, and get in touch with yourself.",
  },
  {
    name: "Verity",
    mark: "V",
    description: "Members see honesty and trustworthiness as the foundations of morality and character.",
    invitation: "Choose this faction if you value truth and justice.",
  },
];

export default function FactionsPage() {
  return (
    <main className="min-h-screen bg-[#090b18] px-5 py-8 text-[#f0edfa] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Začetna stran">
            <span className="grid size-10 place-items-center rounded-full bg-[#22203d] font-serif text-lg text-[#f0edfa]">5</span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">The Five Factions</span>
          </Link>
          <Link href="/register" className="rounded-full border border-[#7762be] px-4 py-2 text-xs font-semibold text-[#c9b9ff] transition hover:bg-[#38305f] hover:text-white">
            Ustvari račun
          </Link>
        </header>

        <section className="mx-auto max-w-3xl py-14 text-center sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c3a8ff]">Five paths, five virtues</p>
          <h1 className="mt-4 font-serif text-5xl leading-tight sm:text-6xl">Find what you want to grow.</h1>
          <p className="mt-5 text-base leading-7 text-[#b9b4cf]">Each faction represents a different quality to practice. You can choose more than one and build a path that feels like yours.</p>
        </section>

        <section aria-label="The Five Factions" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {factions.map((faction) => (
            <article key={faction.name} className="flex min-h-64 flex-col rounded-2xl border border-[#302b4b] bg-[#12162a] p-6 sm:p-7">
              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#22203d] font-serif text-xl text-[#f0edfa]">{faction.mark}</span>
                <h2 className="font-serif text-3xl">{faction.name}</h2>
              </div>
              <p className="mt-6 text-sm leading-7 text-[#b9b4cf]">{faction.description}</p>
              {faction.belief && <p className="mt-4 border-l-2 border-[#9c83e6] pl-4 font-serif text-lg italic text-[#d3c5ff]">{faction.belief}</p>}
              <p className="mt-auto pt-6 text-sm font-medium leading-6 text-[#c9b9ff]">{faction.invitation}</p>
            </article>
          ))}
        </section>

        <div className="py-12 text-center">
          <Link href="/register" className="inline-flex rounded-full bg-[#22203d] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#423875]">
            Start your journey
          </Link>
        </div>
      </div>
    </main>
  );
}
