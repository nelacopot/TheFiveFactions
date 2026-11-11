"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { LoginActionState } from "./login-state";

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
    return { status: "error", message: "Vnesi veljaven e-poštni naslov in geslo." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error?.code === "email_not_confirmed") {
      return {
        status: "error",
        message: "Pred prijavo potrdi svoj e-poštni naslov prek povezave, ki smo ti jo poslali.",
      };
    }
    if (error) {
      return { status: "error", message: "E-poštni naslov ali geslo ni pravilno." };
    }
  } catch {
    return { status: "error", message: "Prijava trenutno ni na voljo. Poskusi znova." };
  }

  redirect("/account");
}

export async function logoutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) redirect("/account?logout=failed");
  redirect("/login?status=signed-out");
}
