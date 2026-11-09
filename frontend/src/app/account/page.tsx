import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/login/actions";
import { AuthLoading } from "@/app/auth-loading";

export const metadata: Metadata = {
  title: "Moj račun · The Five Factions",
  robots: { index: false, follow: false },
};

async function AccountPageContent({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; logout?: string }>;
}) {
  await connection();
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login?status=required");

  const { confirmed, logout } = await searchParams;
  const username = typeof user.user_metadata.username === "string"
    ? user.user_metadata.username
    : user.email;

  return (
    <main className="min-h-screen bg-[#f5f2ea] px-5 py-8 text-[#20251f] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Začetna stran">
            <span className="grid size-10 place-items-center rounded-full bg-[#263a31] font-serif text-lg text-[#f5f2ea]">5</span>
            <span className="text-sm font-semibold uppercase tracking-[0.18em]">The Five Factions</span>
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="rounded-full border border-[#263a31] px-4 py-2 text-xs font-semibold text-[#263a31] transition hover:bg-[#263a31] hover:text-white">
              Odjava
            </button>
          </form>
        </header>

        <section className="mx-auto mt-14 max-w-3xl rounded-3xl border border-[#ded9ce] bg-[#fbfaf6] p-8 shadow-[0_24px_70px_-48px_rgba(32,37,31,0.4)] sm:mt-20 sm:p-12">
          {confirmed === "1" && <p role="status" className="mb-6 rounded-xl border border-[#c8d8c9] bg-[#edf5ed] px-4 py-3 text-sm text-[#294738]">E-poštni naslov je potrjen. Tvoj račun je pripravljen.</p>}
          {logout === "failed" && <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">Odjava ni uspela. Poskusi znova.</p>}
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6942]">Moj račun</p>
          <h1 className="mt-3 font-serif text-4xl">Živjo, {username}</h1>
          <p className="mt-4 text-sm leading-7 text-[#6c746a]">Prijavljen_a si z naslovom <span className="font-medium text-[#20251f]">{user.email}</span>.</p>
          <p className="mt-2 text-sm text-[#788075]">Osnovni račun je pripravljen. Tvoj pregled ločin in nalog bo dodan v naslednjih korakih.</p>
        </section>
      </div>
    </main>
  );
}

export default function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string; logout?: string }>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AccountPageContent searchParams={searchParams} />
    </Suspense>
  );
}
