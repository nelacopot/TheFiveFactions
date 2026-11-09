# The Five Factions

Spletna aplikacija za razvijanje vrlin s tedenskimi nalogami, skupnostnim preverjanjem dokazil in spremljanjem napredka. Arhitekturne odločitve, podatkovni model in obseg so opisani v mapi [docs](docs/).

## Tehnologije

- **Aplikacija:** Next.js, React, TypeScript, Tailwind CSS
- **Strežniška logika:** Next.js Server Actions in Route Handlers (`frontend/`)
- **Podatkovne storitve:** Supabase PostgreSQL, Auth in Storage
- **Lokalni Supabase:** Supabase CLI in Docker

Frontend in backend sta namenoma en Next.js modularni monolit; mapa `backend/` ne predstavlja ločenega API strežnika.

## Lokalni zagon

Potrebujete Node.js LTS, npm, Docker Desktop (ali združljiv pogon vsebnikov) in Supabase CLI.

1. V korenski mapi projekta zaženite `npx supabase start`.
2. V drugem terminalu pojdite v `frontend`, namestite pakete z `npm install` in kopirajte `.env.example` v `.env.local`.
3. V `.env.local` nastavite lokalni Supabase `API URL` in `anon` ključ, ki ju izpiše `supabase start`.
4. Zaženite aplikacijo z `npm run dev` in odprite `http://localhost:3000`.

Lokalni Supabase Studio je privzeto na `http://127.0.0.1:54323`. Spremembe sheme bodo dodane kot ločene migracije v `supabase/migrations/`.

## Ukazi v mapi `frontend`

- `npm run dev` – razvojni strežnik
- `npm run build` – produkcijska gradnja
- `npm run lint` – preverjanje sloga kode
- `npm run typecheck` – preverjanje TypeScript tipov

V repozitorij nikoli ne dodajajte `.env.local`, servisnega ključa ali drugih skrivnosti.
