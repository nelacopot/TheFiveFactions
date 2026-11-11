"use client";

import { useActionState } from "react";
import {
  deleteAccountAction,
  type AccountDeletionState,
} from "./deletion-actions";

const initialState: AccountDeletionState = { message: "" };

export function AccountDeletionForm() {
  const [state, action, pending] = useActionState(deleteAccountAction, initialState);

  return (
    <details className="border-2 border-[#b76688] bg-[#251325] p-4">
      <summary className="cursor-pointer font-serif text-xl text-[#ffc1d8]">Izbriši račun</summary>
      <div className="mt-4 space-y-4 text-sm leading-6 text-[#ead8e2]">
        <p>Trajno bodo izbrisani tvoj profil, izbrane ločine, naloge, dokazila, fotografije in zgodovina odločitev. Tega dejanja ni mogoče razveljaviti.</p>
        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="delete-account-confirmation" className="block font-mono text-xs font-bold text-[#f0edfa]">
              Za potrditev vpiši <span className="font-bold">IZBRIŠI</span>
            </label>
            <input
              id="delete-account-confirmation"
              name="confirmation"
              type="text"
              required
              autoComplete="off"
              className="retro-input mt-2"
            />
          </div>
          {state.message && (
            <p role="alert" aria-live="polite" className="border-2 border-[#c07d98] bg-[#3b2030] px-3 py-2 text-sm text-[#ffd3e2]">
              {state.message}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="retro-button border-[#b75679] bg-[#54243a] disabled:cursor-wait disabled:opacity-65"
          >
            {pending ? "Brišem račun …" : "Trajno izbriši račun"}
          </button>
        </form>
      </div>
    </details>
  );
}
