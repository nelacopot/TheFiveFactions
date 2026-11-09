# Strežniška logika

Strežniški del aplikacije se izvaja znotraj Next.js modularnega monolita v `frontend/src/`:

- `app/api/` vsebuje Route Handlers za namenske HTTP končne točke;
- funkcionalni moduli bodo za spremembe, sprožene v UI, uporabljali Server Actions;
- `lib/supabase/server.ts` zagotavlja strežniški Supabase odjemalec, ki uporablja uporabniško sejo.

Mapa je ohranjena kot orientacijska točka začetne strukture repozitorija; ločen Express/Nest backend ni del izbrane arhitekture.
