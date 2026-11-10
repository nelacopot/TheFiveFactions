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
    <details className="rounded-2xl border border-[#704359] bg-[#211722] p-5 sm:p-7">
      <summary className="cursor-pointer font-serif text-2xl text-[#ffc1d8]">Izbriši račun</summary>
      <div className="mt-4 space-y-4 text-sm leading-6 text-[#d7c3cf]">
        <p>Trajno bodo izbrisani tvoj profil, izbrane ločine, naloge, dokazila, fotografije in zgodovina odločitev. Tega dejanja ni mogoče razveljaviti.</p>
        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="delete-account-confirmation" className="block font-medium text-[#f0edfa]">
              Za potrditev vpiši <span className="font-bold">IZBRIŠI</span>
            </label>
            <input
              id="delete-account-confirmation"
              name="confirmation"
              type="text"
              required
              autoComplete="off"
              className="mt-2 w-full rounded-xl border border-[#704359] bg-[#0e1122] px-4 py-3 text-[#f0edfa] outline-none focus:border-[#ff91b9] focus:ring-2 focus:ring-[#ff91b9]/20"
            />
          </div>
          {state.message && (
            <p role="alert" aria-live="polite" className="rounded-xl border border-[#704359] bg-[#2d1b28] px-4 py-3 text-sm text-[#ffc1d8]">
              {state.message}
            </p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full border border-[#b75679] bg-[#54243a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#71304d] disabled:cursor-wait disabled:opacity-65"
          >
            {pending ? "Brišem račun …" : "Trajno izbriši račun"}
          </button>
        </form>
      </div>
    </details>
  );
}
