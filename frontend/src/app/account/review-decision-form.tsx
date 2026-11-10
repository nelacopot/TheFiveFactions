"use client";

import { useActionState } from "react";
import { reviewEvidenceAction, type ReviewActionState } from "./review-actions";

const initialState: ReviewActionState = { status: "idle", message: "" };

export function ReviewDecisionForm({ evidenceId }: { evidenceId: string }) {
  const [state, formAction, pending] = useActionState(reviewEvidenceAction, initialState);

  return (
    <form action={formAction} className="mt-6 border-t border-[#302b4b] pt-5">
      <input type="hidden" name="evidenceId" value={evidenceId} />
      <p className="text-sm font-medium text-[#d3c5ff]">Ali je dokazilo ustrezno za potrjeno opravljeno nalogo?</p>
      {state.message && <p role="alert" className="mt-3 rounded-xl border border-[#704359] bg-[#2d1b28] px-4 py-3 text-sm text-[#ffc1d8]">{state.message}</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          name="decision"
          value="approved"
          disabled={pending}
          className="rounded-full border border-[#3e6659] bg-[#172a25] px-5 py-2.5 text-sm font-semibold text-[#b9eedb] transition hover:bg-[#214034] disabled:opacity-60"
        >
          Potrdi dokazilo
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected"
          disabled={pending}
          className="rounded-full border border-[#704359] bg-[#2d1b28] px-5 py-2.5 text-sm font-semibold text-[#ffc1d8] transition hover:bg-[#462536] disabled:opacity-60"
        >
          Zavrni dokazilo
        </button>
      </div>
    </form>
  );
}
