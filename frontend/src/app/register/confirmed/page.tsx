import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Potrditev e-pošte · The Five Factions",
  robots: { index: false, follow: false },
};

export default async function RegistrationConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const confirmed = status === "success";

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f2ea] px-5 py-12 text-[#20251f]">
      <section className="w-full max-w-lg rounded-3xl border border-[#ded9ce] bg-[#fbfaf6] p-8 text-center shadow-[0_24px_70px_-48px_rgba(32,37,31,0.4)] sm:p-12">
        <span className={`mx-auto grid size-14 place-items-center rounded-full font-serif text-2xl ${confirmed ? "bg-[#e4eee3] text-[#294738]" : "bg-rose-100 text-rose-800"}`} aria-hidden="true">
          {confirmed ? "✓" : "!"}
        </span>
        <h1 className="mt-6 font-serif text-3xl">{confirmed ? "E-poštni naslov je potrjen" : "Povezava ni več veljavna"}</h1>
        <p className="mt-4 text-sm leading-7 text-[#6c746a]">
          {confirmed
            ? "Tvoj račun je potrjen in pripravljen. Hvala, ker si se pridružil_a The Five Factions."
            : "Potrditvena povezava je napačna ali je potekla. Začni registracijo znova, da prejmeš novo sporočilo."}
        </p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-[#263a31] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#344d41]">
          Nadaljuj na začetno stran
        </Link>
      </section>
    </main>
  );
}
