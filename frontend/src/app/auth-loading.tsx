import { FactionsLogo } from "@/components/factions-logo";

export function AuthLoading() {
  return (
    <main className="retro-site grid place-items-center px-5" aria-busy="true" aria-live="polite">
      <div className="retro-window max-w-sm">
        <div className="retro-titlebar flex items-center justify-between"><span className="inline-flex items-center gap-2"><FactionsLogo size={28} /> THE FIVE FACTIONS</span><span aria-hidden="true">_ □ ×</span></div>
        <p className="retro-panel font-mono text-sm">Nalagam stran …</p>
      </div>
    </main>
  );
}
