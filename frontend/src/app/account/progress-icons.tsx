type RankShieldProps = { rank: number };
type StreakFlameProps = { weeks: number };

export function RankShield({ rank }: RankShieldProps) {
  return (
    <span role="img" aria-label={`Rang ${rank}`} className="relative grid size-16 shrink-0 place-items-center text-[#e2d9ff]">
      <svg viewBox="0 0 64 72" className="absolute inset-0 size-full" aria-hidden="true">
        <path d="M32 3 57 12v19c0 17-10 29-25 38C17 60 7 48 7 31V12L32 3Z" fill="#292344" stroke="#a78bfa" strokeWidth="2.5" />
        <path d="M32 10 51 17v14c0 13-7 23-19 31-12-8-19-18-19-31V17l19-7Z" fill="none" stroke="#7863b5" strokeWidth="1" />
      </svg>
      <span className="relative font-serif text-xl font-semibold">{rank}</span>
    </span>
  );
}

export function StreakFlame({ weeks }: StreakFlameProps) {
  return (
    <span role="img" aria-label={`${weeks} zaporednih aktivnih tednov`} className="relative grid size-16 shrink-0 place-items-center text-[#f5dcff]">
      <svg viewBox="0 0 64 72" className="absolute inset-0 size-full" aria-hidden="true">
        <path d="M36 4c2 12-1 17-7 24-5 6-10 11-10 20a16 16 0 0 0 32 0c0-12-7-18-11-28-1 7-3 10-6 13 2-10 3-18 2-29Z" fill="#48244c" stroke="#d38aff" strokeWidth="2.5" />
        <path d="M32 36c0 5-7 8-7 14a8 8 0 0 0 16 0c0-5-3-8-5-12-.5 3-1 5-2 6 0-3 0-6-2-8Z" fill="#a955ca" />
      </svg>
      <span className="relative translate-y-2 font-serif text-xl font-semibold">{weeks}</span>
    </span>
  );
}
