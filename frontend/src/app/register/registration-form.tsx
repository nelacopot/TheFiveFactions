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
            ? "border-[#c07d98] bg-[#3b2030] text-[#ffd3e2]"
              : "retro-paper"
          }`}
        >
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
          aria-invalid={Boolean(clientErrors.email || state.fieldErrors.email)}
          aria-describedby={clientErrors.email || state.fieldErrors.email ? "email-error" : undefined}
          className="retro-input aria-[invalid=true]:border-[#b96787]"
          placeholder="ime@primer.si"
        />
        {(clientErrors.email || state.fieldErrors.email) && <p id="email-error" className="mt-2 text-sm text-[#ffb6d0]">{clientErrors.email ?? state.fieldErrors.email}</p>}
      </div>

      <div>
        <label htmlFor="username" className="mb-2 block font-mono text-xs font-bold">Uporabniško ime</label>
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
          className="retro-input aria-[invalid=true]:border-[#b96787]"
          placeholder="npr. ana_123"
        />
        <p id={clientErrors.username || state.fieldErrors.username ? "username-error" : "username-help"} className={`mt-2 font-mono text-[10px] ${clientErrors.username || state.fieldErrors.username ? "text-[#ffb6d0]" : "text-[#d3c4e5]"}`}>
          {clientErrors.username ?? state.fieldErrors.username ?? "3–30 znakov: črke, številke in podčrtaj."}
        </p>
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block font-mono text-xs font-bold">Geslo</label>
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
          className="retro-input aria-[invalid=true]:border-[#b96787]"
          placeholder="Ustvari močno geslo"
        />
        <p id={clientErrors.password || state.fieldErrors.password ? "password-error" : "password-help"} className={`mt-2 font-mono text-[10px] leading-5 ${clientErrors.password || state.fieldErrors.password ? "text-[#ffb6d0]" : "text-[#d3c4e5]"}`}>
          {clientErrors.password ?? state.fieldErrors.password ?? "8–20 znakov, z veliko in malo črko, številko ter posebnim znakom"}
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="retro-button w-full disabled:cursor-wait disabled:opacity-65"
      >
        {isPending ? "Ustvarjam račun …" : "Ustvari račun"}
      </button>

      <p className="text-center font-mono text-xs">
        Že imaš račun? <Link href="/login">Prijava</Link>
      </p>
    </form>
  );
}
