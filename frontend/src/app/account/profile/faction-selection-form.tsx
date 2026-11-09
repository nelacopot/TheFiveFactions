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
    <section id="factions" className="rounded-2xl border border-[#ded9ce] bg-white/70 p-5 sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6942]">Moja pot</p>
      <h2 className="mt-2 font-serif text-2xl">Izbrane ločine</h2>
      <p className="mt-1 text-sm leading-6 text-[#788075]">Izberi vsaj eno ločino. Izbiro lahko pozneje spremeniš.</p>

      <form action={formAction} className="mt-5 space-y-3">
        {state.message && (
          <p
            role={success ? "status" : "alert"}
            aria-live="polite"
            className={`mb-4 rounded-xl border px-4 py-3 text-sm leading-6 ${success ? "border-[#c8d8c9] bg-[#edf5ed] text-[#294738]" : "border-rose-200 bg-rose-50 text-rose-800"}`}
          >
            {state.message}
          </p>
        )}
        {factions.map((faction) => (
          <label key={faction.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#ded9ce] bg-[#fbfaf6] p-4 transition hover:border-[#aeb9a9]">
            <input
              type="checkbox"
              name="factionIds"
              value={faction.id}
              defaultChecked={selectedFactionIds.includes(faction.id)}
              className="mt-1 size-4 accent-[#294738]"
            />
            <span>
              <span className="block font-serif text-xl">{faction.name}</span>
              <span className="mt-1 block text-sm leading-6 text-[#6c746a]">{faction.description}</span>
            </span>
          </label>
        ))}
        <button type="submit" disabled={pending} className="rounded-full bg-[#263a31] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#344d41] disabled:cursor-wait disabled:opacity-65">
          {pending ? "Shranjujem …" : "Shrani izbor"}
        </button>
      </form>
    </section>
  );
}
