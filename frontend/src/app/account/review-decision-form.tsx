"use client";

import { useActionState } from "react";
import { reviewEvidenceAction, type ReviewActionState } from "./review-actions";

const initialState: ReviewActionState = { status: "idle", message: "" };

export function ReviewDecisionForm({ evidenceId }: { evidenceId: string }) {
  const [state, formAction, pending] = useActionState(reviewEvidenceAction, initialState);

  return (
    <form action={formAction} className="mt-5 border-t border-dotted border-[#8974a8] pt-4">
      <input type="hidden" name="evidenceId" value={evidenceId} />
      <p className="font-mono text-xs font-bold text-[#e7d8fa]">Odločitev o dokazilu</p>
      {state.message && <p role="alert" className="mt-3 border-2 border-[#c07d98] bg-[#3b2030] px-3 py-2 text-sm text-[#ffd3e2]">{state.message}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          name="decision"
          value="approved"
          disabled={pending}
          className="retro-button border-[#8db69c] bg-[#20352b] disabled:opacity-60"
        >
          Potrdi dokazilo
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected"
          disabled={pending}
          className="retro-button border-[#c07d98] bg-[#3b2030] disabled:opacity-60"
        >
          Zavrni dokazilo
        </button>
      </div>
    </form>
  );
}
