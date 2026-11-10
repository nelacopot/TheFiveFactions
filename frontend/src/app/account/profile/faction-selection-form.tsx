"use client";

import { useActionState } from "react";
import { updateFactionSelectionAction } from "./actions";
import type { ProfileActionState } from "./profile-state";
import { FactionIcon } from "@/components/faction-icon";

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
    <section id="factions" className="retro-panel p-4 sm:p-5">
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl">Izbrane ločine</h2>
        {selectedFactionIds.length > 1 && (
          <span title="Trenutno razvijaš več kot eno vrlino." className="border border-[#d8cc85] bg-[#e7ed86] px-2 py-1 font-mono text-[10px] font-bold uppercase text-[#1e1731]">
            Divergent
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-[#d3c4e5]">Izberi vsaj eno ločino. Izbiro lahko pozneje spremeniš.</p>

      <form action={formAction} className="mt-5 space-y-3">
        {state.message && (
          <p
            role={success ? "status" : "alert"}
            aria-live="polite"
            className={`mb-4 border-2 px-3 py-2 text-sm leading-6 ${success ? "retro-paper" : "border-[#c07d98] bg-[#3b2030] text-[#ffd3e2]"}`}
          >
            {state.message}
          </p>
        )}
        {factions.map((faction) => (
          <label key={faction.id} className="flex cursor-pointer items-center gap-3 border border-dotted border-[#a68ac9] bg-[#100d25]/75 p-3 hover:border-solid hover:bg-[#21183a]">
            <input
              type="checkbox"
              name="factionIds"
              value={faction.id}
              defaultChecked={selectedFactionIds.includes(faction.id)}
              className="size-4 accent-[#e7ed86]"
            />
            <FactionIcon name={faction.name} size={54} />
            <span>
              <span className="block font-serif text-lg">{faction.name}</span>
              <span className="mt-1 block text-xs leading-5 text-[#d3c4e5]">{faction.description}</span>
            </span>
          </label>
        ))}
        <button type="submit" disabled={pending} className="retro-button disabled:cursor-wait disabled:opacity-65">
          {pending ? "Shranjujem …" : "Shrani izbor"}
        </button>
      </form>
    </section>
  );
}
