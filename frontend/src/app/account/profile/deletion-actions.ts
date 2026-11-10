"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AccountDeletionState = { message: string };

async function listEvidenceFilesRecursively(
  admin: ReturnType<typeof createAdminClient>,
  folder: string,
): Promise<string[]> {
  const files: string[] = [];
  const bucket = admin.storage.from("evidence");
  const pageSize = 1000;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await bucket.list(folder, {
      limit: pageSize,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw new Error("Fotografij dokazil ni bilo mogoče pregledati.");

    for (const item of data ?? []) {
      const path = `${folder}/${item.name}`;
      if (item.id === null) {
        files.push(...await listEvidenceFilesRecursively(admin, path));
      } else {
        files.push(path);
      }
    }

    if ((data?.length ?? 0) < pageSize) break;
  }

  return files;
}

export async function deleteAccountAction(
  _previousState: AccountDeletionState,
  formData: FormData,
): Promise<AccountDeletionState> {
  if (String(formData.get("confirmation") ?? "").trim() !== "IZBRIŠI") {
    return { message: "Za potrditev vpiši IZBRIŠI." };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login?status=required");

  if (!process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      message: "Brisanje računa še ni nastavljeno: v frontend/.env.local dodaj SUPABASE_SECRET_KEY iz lokalnega Supabase okolja in ponovno zaženi Next.js.",
    };
  }

  try {
    const admin = createAdminClient();
    const files = await listEvidenceFilesRecursively(admin, user.id);
    for (let index = 0; index < files.length; index += 100) {
      const { error: storageError } = await admin.storage
        .from("evidence")
        .remove(files.slice(index, index + 100));
      if (storageError) {
        return { message: "Brisanje zasebnih fotografij ni uspelo. Račun še ni bil izbrisan; poskusi znova." };
      }
    }

    const { error: deletionError } = await admin.auth.admin.deleteUser(user.id);
    if (deletionError) {
      return { message: "Računa ni bilo mogoče izbrisati. Poskusi znova ali se obrni na podporo." };
    }
  } catch {
    return { message: "Računa ni bilo mogoče izbrisati. Preveri konfiguracijo strežnika in poskusi znova." };
  }

  await supabase.auth.signOut();
  redirect("/login?status=account-deleted");
}
