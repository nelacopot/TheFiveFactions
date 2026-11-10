"use client";

import { useActionState } from "react";
import {
  updateEmailAction,
  updatePasswordAction,
  updateUsernameAction,
} from "./actions";
import type { ProfileActionState } from "./profile-state";

const initialState: ProfileActionState = { status: "idle", message: "" };
const fieldClass = "mt-2 w-full rounded-xl border border-[#393452] bg-[#0e1122] px-4 py-3 outline-none transition placeholder:text-[#8983a2] focus:border-[#9a83e8] focus:ring-2 focus:ring-[#9a83e8]/25";
const buttonClass = "rounded-full bg-[#22203d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#423875] disabled:cursor-wait disabled:opacity-65";

function ActionMessage({ state }: { state: ProfileActionState }) {
  if (!state.message) return null;
  const success = state.status === "success";
  return (
    <p
      role={success ? "status" : "alert"}
      aria-live="polite"
      className={`mb-4 rounded-xl border px-4 py-3 text-sm leading-6 ${success ? "border-[#51416f] bg-[#211b36] text-[#c9b9ff]" : "border-[#55344f] bg-[#271827] text-[#ffc1d8]"}`}
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
      <section className="rounded-2xl border border-[#302b4b] bg-[#171a31] p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c3a8ff]">Profil</p>
        <h2 className="mt-2 font-serif text-2xl">Uporabniško ime</h2>
        <p className="mt-1 text-sm text-[#aaa5c0]">To ime je vidno drugim članom.</p>
        <form action={usernameAction} className="mt-5 space-y-4">
          <ActionMessage state={usernameState} />
          <div>
            <label htmlFor="username" className="text-sm font-medium">Novo uporabniško ime</label>
            <input id="username" name="username" type="text" required minLength={3} maxLength={30} pattern="[A-Za-z0-9_]+" defaultValue={username} autoComplete="username" className={fieldClass} />
            <p className="mt-2 text-xs leading-5 text-[#aaa5c0]">3–30 znakov: črke, številke in podčrtaj.</p>
          </div>
          <button type="submit" disabled={usernamePending} className={buttonClass}>{usernamePending ? "Shranjujem …" : "Shrani uporabniško ime"}</button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#302b4b] bg-[#171a31] p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c3a8ff]">Prijava</p>
        <h2 className="mt-2 font-serif text-2xl">E-poštni naslov</h2>
        <p className="mt-1 text-sm text-[#aaa5c0]">Trenutni naslov: <span className="font-medium text-[#f0edfa]">{email}</span></p>
        <form action={emailAction} className="mt-5 space-y-4">
          <ActionMessage state={emailState} />
          <div>
            <label htmlFor="new-email" className="text-sm font-medium">Novi e-poštni naslov</label>
            <input id="new-email" name="email" type="email" required maxLength={254} autoComplete="email" className={fieldClass} placeholder="ime@primer.si" />
            <p className="mt-2 text-xs leading-5 text-[#aaa5c0]">Za spremembo potrdi povezavi, ki ju pošljemo na obstoječi in novi naslov.</p>
          </div>
          <button type="submit" disabled={emailPending} className={buttonClass}>{emailPending ? "Pošiljam …" : "Pošlji potrditvi"}</button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#302b4b] bg-[#171a31] p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c3a8ff]">Varnost</p>
        <h2 className="mt-2 font-serif text-2xl">Geslo</h2>
        <form action={passwordAction} className="mt-5 space-y-4">
          <ActionMessage state={passwordState} />
          <div>
            <label htmlFor="new-password" className="text-sm font-medium">Novo geslo</label>
            <input id="new-password" name="password" type="password" required minLength={8} maxLength={20} autoComplete="new-password" className={fieldClass} />
            <p className="mt-2 text-xs leading-5 text-[#aaa5c0]">8–20 znakov, velika in mala črka, številka ter posebni znak (~ ! @ # $ ^ * _ { } | : ? ` - = [ ] ; ’ , . /).</p>
          </div>
          <button type="submit" disabled={passwordPending} className={buttonClass}>{passwordPending ? "Spreminjam …" : "Spremeni geslo"}</button>
        </form>
      </section>
    </div>
  );
}
