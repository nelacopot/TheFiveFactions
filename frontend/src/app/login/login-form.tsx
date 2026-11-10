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
        <p role="status" className="rounded-xl border border-[#51416f] bg-[#211b36] px-4 py-3 text-sm leading-6 text-[#c9b9ff]">
          {notice}
        </p>
      )}
      {state.message && (
        <p role="alert" aria-live="polite" className="rounded-xl border border-[#55344f] bg-[#271827] px-4 py-3 text-sm leading-6 text-[#ffc1d8]">
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
          className="w-full rounded-xl border border-[#393452] bg-[#0e1122] px-4 py-3 outline-none transition placeholder:text-[#8983a2] focus:border-[#9a83e8] focus:ring-2 focus:ring-[#9a83e8]/25"
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
          className="w-full rounded-xl border border-[#393452] bg-[#0e1122] px-4 py-3 outline-none transition placeholder:text-[#8983a2] focus:border-[#9a83e8] focus:ring-2 focus:ring-[#9a83e8]/25"
          placeholder="Vnesi geslo"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-full bg-[#22203d] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#423875] disabled:cursor-wait disabled:opacity-65"
      >
        {isPending ? "Prijavljam …" : "Prijava"}
      </button>

      <p className="text-center text-sm text-[#b9b4cf]">
        Še nimaš računa? <Link href="/register" className="font-semibold text-[#c9b9ff] underline underline-offset-4">Registracija</Link>
      </p>
    </form>
  );
}
