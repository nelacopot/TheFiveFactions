import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { AuthLoading } from "@/app/auth-loading";

export const metadata: Metadata = {
  title: "Prijava · The Five Factions",
  description: "Prijavi se v svoj račun The Five Factions.",
};

async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const notice = status === "signed-out"
    ? "Uspešno si se odjavil_a."
    : status === "required"
      ? "Za dostop do računa se prijavi."
      : undefined;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f2ea] px-5 py-12 text-[#20251f]">
      <section className="w-full max-w-md rounded-3xl border border-[#ded9ce] bg-[#fbfaf6] p-8 shadow-[0_24px_70px_-48px_rgba(32,37,31,0.4)] sm:p-10">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Nazaj na začetno stran">
          <span className="grid size-10 place-items-center rounded-full bg-[#263a31] font-serif text-lg text-[#f5f2ea]">5</span>
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">The Five Factions</span>
        </Link>
        <p className="mt-9 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6942]">Dobrodošel_a nazaj</p>
        <h1 className="mt-2 font-serif text-3xl">Prijava</h1>
        <p className="mb-7 mt-2 text-sm leading-6 text-[#6c746a]">Vnesi e-poštni naslov in geslo, s katerima si ustvaril_a račun.</p>
        <LoginForm notice={notice} />
      </section>
    </main>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  );
}
