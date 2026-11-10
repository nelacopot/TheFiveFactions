import Link from "next/link";
import { logoutAction } from "@/app/login/actions";

type AccountNavigationProps = {
  active?: "reviews" | "profile";
};

export function AccountNavigation({ active }: AccountNavigationProps) {
  const linkClass = (isActive: boolean) =>
    `inline-flex min-h-10 items-center gap-2 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition sm:px-4 ${isActive ? "bg-[#27203c] text-[#e2d9ff] ring-1 ring-[#62518d]" : "text-[#aaa5c0] hover:bg-[#171a31] hover:text-white"}`;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <Link href="/account" className="inline-flex items-center gap-3" aria-label="HOME — nadzorna plošča">
        <span className="grid size-10 place-items-center rounded-full bg-[#22203d] font-serif text-lg text-[#f0edfa]">5</span>
        <span className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-[#e2d9ff] sm:inline">The Five Factions</span>
      </Link>

      <nav aria-label="Glavni meni" className="flex items-center gap-1 sm:gap-2">
        <Link href="/account/reviews" aria-current={active === "reviews" ? "page" : undefined} className={linkClass(active === "reviews")}>
          <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <circle cx="9" cy="8" r="3" />
            <path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19" />
            <path d="M16 5.3a3 3 0 0 1 0 5.8M17 13.2a4.8 4.8 0 0 1 3.5 4.6V19" />
          </svg>
          <span className="hidden sm:inline">Preverjanje dokazil</span>
          <span className="sr-only sm:hidden">Preverjanje dokazil</span>
        </Link>

        <Link href="/account/profile" aria-label="PROFIL — urejanje profila in ločin" aria-current={active === "profile" ? "page" : undefined} className={linkClass(active === "profile")}>
          <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <circle cx="12" cy="8" r="3.3" />
            <path d="M5 20v-1.1a7 7 0 0 1 14 0V20H5Z" />
          </svg>
          <span className="hidden sm:inline">Profil</span>
        </Link>

        <form action={logoutAction}>
          <button type="submit" className="min-h-10 rounded-full border border-[#7762be] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#c9b9ff] transition hover:bg-[#38305f] hover:text-white sm:px-4">
            Odjava
          </button>
        </form>
      </nav>
    </header>
  );
}
