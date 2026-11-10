"use client";

import { useActionState, useState, type FormEvent } from "react";
import Link from "next/link";
import { registerAction } from "./actions";
import {
  validateRegistration,
  type RegistrationActionState,
  type RegistrationField,
} from "@/features/auth/registration-validation";

const initialState: RegistrationActionState = {
  status: "idle",
  message: "",
  fieldErrors: {},
};

export function RegistrationForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [clientErrors, setClientErrors] = useState<Partial<Record<RegistrationField, string>>>({});

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const result = validateRegistration({
      email: String(formData.get("email") ?? ""),
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    setClientErrors(result.fieldErrors);
    if (Object.keys(result.fieldErrors).length > 0) event.preventDefault();
  }

  return (
    <form action={formAction} onSubmit={validateBeforeSubmit} className="space-y-5" noValidate>
      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
            state.status === "error"
              ? "border-[#55344f] bg-[#271827] text-[#ffc1d8]"
              : "border-[#51416f] bg-[#211b36] text-[#c9b9ff]"
          }`}
        >
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
          aria-invalid={Boolean(clientErrors.email || state.fieldErrors.email)}
          aria-describedby={clientErrors.email || state.fieldErrors.email ? "email-error" : undefined}
          className="w-full rounded-xl border border-[#393452] bg-[#0e1122] px-4 py-3 outline-none transition placeholder:text-[#8983a2] focus:border-[#9a83e8] focus:ring-2 focus:ring-[#9a83e8]/25 aria-[invalid=true]:border-[#b96787]"
          placeholder="ime@primer.si"
        />
        {(clientErrors.email || state.fieldErrors.email) && <p id="email-error" className="mt-2 text-sm text-[#ffb6d0]">{clientErrors.email ?? state.fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="username" className="mb-2 block text-sm font-medium">Uporabniško ime</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          minLength={3}
          maxLength={30}
          pattern="[A-Za-z0-9_]+"
          aria-invalid={Boolean(clientErrors.username || state.fieldErrors.username)}
          aria-describedby={clientErrors.username || state.fieldErrors.username ? "username-error" : "username-help"}
          className="w-full rounded-xl border border-[#393452] bg-[#0e1122] px-4 py-3 outline-none transition placeholder:text-[#8983a2] focus:border-[#9a83e8] focus:ring-2 focus:ring-[#9a83e8]/25 aria-[invalid=true]:border-[#b96787]"
          placeholder="npr. ana_123"
        />
        <p id={clientErrors.username || state.fieldErrors.username ? "username-error" : "username-help"} className={`mt-2 text-sm ${clientErrors.username || state.fieldErrors.username ? "text-[#ffb6d0]" : "text-[#aaa5c0]"}`}>
          {clientErrors.username ?? state.fieldErrors.username ?? "3–30 znakov: črke, številke in podčrtaj."}
        </p>
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">Geslo</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={20}
          aria-invalid={Boolean(clientErrors.password || state.fieldErrors.password)}
          aria-describedby={clientErrors.password || state.fieldErrors.password ? "password-error" : "password-help"}
          className="w-full rounded-xl border border-[#393452] bg-[#0e1122] px-4 py-3 outline-none transition placeholder:text-[#8983a2] focus:border-[#9a83e8] focus:ring-2 focus:ring-[#9a83e8]/25 aria-[invalid=true]:border-[#b96787]"
          placeholder="Ustvari močno geslo"
        />
        <p id={clientErrors.password || state.fieldErrors.password ? "password-error" : "password-help"} className={`mt-2 text-sm leading-6 ${clientErrors.password || state.fieldErrors.password ? "text-[#ffb6d0]" : "text-[#aaa5c0]"}`}>
          {clientErrors.password ?? state.fieldErrors.password ?? "8–20 znakov, z veliko in malo črko, številko ter posebnim znakom (~ ! @ # $ ^ * _ { } | : ? ` - = [ ] ; ’ , . /)."}
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-full bg-[#22203d] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#423875] disabled:cursor-wait disabled:opacity-65"
      >
        {isPending ? "Ustvarjam račun …" : "Ustvari račun"}
      </button>

      <p className="text-center text-sm text-[#b9b4cf]">
        Že imaš račun? <Link href="/login" className="font-semibold text-[#c9b9ff] underline underline-offset-4">Prijava</Link>
      </p>
    </form>
  );
}
