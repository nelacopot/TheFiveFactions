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
    <main className="retro-site min-h-screen">
      <div className="retro-window p-3 sm:p-5">
        <AccountNavigation active="profile" />

        <section className="mt-5">
          <h1 className="border-b-2 border-double border-[#9279b2] pb-2 text-3xl">Uredi profil</h1>

          {emailStatus === "confirmed" && (
            <p role="status" className="retro-paper mt-4 px-3 py-2 text-sm leading-6">
              Potrditev je uspela. Če si prejel_a še drugo potrditveno sporočilo, potrdi tudi tisto.
            </p>
          )}
          {emailStatus === "invalid" && (
            <p role="alert" className="mt-4 border-2 border-[#c07d98] bg-[#3b2030] px-3 py-2 text-sm leading-6 text-[#ffd3e2]">
              Potrditvena povezava je napačna ali je potekla. Poskusi znova spremeniti e-poštni naslov.
            </p>
          )}

          <div className="mt-4 space-y-4">
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
