import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLoading } from "@/app/auth-loading";

export const metadata: Metadata = {
  title: "Potrditev e-pošte · The Five Factions",
  robots: { index: false, follow: false },
};

async function RegistrationConfirmedContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const confirmed = status === "success";

  return (
    <main className="grid min-h-screen place-items-center bg-[#090b18] px-5 py-12 text-[#f0edfa]">
      <section className="w-full max-w-lg rounded-3xl border border-[#302b4b] bg-[#12162a] p-8 text-center shadow-[0_24px_70px_-48px_rgba(32,37,31,0.4)] sm:p-12">
        <span className={`mx-auto grid size-14 place-items-center rounded-full font-serif text-2xl ${confirmed ? "bg-[#2a2344] text-[#c9b9ff]" : "bg-[#271827] text-[#ffc1d8]"}`} aria-hidden="true">
          {confirmed ? "✓" : "!"}
        </span>
        <h1 className="mt-6 font-serif text-3xl">{confirmed ? "E-poštni naslov je potrjen" : "Povezava ni več veljavna"}</h1>
        <p className="mt-4 text-sm leading-7 text-[#b9b4cf]">
          {confirmed
            ? "Tvoj račun je potrjen in pripravljen. Hvala, ker si se pridružil_a The Five Factions."
            : "Potrditvena povezava je napačna ali je potekla. Začni registracijo znova, da prejmeš novo sporočilo."}
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-[#22203d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#423875]">
          Nadaljuj na začetno stran
        </Link>
      </section>
    </main>
  );
}

export default function RegistrationConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <RegistrationConfirmedContent searchParams={searchParams} />
    </Suspense>
  );
}
