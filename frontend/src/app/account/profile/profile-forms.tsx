"use client";

import { useActionState } from "react";
import {
  updateEmailAction,
  updatePasswordAction,
  updateUsernameAction,
} from "./actions";
import type { ProfileActionState } from "./profile-state";

const initialState: ProfileActionState = { status: "idle", message: "" };
const fieldClass = "retro-input mt-2";
const buttonClass = "retro-button disabled:cursor-wait disabled:opacity-65";

function ActionMessage({ state }: { state: ProfileActionState }) {
  if (!state.message) return null;
  const success = state.status === "success";
  return (
    <p
      role={success ? "status" : "alert"}
      aria-live="polite"
      className={`mb-4 border-2 px-3 py-2 text-sm leading-6 ${success ? "retro-paper" : "border-[#c07d98] bg-[#3b2030] text-[#ffd3e2]"}`}
    >
      {state.message}
    </p>
  );
}

export function ProfileForms({ email, username }: { email: string; username: string }) {
  const [usernameState, usernameAction, usernamePending] = useActionState(updateUsernameAction, initialState);
  const [emailState, emailAction, emailPending] = useActionState(updateEmailAction, initialState);
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePasswordAction, initialState);

  return (
    <div className="space-y-5">
      <section className="retro-panel p-4 sm:p-5">
        <h2 className="border-b border-dotted border-[#9279b2] pb-2 text-xl">Uporabniško ime</h2>
        <p className="mt-2 text-xs text-[#d3c4e5]">To ime je vidno drugim članom.</p>
        <form action={usernameAction} className="mt-5 space-y-4">
          <ActionMessage state={usernameState} />
          <div>
            <label htmlFor="username" className="font-mono text-xs font-bold">Novo uporabniško ime</label>
            <input id="username" name="username" type="text" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" defaultValue={username} autoComplete="username" className={fieldClass} />
            <p className="mt-2 font-mono text-[10px] leading-5 text-[#d3c4e5]">3–30 znakov: črke, številke in podčrtaj.</p>
          </div>
          <button type="submit" disabled={usernamePending} className={buttonClass}>{usernamePending ? "Shranjujem …" : "Shrani uporabniško ime"}</button>
        </form>
      </section>

      <section className="retro-panel p-4 sm:p-5">
        <h2 className="border-b border-dotted border-[#9279b2] pb-2 text-xl">E-poštni naslov</h2>
        <p className="mt-2 font-mono text-xs text-[#d3c4e5]">Trenutni naslov: <span className="text-[#e7ed86]">{email}</span></p>
        <form action={emailAction} className="mt-5 space-y-4">
          <ActionMessage state={emailState} />
          <div>
            <label htmlFor="new-email" className="font-mono text-xs font-bold">Novi e-poštni naslov</label>
            <input id="new-email" name="email" type="email" required maxLength={254} autoComplete="email" className={fieldClass} placeholder="ime@primer.si" />
            <p className="mt-2 font-mono text-[10px] leading-5 text-[#d3c4e5]">Za spremembo potrdi povezavi, ki ju pošljemo na obstoječi in novi naslov.</p>
          </div>
          <button type="submit" disabled={emailPending} className={buttonClass}>{emailPending ? "Pošiljam …" : "Pošlji potrditvi"}</button>
        </form>
      </section>

      <section className="retro-panel p-4 sm:p-5">
        <h2 className="border-b border-dotted border-[#9279b2] pb-2 text-xl">Geslo</h2>
        <form action={passwordAction} className="mt-5 space-y-4">
          <ActionMessage state={passwordState} />
          <div>
            <label htmlFor="new-password" className="font-mono text-xs font-bold">Novo geslo</label>
            <input id="new-password" name="password" type="password" required minLength={8} maxLength={20} autoComplete="new-password" className={fieldClass} />
            <p className="mt-2 font-mono text-[10px] leading-5 text-[#d3c4e5]">8–20 znakov, velika in mala črka, številka ter posebni znak (~ ! @ # $ ^ * _ { } | : ? ` - = [ ] ; ’ , . /).</p>
          </div>
          <button type="submit" disabled={passwordPending} className={buttonClass}>{passwordPending ? "Spreminjam …" : "Spremeni geslo"}</button>
        </form>
      </section>
    </div>
  );
}
