import Link from "next/link";

const factions = [
  { name: "Altruism", virtue: "Care for others", mark: "A" },
  { name: "Intellect", virtue: "Curiosity and learning", mark: "I" },
  { name: "Grit", virtue: "Courage and discipline", mark: "G" },
  { name: "Harmony", virtue: "Balance and kindness", mark: "H" },
  { name: "Verity", virtue: "Honesty and clarity", mark: "V" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#090b18] text-[#f0edfa]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 sm:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="The Five Factions home">
          <span className="grid size-10 place-items-center rounded-full bg-[#22203d] font-serif text-lg text-[#f0edfa]">5</span>
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">The Five Factions</span>
        </Link>
        <div className="flex items-center gap-6">
          <span className="hidden text-xs uppercase tracking-[0.2em] text-[#b9b4cf] sm:block">A practice in becoming</span>
          <Link href="/login" className="text-xs font-semibold text-[#c9b9ff] underline underline-offset-4">Prijava</Link>
          <Link href="/register" className="rounded-full border border-[#7762be] px-4 py-2 text-xs font-semibold text-[#c9b9ff] transition hover:bg-[#38305f] hover:text-white">Ustvari račun</Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-12 sm:px-10 md:grid-cols-[1.1fr_0.9fr] md:pb-32 md:pt-20">
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.24em] text-[#c3a8ff]">Small actions. Lasting virtues.</p>
          <h1 className="max-w-2xl font-serif text-5xl leading-[1.05] tracking-tight sm:text-7xl">Become who you choose to be.</h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#b9b4cf]">Build the qualities that matter to you through thoughtful weekly challenges, shared accountability, and progress you can see.</p>
          <Link href="/factions" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#22203d] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#423875]">
            Explore the factions <span aria-hidden="true">↗</span>
          </Link>
          <p className="mt-5 text-xs text-[#aaa5c0]">Your path can hold more than one virtue.</p>
        </div>

        <div id="factions" className="grid grid-cols-2 gap-3 sm:gap-4">
          {factions.map((faction, index) => (
            <article key={faction.name} className={`min-h-40 rounded-2xl border border-[#302b4b] bg-[#12162a] p-5 sm:min-h-48 sm:p-7 ${index === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
              <span className="font-serif text-3xl text-[#c3a8ff]">{faction.mark}</span>
              <h2 className="mt-5 font-serif text-2xl">{faction.name}</h2>
              <p className="mt-1 text-sm text-[#aaa5c0]">{faction.virtue}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-[#302b4b] px-6 py-5 text-center text-xs tracking-wide text-[#aaa5c0]">The Five Factions · Find your next small step</footer>
    </main>
  );
}
