"use server";

import { createClient } from "@/lib/supabase/server";
import {
  validateRegistration,
  type RegistrationActionState,
} from "@/features/auth/registration-validation";

export async function registerAction(
  _previousState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> {
  const result = validateRegistration({
    email: String(formData.get("email") ?? ""),
    username: String(formData.get("username") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (Object.keys(result.fieldErrors).length > 0) {
    return { status: "error", message: "Preveri označena polja.", fieldErrors: result.fieldErrors };
  }

  try {
    const supabase = await createClient();
    const { data: usernameAvailable, error: availabilityError } = await supabase.rpc(
      "is_username_available",
      { candidate_username: result.values.username },
    );

    if (availabilityError) {
      return {
        status: "error",
        message: "Trenutno ni mogoče preveriti uporabniškega imena. Poskusi znova.",
        fieldErrors: {},
      };
    }
    if (!usernameAvailable) {
      return {
        status: "error",
        message: "To uporabniško ime ni na voljo. Izberi drugo.",
        fieldErrors: { username: "To uporabniško ime ni na voljo." },
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: result.values.email,
      password: result.values.password,
      options: {
        data: {
          username: result.values.username,
          display_name: result.values.username,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("profiles_username_lower_unique")) {
        return {
          status: "error",
          message: "To uporabniško ime ni na voljo. Izberi drugo.",
          fieldErrors: { username: "To uporabniško ime ni na voljo." },
        };
      }
      return {
        status: "error",
        message: "Registracije ni bilo mogoče dokončati. Preveri podatke in poskusi znova.",
        fieldErrors: {},
      };
    }

    // Supabase may return an empty identity list for an email that already exists.
    // Keep the confirmation response neutral so account existence is not disclosed.
    const message = data.user?.identities?.length === 0
      ? "Če za ta e-poštni naslov račun že obstaja, preveri prejeta sporočila."
      : "Račun je ustvarjen. Za nadaljevanje potrdi svoj e-poštni naslov prek poslanega sporočila.";

    return { status: "success", message, fieldErrors: {} };
  } catch {
    return {
      status: "error",
      message: "Povezava trenutno ni na voljo. Poskusi znova čez trenutek.",
      fieldErrors: {},
    };
  }
}
