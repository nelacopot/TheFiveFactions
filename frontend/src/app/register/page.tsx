import Link from "next/link";
import type { Metadata } from "next";
import { RegistrationForm } from "./registration-form";

export const metadata: Metadata = {
  title: "Registracija · The Five Factions",
  description: "Ustvari račun in začni graditi vrline po svoji izbiri.",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#090b18] px-5 py-8 text-[#f0edfa] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Nazaj na začetno stran">
          <span className="grid size-10 place-items-center rounded-full bg-[#22203d] font-serif text-lg text-[#f0edfa]">5</span>
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">The Five Factions</span>
        </Link>

        <div className="mx-auto mt-12 grid max-w-4xl overflow-hidden rounded-3xl border border-[#302b4b] bg-[#12162a] shadow-[0_24px_70px_-48px_rgba(32,37,31,0.4)] md:mt-16 md:grid-cols-[0.9fr_1.1fr]">
          <section className="flex flex-col justify-between bg-[#22203d] p-8 text-[#f0edfa] sm:p-10 md:p-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c9b9ff]">Your next chapter</p>
              <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">Choose who you are becoming.</h1>
              <p className="mt-5 text-sm leading-7 text-[#d0cce0]">Ustvari račun in začni z majhnimi tedenskimi koraki, ki gradijo vrline, pomembne tebi.</p>
            </div>
            <p className="mt-10 border-t border-white/15 pt-5 text-xs tracking-wide text-[#aaa5c0]">Altruism · Intellect · Grit · Harmony · Verity</p>
          </section>

          <section className="p-7 sm:p-10 md:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c3a8ff]">Začni tukaj</p>
            <h2 className="mt-2 font-serif text-3xl">Ustvari račun</h2>
            <p className="mb-7 mt-2 text-sm leading-6 text-[#b9b4cf]">Po registraciji ti pošljemo povezavo za potrditev e-poštnega naslova.</p>
            <RegistrationForm />
          </section>
        </div>
      </div>
    </main>
  );
}
