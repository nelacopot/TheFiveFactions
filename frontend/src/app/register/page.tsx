import Link from "next/link";
import type { Metadata } from "next";
import { RegistrationForm } from "./registration-form";

export const metadata: Metadata = {
  title: "Registracija · The Five Factions",
  description: "Ustvari račun in začni graditi vrline po svoji izbiri.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f5f2ea] px-5 py-8 text-[#20251f] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Nazaj na začetno stran">
          <span className="grid size-10 place-items-center rounded-full bg-[#263a31] font-serif text-lg text-[#f5f2ea]">5</span>
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">The Five Factions</span>
        </Link>

        <div className="mx-auto mt-12 grid max-w-4xl overflow-hidden rounded-3xl border border-[#ded9ce] bg-[#fbfaf6] shadow-[0_24px_70px_-48px_rgba(32,37,31,0.4)] md:mt-16 md:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col justify-between bg-[#263a31] p-8 text-[#f5f2ea] sm:p-10 md:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c3a67f]">Your next chapter</p>
              <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">Choose who you are becoming.</h1>
              <p className="mt-5 text-sm leading-7 text-[#d1d8d0]">Ustvari račun in začni z majhnimi tedenskimi koraki, ki gradijo vrline, pomembne tebi.</p>
            </div>
            <p className="mt-10 border-t border-white/15 pt-5 text-xs tracking-wide text-[#c1c9c0]">Altruism · Intellect · Grit · Harmony · Verity</p>
          </section>

          <section className="p-7 sm:p-10 md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6942]">Začni tukaj</p>
            <h2 className="mt-2 font-serif text-3xl">Ustvari račun</h2>
            <p className="mb-7 mt-2 text-sm leading-6 text-[#6c746a]">Po registraciji ti pošljemo povezavo za potrditev e-poštnega naslova.</p>
            <RegistrationForm />
          </section>
        </div>
      </div>
    </main>
  );
}
