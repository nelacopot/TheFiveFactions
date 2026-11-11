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
        <p role="status" className="retro-paper px-3 py-2 text-sm leading-6">
          {notice}
        </p>
      )}
      {state.message && (
        <p role="alert" aria-live="polite" className="border-2 border-[#c07d98] bg-[#3b2030] px-3 py-2 text-sm leading-6 text-[#ffd3e2]">
          {state.message}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-2 block font-mono text-xs font-bold">E-poštni naslov</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="retro-input"
          placeholder="ime@primer.si"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block font-mono text-xs font-bold">Geslo</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="retro-input"
          placeholder="Vnesi geslo"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="retro-button w-full disabled:cursor-wait disabled:opacity-65"
      >
        {isPending ? "Prijavljam …" : "Prijava"}
      </button>

      <p className="text-center font-mono text-xs">
        Še nimaš računa? <Link href="/register">Registracija</Link>
      </p>
    </form>
  );
}
