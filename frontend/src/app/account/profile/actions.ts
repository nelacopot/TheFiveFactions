"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/features/auth/registration-validation";
import type { ProfileActionState } from "./profile-state";

const unavailableUsername = "To uporabniško ime ni na voljo. Izberi drugo.";

async function getSignedInClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { supabase: null, user: null };
  return { supabase, user };
}

export async function updateUsernameAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const username = String(formData.get("username") ?? "").trim();
  const validationError = validateUsername(username);
  if (validationError) return { status: "error", message: validationError };

  try {
    const { supabase, user } = await getSignedInClient();
    if (!supabase || !user) return { status: "error", message: "Seja je potekla. Prijavi se znova." };

    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    if (profileError) return { status: "error", message: "Profila trenutno ni mogoče posodobiti." };

    if (currentProfile.username.toLowerCase() !== username.toLowerCase()) {
      const { data: available, error: availabilityError } = await supabase.rpc(
        "is_username_available",
        { candidate_username: username },
      );
      if (availabilityError) {
        return { status: "error", message: "Razpoložljivosti imena trenutno ni mogoče preveriti." };
      }
      if (!available) return { status: "error", message: unavailableUsername };
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (updateError) {
      if (updateError.message.includes("profiles_username_lower_unique")) {
        return { status: "error", message: unavailableUsername };
      }
      return { status: "error", message: "Uporabniškega imena ni bilo mogoče shraniti." };
    }

    revalidatePath("/account");
    revalidatePath("/account/profile");
    return { status: "success", message: "Uporabniško ime je posodobljeno." };
  } catch {
    return { status: "error", message: "Povezava trenutno ni na voljo. Poskusi znova." };
  }
}

export async function updateEmailAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const validationError = validateEmail(email);
  if (validationError) return { status: "error", message: validationError };

  try {
    const { supabase, user } = await getSignedInClient();
    if (!supabase || !user) return { status: "error", message: "Seja je potekla. Prijavi se znova." };
    if (user.email?.toLowerCase() === email) {
      return { status: "success", message: "E-poštni naslov je že nastavljen na ta naslov." };
    }

    const { error } = await supabase.auth.updateUser({ email });
    if (error) {
      if (error.code === "email_exists" || error.code === "user_already_exists") {
        return { status: "error", message: "Ta e-poštni naslov je že uporabljen." };
      }
      return { status: "error", message: "E-poštnega naslova ni bilo mogoče spremeniti." };
    }

    revalidatePath("/account");
    revalidatePath("/account/profile");
    return {
      status: "success",
      message: "Poslali smo potrditveni sporočili na obstoječi in novi naslov. Sprememba velja po obeh potrditvah.",
    };
  } catch {
    return { status: "error", message: "Povezava trenutno ni na voljo. Poskusi znova." };
  }
}

export async function updatePasswordAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const password = String(formData.get("password") ?? "");
  const validationError = validatePassword(password);
  if (validationError) return { status: "error", message: validationError };

  try {
    const { supabase, user } = await getSignedInClient();
    if (!supabase || !user) return { status: "error", message: "Seja je potekla. Prijavi se znova." };

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { status: "error", message: "Gesla ni bilo mogoče spremeniti. Poskusi z drugim geslom." };

    revalidatePath("/account/profile");
    return { status: "success", message: "Geslo je bilo spremenjeno." };
  } catch {
    return { status: "error", message: "Povezava trenutno ni na voljo. Poskusi znova." };
  }
}

export async function updateFactionSelectionAction(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const rawIds = formData.getAll("factionIds");
  const factionIds = rawIds.map((value) => Number(value));
  if (
    factionIds.length === 0 ||
    factionIds.some((id) => !Number.isSafeInteger(id) || id < 1 || id > 32767) ||
    new Set(factionIds).size !== factionIds.length
  ) {
    return { status: "error", message: "Izberi vsaj eno veljavno ločino." };
  }

  try {
    const { supabase, user } = await getSignedInClient();
    if (!supabase || !user) return { status: "error", message: "Seja je potekla. Prijavi se znova." };

    const { error } = await supabase.rpc("set_user_factions", {
      target_faction_ids: factionIds,
    });
    if (error) {
      if (error.message.includes("Choose at least one faction")) {
        return { status: "error", message: "Izberi vsaj eno ločino." };
      }
      return { status: "error", message: "Izbire ločin ni bilo mogoče shraniti. Poskusi znova." };
    }

    revalidatePath("/account");
    revalidatePath("/account/profile");
    return { status: "success", message: "Izbira ločin je shranjena." };
  } catch {
    return { status: "error", message: "Povezava trenutno ni na voljo. Poskusi znova." };
  }
}
