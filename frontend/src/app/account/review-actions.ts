"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ReviewActionState = {
  status: "idle" | "error";
  message: string;
};

export async function reviewEvidenceAction(
  _previousState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const evidenceId = String(formData.get("evidenceId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(evidenceId)) {
    return { status: "error", message: "Dokazilo ni veljavno." };
  }
  if (decision !== "approved" && decision !== "rejected") {
    return { status: "error", message: "Izberi potrditev ali zavrnitev." };
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { status: "error", message: "Za pregled se ponovno prijavi." };

    const { data: evidence, error: evidenceError } = await supabase
      .from("evidence")
      .select("id, assignment_id, status")
      .eq("id", evidenceId)
      .maybeSingle();
    if (evidenceError || !evidence || evidence.status !== "awaiting_review") {
      return { status: "error", message: "To dokazilo ni več na voljo za preverjanje." };
    }

    const { data: assignment, error: assignmentError } = await supabase
      .from("task_assignments")
      .select("user_id")
      .eq("id", evidence.assignment_id)
      .maybeSingle();
    if (assignmentError || !assignment) {
      return { status: "error", message: "Povezane naloge ni mogoče najti." };
    }
    if (assignment.user_id === user.id) {
      return { status: "error", message: "Svojega dokazila ne moreš preveriti." };
    }

    const { error: reviewError } = await supabase.from("evidence_reviews").insert({
      evidence_id: evidence.id,
      reviewer_id: user.id,
      decision,
    });
    if (reviewError) {
      if (reviewError.code === "23505") {
        return { status: "error", message: "Za to dokazilo si odločitev že oddal_a." };
      }
      if (reviewError.message.includes("already been decided")) {
        return { status: "error", message: "Drug član je to dokazilo že preveril." };
      }
      return { status: "error", message: "Odločitve ni bilo mogoče shraniti. Poskusi znova." };
    }

    revalidatePath("/account/reviews");
    revalidatePath("/account");
    revalidatePath("/account/factions/[factionId]", "page");
    redirect(`/account/reviews?result=${decision}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { status: "error", message: "Pri shranjevanju odločitve je prišlo do napake." };
  }
}
