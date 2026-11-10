import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AuthLoading } from "@/app/auth-loading";
import { AccountNavigation } from "@/app/account/account-navigation";
import { ProfileForms } from "./profile-forms";
import { FactionSelectionForm } from "./faction-selection-form";
import { AccountDeletionForm } from "./account-deletion-form";

export const metadata: Metadata = {
  title: "Urejanje profila · The Five Factions",
  robots: { index: false, follow: false },
};

async function ProfilePageContent({
  searchParams,
}: {
  searchParams: Promise<{ emailStatus?: string }>;
}) {
  await connection();
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login?status=required");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) redirect("/account");

  const [{ data: factions, error: factionsError }, { data: memberships, error: membershipsError }] = await Promise.all([
    supabase.from("factions").select("id, name, description").eq("is_active", true).order("name"),
    supabase.from("user_factions").select("faction_id").eq("user_id", user.id).eq("membership_status", "active"),
  ]);
  if (factionsError || membershipsError || !factions || !memberships) redirect("/account");

  const { emailStatus } = await searchParams;

  return (
    <main className="min-h-screen bg-[#090b18] px-5 py-8 text-[#f0edfa] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <AccountNavigation active="profile" />

        <section className="mx-auto mt-10 max-w-3xl sm:mt-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c3a8ff]">Nastavitve</p>
          <h1 className="mt-2 font-serif text-4xl">Uredi profil</h1>
          <p className="mb-7 mt-3 text-sm leading-6 text-[#b9b4cf]">Posodobi podatke, s katerimi se prijavljaš v The Five Factions.</p>

          {emailStatus === "confirmed" && (
            <p role="status" className="mb-5 rounded-xl border border-[#51416f] bg-[#211b36] px-4 py-3 text-sm leading-6 text-[#c9b9ff]">
              Potrditev je uspela. Če si prejel_a še drugo potrditveno sporočilo, potrdi tudi tisto.
            </p>
          )}
          {emailStatus === "invalid" && (
            <p role="alert" className="mb-5 rounded-xl border border-[#55344f] bg-[#271827] px-4 py-3 text-sm leading-6 text-[#ffc1d8]">
              Potrditvena povezava je napačna ali je potekla. Poskusi znova spremeniti e-poštni naslov.
            </p>
          )}

          <div className="space-y-5">
            <FactionSelectionForm
              factions={factions}
              selectedFactionIds={memberships.map((membership) => membership.faction_id)}
            />
            <ProfileForms email={user.email ?? ""} username={profile.username} />
            <AccountDeletionForm />
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ emailStatus?: string }>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <ProfilePageContent searchParams={searchParams} />
    </Suspense>
  );
}
