# Lokalni razvoj s Supabase CLI in Dockerjem

## Context and Problem Statement

The Five Factions uporablja Next.js za spletni vmesnik in strežniško logiko ter Supabase za PostgreSQL, avtentikacijo in shrambo datotek. Za razvoj in testiranje potrebujem lokalno okolje, v katerem lahko preverjam registracijo, uporabniške vloge, tedenske naloge, oddajo dokazil in njihovo preverjanje, ne da bi pri tem posegala v produkcijske podatke ali bila odvisna od oddaljenega projekta Supabase.Izbrati moram način lokalnega zagona aplikacije in njenih podpornih storitev, ki je dovolj preprost za samostojen razvoj ter dovolj ponovljiv, da je mogoče enako okolje vzpostaviti tudi na drugem računalniku.

## Considered Options

* Supabase CLI z lokalnim okoljem v Dockerju (Supabase CLI zažene lokalne storitve Supabase, vključno s PostgreSQL, Auth in Storage, v kontejnerjih. Next.js se zažene ločeno z razvojnim strežnikom Node.js)
* Uporaba samo oddaljenega projekta Supabase (Next.js teče lokalno, vendar se povezuje z oddaljeno podatkovno bazo, avtentikacijo in shrambo Supabase)
* Ročna postavitev lokalnega PostgreSQL in nadomestnih storitev (podatkovna baza bi tekla lokalno, avtentikacijo in shrambo datotek pa bi bilo treba konfigurirati posebej ali simulirati z drugimi orodji)
* Lastna konfiguracija Docker Compose za vse storitve (razvojno okolje bi bilo sestavljeno iz ročno konfiguriranih kontejnerjev za podatkovno bazo in druge potrebne storitve)

## Decision Outcome

Chosen option: "Supabase CLI z lokalnim okoljem v Dockerju", KER je to najbolj neposredna možnost za razvoj aplikacije, ki uporablja Supabase. CLI zagotavlja lokalno različico povezanih Supabase storitev, Docker pa omogoča izoliran in ponovljiv zagon teh storitev. Tako lahko večino funkcionalnosti razvijam in preverjam brez uporabe produkcijskih podatkov. Next.js bo tekel lokalno z razvojnim strežnikom, Supabase storitve pa bo upravljal Supabase CLI.

<!-- This is an optional element. Feel free to remove. -->
### Consequences

* Good, because razvijalec lahko lokalno testira PostgreSQL, avtentikacijo in shrambo datotek skupaj, namesto da bi moral te storitve sestavljati ali simulirati posebej
* Good, because Next.js in Supabase se lahko razvijata hkrati na istem računalniku, brez ločenega gostovanega okolja za vsako spremembo
* Good, because konfiguracija Supabase in migracije v repozitoriju pomagajo ustvariti ponovljivo razvojno okolje na drugem računalniku
* Bad, because lokalni zagon Supabase zahteva Docker ali drugo združljivo okolje za kontejnerje in lahko porabi precej pomnilnika ter prostora na disku
* Bad, because lokalno okolje ni samodejno identično gostovanemu produkcijskemu okolju. Razlike v konfiguraciji, skrivnostih in zunanjih storitvah je treba preveriti pred uvedbo
* Bad, because razvijalec mora pravilno nastaviti lokalne spremenljivke okolja in paziti, da skrivnosti ali resnični uporabniški podatki ne zaidejo v repozitorij