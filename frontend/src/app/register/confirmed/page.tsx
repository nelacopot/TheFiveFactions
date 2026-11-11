import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthLoading } from "@/app/auth-loading";
import { FactionsLogo } from "@/components/factions-logo";

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
    <main className="retro-site grid place-items-center px-4 py-10">
      <section className="retro-window w-full max-w-xl">
        <div className="retro-titlebar flex items-center justify-between"><span className="inline-flex items-center gap-2"><FactionsLogo size={28} /> THE FIVE FACTIONS</span><span aria-hidden="true">_ □ ×</span></div>
        <div className="retro-panel p-6 text-center sm:p-10">
        <span className={`mx-auto grid size-14 place-items-center border-2 border-white font-serif text-2xl ${confirmed ? "bg-[#e5f3df] text-[#25532f]" : "bg-[#f7e3e5] text-[#713b47]"}`} aria-hidden="true">
          {confirmed ? "✓" : "!"}
        </span>
        <h1 className="retro-title mt-6 text-2xl">{confirmed ? "E-poštni naslov je potrjen" : "Povezava ni več veljavna"}</h1>
        <p className="mt-4 text-sm leading-7">
          {confirmed
            ? "Tvoj račun je potrjen. Zdaj se lahko prijaviš."
            : "Potrditvena povezava je napačna ali je potekla. Začni registracijo znova, da prejmeš novo sporočilo."}
        </p>
        <Link href={confirmed ? "/login" : "/register"} className="retro-button mt-8 inline-flex">
          {confirmed ? "Prijava" : "Nova registracija"}
        </Link>
        </div>
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
