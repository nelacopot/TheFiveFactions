# The Five Factions

The Five Factions je spletna aplikacija za razvijanje petih vrlin z izbirnimi ločinami, tedenskimi nalogami, skupnostnim preverjanjem dokazil ter spremljanjem ranga in streaka. Uporabnik lahko razvija eno ali več ločin: **Altruism**, **Intellect**, **Grit**, **Harmony** in **Verity**.

## Tehnološki pregled

- **Spletni vmesnik in strežniška logika:** Next.js 16, React 19, TypeScript in Tailwind CSS 4 (`frontend/`).
- **Podatkovne storitve:** Supabase PostgreSQL, Auth in Storage (`supabase/`).
- **Lokalno okolje:** Supabase CLI zažene storitve v Dockerju. Frontend in backend sta en Next.js modularni monolit; `backend/` ni ločen strežnik.
- **Migracije in začetni podatki:** časovno označene SQL migracije v `supabase/migrations/`. Migracije ustvarijo shemo, ločine in katalog nalog; `supabase/seed.sql` je trenutno prazen.

Podrobnejše odločitve, podatkovni model in uporabniške zgodbe so v mapi [`docs/`](docs/). Navodila za Supabase so tudi v [`supabase/README.md`](supabase/README.md).

## Predpogoji

Namesti in zaženi:

1. **[Node.js 20.9 ali novejši](https://nodejs.org/en/download/)** ter npm.
2. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (ali drugo Docker API združljivo okolje). Docker mora teči, preden zaženeš Supabase.
3. Dostop do interneta ob prvem zagonu, da Supabase CLI prenese potrebne slike vsebnikov.

Supabase CLI se uporablja prek `npx`, zato ga ni treba nameščati globalno. Za uradna navodila glej [Supabase lokalni razvoj](https://supabase.com/docs/guides/local-development).

## Prvi lokalni zagon

Vsi ukazi za Supabase se izvajajo iz **korenske mape repozitorija**, kjer je mapa `supabase/`. Ukazi `npm` se izvajajo iz `frontend/`.

### 1. Zaženi Supabase in podatkovno bazo

Odpri Docker Desktop, nato v korenski mapi projekta zaženi:

```powershell
npx supabase start
```

Prvi zagon lahko traja dlje, ker se prenesejo Docker slike. CLI zažene PostgreSQL, Supabase Auth, Storage, Studio in Mailpit ter na sveži lokalni bazi uporabi migracije in seed. Ko se zagon konča, si zabeleži vrednosti, ki jih CLI izpiše. Pozneje jih lahko ponovno prikažeš z:

```powershell
npx supabase status
```

Uporabi lokalni **API URL**, javni **anon/publishable key** in **secret/service-role key**. Imena ključev so odvisna od različice CLI-ja. Secret/service-role key je samo za strežnik in se ne sme dodati v spremenljivko `NEXT_PUBLIC_`.

### 2. Nastavi okolje Next.js aplikacije

V drugem terminalu, iz korenske mape:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

Odpri `frontend/.env.local` in nastavi vrednosti za `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `SUPABASE_SECRET_KEY` iz izpisa `npx supabase status`. `SUPABASE_SERVICE_ROLE_KEY` je podprto kot starejše ime za strežniški ključ.

`SMTP_URL` in `SMTP_FROM` lahko za lokalne aplikacijske e-poštne notifikacije pustita vrednosti iz primera. Nastavi tudi zasebno, naključno vrednost za `NOTIFICATION_CRON_SECRET`; ta varuje notranjo končno točko za pošiljanje čakajočih notifikacij in ni uporabniško geslo. Nobene skrivnosti ne vnašaj v `NEXT_PUBLIC_*` spremenljivke.

### 3. Nastavi SMTP za potrditvena e-sporočila

Registracija zahteva potrditev e-poštnega naslova. Supabase Auth pošilja potrditvena sporočila prek SMTP ponudnika, določenega v `supabase/config.toml`. Za lokalno registracijo zato nastavi račun pri SMTP ponudniku:

```powershell
Copy-Item supabase/.env.example supabase/.env.local
```

V `supabase/.env.local` nastavi `AUTH_SMTP_HOST`, `AUTH_SMTP_USER`, `AUTH_SMTP_PASSWORD` in `AUTH_SMTP_SENDER_EMAIL` na veljavne vrednosti ponudnika. Naslov pošiljatelja mora ponudnik dovoljevati. Po spremembi konfiguracijo Supabase ponovno zaženi:

```powershell
npx supabase stop
npx supabase start
```

**Auth potrditvena sporočila gredo prek tega zunanjega SMTP ponudnika**, zato se pojavijo v pravem nabiralniku. Lokalni Mailpit je namenjen aplikacijskim notifikacijam, kot so nove tedenske naloge in odločitve o dokazilih; Auth potrditvenih sporočil ne prestreza.

### 4. Namesti pakete in zaženi spletno aplikacijo

V novem terminalu:

```powershell
Set-Location frontend
npm ci
npm run dev
```

V brskalniku odpri **http://127.0.0.1:3000**. Uporabi ta isti naslov tudi pri kliku potrditvene povezave iz e-pošte. Razvojni strežnik ustaviš s `Ctrl+C`.

## Lokalni naslovi

| Storitev | Naslov | Namen |
| --- | --- | --- |
| Aplikacija | [http://127.0.0.1:3000](http://127.0.0.1:3000) | Uporabniški vmesnik |
| Supabase Studio | [http://127.0.0.1:54323](http://127.0.0.1:54323) | Pregled baze, Auth uporabnikov, Storage in SQL Editor |
| Mailpit | [http://127.0.0.1:54324](http://127.0.0.1:54324) | Pregled aplikacijskih e-poštnih notifikacij |
| Supabase API | `http://127.0.0.1:54321` | Lokalni Auth, REST API in Storage endpoint |
| PostgreSQL | `127.0.0.1:54322` | Lokalna podatkovna baza |
| Mailpit SMTP | `127.0.0.1:54325` | SMTP cilj za aplikacijske notifikacije |

Za brskanje po aplikaciji ustvari račun in potrdi njegov e-poštni naslov. Za administratorski razvojni račun glej razdelek »Lokalni skrbniški račun« spodaj.

## Lokalni skrbniški račun

Vsi novi računi samodejno dobijo vlogo `Member`. Za razvoj, ki potrebuje skrbniški dostop:

1. Ustvari račun skozi aplikacijo in potrdi e-poštni naslov.
2. Odpri Supabase Studio → **SQL Editor**.
3. Izvedi poizvedbo spodaj, pri čemer e-pošto zamenjaj s svojim lokalnim naslovom:

```sql
insert into public.user_roles (user_id, role_id, assigned_by)
select p.id, r.id, p.id
from public.profiles p
join auth.users u on u.id = p.id
join public.roles r on r.name = 'Administrator'
where u.email = 'your-local-account@example.com'
on conflict (user_id, role_id) do nothing;
```

To je samo priročen način za vzpostavitev lokalnega razvojnega računa. Ne uporabljaj ga za spreminjanje vlog v produkciji.

## Vsakodnevno delo z bazo

- Migracije dodajaj kot nove, časovno označene datoteke v `supabase/migrations/`; že uporabljene migracije praviloma ne spreminjaj.
- Na že zagnanem lokalnem okolju uporabi `npx supabase migration up` za uporabo še neizvedenih migracij.
- `npx supabase db reset` ponovno ustvari lokalno bazo ter izvede vse migracije in seed. **Izbriše obstoječe lokalne podatke**, zato ga uporabi samo, ko je ponastavitev namerna.
- `supabase/seed.sql` trenutno ne vstavi uporabniških podatkov. Ločine in naloge se ustvarijo z migracijami.
- Tedensko dodeljevanje nalog in izračun napredka poganjajo lokalni `pg_cron` opravki, ustvarjeni v migracijah. Tedenski urnik je določen za nedeljski zaključek po srednjeevropskem času.

Zaustavitev lokalnega Supabase okolja:

```powershell
npx supabase stop
```

## E-pošta notifications

- **Potrditev računa in spremembe e-pošte:** Supabase Auth SMTP nastavitve v `supabase/.env.local`.
- **Notifikacije aplikacije:** `SMTP_URL` in `SMTP_FROM` v `frontend/.env.local`. Privzeto pošiljajo na lokalni Mailpit (`127.0.0.1:54325`), kjer so sporočila vidna na `http://127.0.0.1:54324`.
- **Notifikacijski dispatcher:** za notranji endpoint je potreben `NOTIFICATION_CRON_SECRET`; za poizvedbe s povišanimi pravicami pa strežniški `SUPABASE_SECRET_KEY` oziroma starejši `SUPABASE_SERVICE_ROLE_KEY`.
- V produkciji nastavi SMTP ponudnika in razporejevalnik, ki vsakih nekaj minut pošlje POST na `/api/notifications/dispatch` z glavo `Authorization: Bearer <NOTIFICATION_CRON_SECRET>`.

Podrobnejše nastavitve so opisane v [`supabase/README.md`](supabase/README.md). Ne objavi datotek `.env.local`, SMTP gesel, Supabase secret/service-role ključev ali skrivnosti dispatcherja.

## Ukazi za preverjanje

V mapi `frontend/`:

```powershell
npm run lint       # ESLint
npm run typecheck  # preverjanje TypeScript tipov
npm run build      # produkcijska gradnja Next.js aplikacije
npm run start      # zagon produkcijske gradnje
```

## Struktura repozitorija

```text
docs/                 Arhitektura, obseg, podatkovni model in uporabniške zgodbe
frontend/src/app/     Next.js strani, Server Actions in Route Handlers
frontend/src/lib/     Supabase odjemalci in strežniške podporne funkcije
supabase/config.toml  Lokalna Supabase konfiguracija
supabase/migrations/  Različice sheme in podatkovnih pravil
supabase/templates/   HTML predloge Auth e-poštnih sporočil
```

## Pogoste težave

- **`supabase start` ne zažene storitev:** preveri, ali Docker Desktop teče in ali je na voljo dovolj prostora za Docker slike.
- **Napaka, da so vrata zasedena:** preveri, ali že teče drugo Supabase okolje ali proces na vratih `3000`, `54321`–`54325`.
- **Aplikacija se ne poveže s Supabase:** preveri, ali je lokalni Supabase zagnan in ali se URL ter ključi v `frontend/.env.local` ujemajo z `npx supabase status`; po spremembi env datoteke ponovno zaženi Next.js.
- **Registracija ne pošlje potrditvenega sporočila:** preveri Auth SMTP podatke in dovoljeni sender pri ponudniku. Auth pošta gre prek zunanjega ponudnika, ne prek Mailpita.
- **Aplikacijske notifikacije niso vidne v Mailpitu:** preveri, da je lokalni Supabase zagnan ter da `SMTP_URL` kaže na `smtp://127.0.0.1:54325`.
- **Ponastavitev baze:** uporabi `npx supabase db reset` le, če lahko izgubiš vse lokalne podatke.
