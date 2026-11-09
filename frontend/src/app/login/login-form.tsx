"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "./actions";
import type { LoginActionState } from "./login-state";

const initialState: LoginActionState = { status: "idle", message: "" };

export function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {notice && (
        <p role="status" className="rounded-xl border border-[#c8d8c9] bg-[#edf5ed] px-4 py-3 text-sm leading-6 text-[#294738]">
          {notice}
        </p>
      )}
      {state.message && (
        <p role="alert" aria-live="polite" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">E-poštni naslov</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="w-full rounded-xl border border-[#d8d5cb] bg-white px-4 py-3 outline-none transition placeholder:text-[#9a9f96] focus:border-[#526e5c] focus:ring-2 focus:ring-[#526e5c]/15"
          placeholder="ime@primer.si"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">Geslo</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-[#d8d5cb] bg-white px-4 py-3 outline-none transition placeholder:text-[#9a9f96] focus:border-[#526e5c] focus:ring-2 focus:ring-[#526e5c]/15"
          placeholder="Vnesi geslo"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-full bg-[#263a31] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#344d41] disabled:cursor-wait disabled:opacity-65"
      >
        {isPending ? "Prijavljam …" : "Prijava"}
      </button>

      <p className="text-center text-sm text-[#6c746a]">
        Še nimaš računa? <Link href="/register" className="font-semibold text-[#294738] underline underline-offset-4">Registracija</Link>
      </p>
    </form>
  );
}
