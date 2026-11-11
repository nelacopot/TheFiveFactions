import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { AuthLoading } from "@/app/auth-loading";
import { FactionsLogo } from "@/components/factions-logo";

export const metadata: Metadata = {
  title: "The Five Factions",
  description: "Prijavi se v svoj račun",
};

async function LoginPageContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const notice = status === "signed-out"
    ? "Uspešno si se odjavil_a."
    : status === "account-deleted"
      ? "Tvoj račun in povezani podatki so bili izbrisani."
    : status === "required"
      ? "Za dostop do računa se prijavi."
      : undefined;

  return (
    <main className="retro-site grid min-h-screen place-items-center">
      <section className="retro-window w-full max-w-md p-4 sm:p-6">
        <header className="retro-titlebar -mx-4 -mt-4 mb-4 flex items-center justify-between sm:-mx-6 sm:-mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white no-underline"><FactionsLogo size={32} /> THE FIVE FACTIONS</Link>
          <Link href="/" className="retro-nav-link">Domov</Link>
        </header>
        <div className="retro-panel p-4">
          <h1 className="border-b border-dotted border-[#9279b2] pb-2 text-2xl">Prijava</h1>
          <p className="mb-5 mt-3 text-sm">Vnesi e-poštni naslov in geslo, s katerima si ustvaril_a račun.</p>
          <LoginForm notice={notice} />
        </div>
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
