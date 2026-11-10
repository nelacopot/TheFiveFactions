import Link from "next/link";
import { logoutAction } from "@/app/login/actions";

type AccountNavigationProps = {
  active?: "reviews" | "profile";
};

export function AccountNavigation({ active }: AccountNavigationProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-double border-[#9279b2] pb-3">
      <Link href="/account" className="inline-flex items-center gap-2 text-white no-underline" aria-label="HOME — nadzorna plošča">
        <span className="grid size-9 place-items-center border-2 border-white bg-[#523477] font-serif text-lg">5</span>
        <span className="font-mono text-xs font-bold uppercase tracking-wider">The Five Factions</span>
      </Link>

      <nav aria-label="Glavni meni" className="flex flex-wrap items-center gap-1.5">
        <Link href="/account/reviews" aria-current={active === "reviews" ? "page" : undefined} className="retro-nav-link">
          <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <circle cx="9" cy="8" r="3" />
            <path d="M3.5 19v-1.2A4.8 4.8 0 0 1 8.3 13h1.4a4.8 4.8 0 0 1 4.8 4.8V19" />
            <path d="M16 5.3a3 3 0 0 1 0 5.8M17 13.2a4.8 4.8 0 0 1 3.5 4.6V19" />
          </svg>
          <span>Preverjanje dokazil</span>
        </Link>

        <Link href="/account/profile" aria-label="PROFIL — urejanje profila in ločin" aria-current={active === "profile" ? "page" : undefined} className="retro-nav-link">
          <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <circle cx="12" cy="8" r="3.3" />
            <path d="M5 20v-1.1a7 7 0 0 1 14 0V20H5Z" />
          </svg>
          <span>Profil</span>
        </Link>

        <form action={logoutAction}>
          <button type="submit" className="retro-nav-link">
            Odjava
          </button>
        </form>
      </nav>
    </header>
  );
}
