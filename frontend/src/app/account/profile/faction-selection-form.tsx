"use client";

import { useActionState } from "react";
import { updateFactionSelectionAction } from "./actions";
import type { ProfileActionState } from "./profile-state";

type FactionOption = {
  id: number;
  name: string;
  description: string;
};

const initialState: ProfileActionState = { status: "idle", message: "" };

export function FactionSelectionForm({
  factions,
  selectedFactionIds,
}: {
  factions: FactionOption[];
  selectedFactionIds: number[];
}) {
  const [state, formAction, pending] = useActionState(updateFactionSelectionAction, initialState);
  const success = state.status === "success";

  return (
    <section id="factions" className="rounded-2xl border border-[#302b4b] bg-[#171a31] p-5 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c3a8ff]">Moja pot</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl">Izbrane ločine</h2>
        {selectedFactionIds.length > 1 && (
          <span title="Trenutno razvijaš več kot eno vrlino." className="rounded-full border border-[#62518d] bg-[#27203c] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#d3c5ff]">
            Divergent
          </span>
        )}
      </div>
      <p className="mt-1 text-sm leading-6 text-[#aaa5c0]">Izberi vsaj eno ločino. Izbiro lahko pozneje spremeniš.</p>

      <form action={formAction} className="mt-5 space-y-3">
        {state.message && (
          <p
            role={success ? "status" : "alert"}
            aria-live="polite"
            className={`mb-4 rounded-xl border px-4 py-3 text-sm leading-6 ${success ? "border-[#51416f] bg-[#211b36] text-[#c9b9ff]" : "border-[#55344f] bg-[#271827] text-[#ffc1d8]"}`}
          >
            {state.message}
          </p>
        )}
        {factions.map((faction) => (
          <label key={faction.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#302b4b] bg-[#12162a] p-4 transition hover:border-[#5c5475]">
            <input
              type="checkbox"
              name="factionIds"
              value={faction.id}
              defaultChecked={selectedFactionIds.includes(faction.id)}
              className="mt-1 size-4 accent-[#9a83e8]"
            />
            <span>
              <span className="block font-serif text-xl">{faction.name}</span>
              <span className="mt-1 block text-sm leading-6 text-[#b9b4cf]">{faction.description}</span>
            </span>
          </label>
        ))}
        <button type="submit" disabled={pending} className="rounded-full bg-[#22203d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#423875] disabled:cursor-wait disabled:opacity-65">
          {pending ? "Shranjujem …" : "Shrani izbor"}
        </button>
      </form>
    </section>
  );
}
