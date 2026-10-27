# Uporaba Supabase kot podatkovne baze in ponudnika podatkovnih storitev

## Context and Problem Statement

The Five Factions potrebuje podatkovno bazo za povezane podatke aplikacije, avtentikacijo uporabnikov, varno shranjevanje fotografij dokazil in način, da se razvojno okolje čim bolj ujema z okoljem, na katerem se bo aplikacija izvajala. Te dele bi bilo mogoče sestaviti iz več neodvisnih ponudnikov ali jih upravljati samostojno, vendar bi to pomenilo več konfiguracije, integracij in varnostnih nastavitev. Odločiti se je treba, ali uporabiti eno integrirano platformo, kot je Supabase, ali izbrane storitve sestaviti ločeno.

## Considered Options

* Supabase kot integrirana platforma (uporaba upravljane PostgreSQL podatkovne baze, Supabase Auth, Supabase Storage in pravil dostopa, z možnostjo lokalnega zagona podpornih storitev prek Supabase CLI)
* Samostojno upravljanje PostgreSQL in ločene storitve (gostovanje ter vzdrževanje PostgreSQL, izbira ločenega ponudnika za avtentikacijo in ločene storitve za shranjevanje datotek. Za lokalno okolje bi bilo treba konfigurirati in povezati posamezne dele)
* Druga integrirana platforma, npr. Firebase (uporaba enega ponudnika za več podpornih funkcij, vendar z drugačnim podatkovnim modelom in večjo spremembo glede na že izbrani PostgreSQL)

## Decision Outcome

Chosen option: "Supabase kot integrirana platforma", KER združuje storitve, ki jih The Five Factions potrebuje, hkrati pa omogoča uporabo PostgreSQL, ki je bil že izbran kot relacijska podatkovna baza. Tako se zmanjša količina infrastrukture, ki jo je treba samostojno nastaviti in vzdrževati, razvoj aplikacije pa ostane osredotočen na logiko.

Supabase bo uporabljen na naslednji način:
- PostgreSQL: hrani strukturirane podatke, kot so profili uporabnikov, uporabniške vloge, ločine, članstva v ločinah, naloge, tedenske dodelitve, dokazila in odločitve pri preverjanju. Primarni in tuji ključi ter druge omejitve podatkovne baze bodo uporabljeni za ohranjanje podatkovne celovitosti.
- Supabase Auth: upravlja registracijo, prijavo, uporabniške seje in ponastavitev gesla. Lastna tabela profila bo povezana z identifikatorjem računa v Supabase Auth. V aplikacijske tabele zato ne bom shranjevala uporabniških gesel. Uporabniške vloge Member, Moderator in Administrator bodo shranjene in preverjene ločeno v tabelah aplikacije.
- Supabase Storage: hrani fotografije dokazil v zasebnem prostoru datotek (private bucket). V tabeli dokazil bodo shranjeni pot do datoteke in potrebni metapodatki, ne pa vsebina slik kot veliki binarni podatki.
- Row-Level Security (RLS): na tabelah in objektih, kjer je to ustrezno, bodo določena pravila, ki omejujejo dostop glede na identiteto uporabnika in njegova dovoljenja. RLS dopolnjuje strežniško preverjanje pravic v Next.js; ne nadomešča ga.
- Lokalni razvoj: Supabase CLI bo uporabljen za lokalni zagon Supabase storitev, vključno s PostgreSQL, Auth in Storage. Lokalni Supabase se bo zaganjal v okolju, združljivem z Docker API, zato bo za običajen način lokalnega razvoja potreben Docker Desktop ali ustrezna alternativa.

V aplikaciji Next.js bo strežniška logika preverjala sejo, vlogo uporabnika in dovoljenost konkretnega dejanja. Posebej zaščitene operacije, npr. potrditev dokazila, posodobitev statusa naloge in izračun napredka, ne bodo prepuščene zgolj uporabniškemu vmesniku. Skrivni strežniški ključi Supabase ne bodo vključeni v kodo, ki se pošilja brskalniku. Pravila RLS in Storage bodo preverjena s testi dostopa za člana, moderatorja in administratorja.

<!-- This is an optional element. Feel free to remove. -->
### Consequences

* Good, because PostgreSQL, avtentikacija in shramba datotek so na voljo prek ene platforme, zato je manj ločenih storitev za konfiguracijo in povezovanje.
* Good, because Supabase Auth zmanjša potrebo po razvoju in vzdrževanju lastnega sistema za upravljanje gesel ter uporabniških sej.
* Good, because zasebni prostor Storage omogoča ločevanje datotek dokazil od strukturiranih podatkov v podatkovni bazi.
* Good, because Supabase CLI omogoča lokalni razvoj z ustreznimi storitvami in olajša ponovljivo vzpostavitev okolja.


* Bad, because lokalni zagon celotnega sklada potrebuje dodaten prostor, pomnilnik in izvajalnik vsebnikov ter je zahtevnejši kot zagon zgolj spletnega strežnika.
* Bad, because projekt je odvisen od izbranega ponudnika, njegovih funkcionalnosti, omejitev in sprememb cen oziroma pogojev uporabe.
* Bad, because migracije, nastavitve, skrivnosti in konfiguracija med lokalnim ter gostovanim okoljem morajo biti skrbno usklajene, da ne pride do razlik med okolji.
