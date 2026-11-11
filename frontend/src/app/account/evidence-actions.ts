"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EvidenceActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const maximumPhotoBytes = 50 * 1024 * 1024;

function identifyImage(bytes: Uint8Array): { mimeType: string; extension: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return { mimeType: "image/png", extension: "png" };
  }
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") {
    return { mimeType: "image/webp", extension: "webp" };
  }
  return null;
}

export async function submitEvidenceAction(
  assignmentId: string,
  _previousState: EvidenceActionState,
  formData: FormData,
): Promise<EvidenceActionState> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assignmentId)) {
    return { status: "error", message: "Izbrana naloga ni veljavna." };
  }

  const workDescription = String(formData.get("workDescription") ?? "").trim();
  const reflectionText = String(formData.get("reflectionText") ?? "").trim();
  const filePathValue = String(formData.get("filePath") ?? "").trim();
  const filePath = filePathValue || null;

  if (workDescription.length > 5000 || reflectionText.length > 5000) {
    return { status: "error", message: "Opis in razmislek sta lahko dolga največ 5.000 znakov." };
  }
  if (!workDescription && !reflectionText && !filePath) {
    return { status: "error", message: "Dodaj opis, osebni razmislek ali fotografijo." };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { status: "error", message: "Za oddajo dokazila se ponovno prijavi." };

  const { data: assignment, error: assignmentError } = await supabase
    .from("task_assignments")
    .select("id, status")
    .eq("id", assignmentId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (assignmentError || !assignment) {
    return { status: "error", message: "Dokazilo lahko oddaš samo za svojo dodeljeno nalogo." };
  }
  if (!["to_do", "in_progress", "rejected"].includes(assignment.status)) {
    if (filePath && filePath.startsWith(`${user.id}/${assignmentId}/`)) {
      await supabase.storage.from("evidence").remove([filePath]);
    }
    return { status: "error", message: "Za to nalogo trenutno ni mogoče oddati novega dokazila." };
  }

  if (filePath) {
    const expectedPath = new RegExp(`^${user.id}/${assignment.id}/[0-9a-f-]{36}\\.(jpg|png|webp)$`, "i");
    if (!expectedPath.test(filePath)) {
      return { status: "error", message: "Naložene fotografije ni mogoče povezati s to nalogo." };
    }
    const { data: storedPhoto, error: downloadError } = await supabase.storage.from("evidence").download(filePath);
    if (downloadError || !storedPhoto || storedPhoto.size > maximumPhotoBytes) {
      await supabase.storage.from("evidence").remove([filePath]);
      return { status: "error", message: "Fotografije ni bilo mogoče varno prebrati. Poskusi znova." };
    }

    const image = identifyImage(new Uint8Array(await storedPhoto.slice(0, 12).arrayBuffer()));
    if (!image || storedPhoto.type !== image.mimeType || !filePath.endsWith(`.${image.extension}`)) {
      await supabase.storage.from("evidence").remove([filePath]);
      return { status: "error", message: "Naloži veljavno fotografijo v formatu JPEG, PNG ali WebP." };
    }
  }

  const { error: insertError } = await supabase.from("evidence").insert({
    assignment_id: assignment.id,
    work_description: workDescription || null,
    reflection_text: reflectionText || null,
    file_path: filePath,
  });

  if (insertError) {
    if (filePath) await supabase.storage.from("evidence").remove([filePath]);
    if (insertError.message.includes("not accepting evidence")) {
      return { status: "error", message: "Za to nalogo trenutno ni mogoče oddati novega dokazila." };
    }
    return { status: "error", message: "Dokazila ni bilo mogoče oddati. Preveri podatke in poskusi znova." };
  }

  revalidatePath("/account");
  revalidatePath("/account/factions/[factionId]", "page");
  return { status: "success", message: "Dokazilo je oddano in čaka na preverjanje." };
}
