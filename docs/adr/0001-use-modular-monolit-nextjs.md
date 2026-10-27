# Uporaba modularne monolitne arhitekture in Next.js

## Context and Problem Statement

The Five Factions je spletna aplikacija, ki vključuje uporabniške račune in tri vloge, izbiro ločin, tedenske naloge, oddajo in preverjanje dokazil, izračun rangov ... Aplikacija tako potrebuje uporabniški vmesnik in logiko v ozadju (strežniško), ki lahko varno preverja pravice uporabnikov in izvaja vse funkcionalnosti. Za projekt je potrebno izbrati arhitekturo, ki omogoča vse naštete funkcionalnosti, hkrati pa je dovolj preprosta za zagon, testiranje in vzdrževanje lokalno, v okviru tega študentskega projekta.

## Considered Options

* Modularna monolitna arhitektura z Next.js (UI in strežniška logika sta v enem Next.js projektu, koda pa je razdeljena na module)
* Ločen frontend in backend (frontend je samostojna aplikacija, strežniška logika je v ločenem API-ju, npr. z Express)
* Mikrostoritvena arhitektura (posamezna področja, kot uporabniki, naloge, dokazila in napredovanje, so izvedena kot ločene storitve)

## Decision Outcome

Chosen option: "Modularna monolitna arhitektura", KER zagotavlja dovolj jasno ločitev odgovornosti, hkrati pa zmanjša število komponent, ki jih je treba razviji, povezati in vzdrževati po nepotrebnem.

Next.js bo v enem projektu zagotavljal uporabniški vmesnik z Reactom ter strežniško obdelavo. Za obdelavo sprememb podatkov se bodo uporabljale Server Actions, kadar je primerna neposredna strežniška akcija, in Route Handlers, kadar aplikacija potrebuje izrecno HTTP/API končno točko. Branje podatkov bo izvedeno na ustreznem strežniškem ali odjemalskem delu glede na primer uporabe in pravila dostopa. Koda bo organizirana po vsebinskih modulih, na primer profil in uporabniki, ločine, naloge, dokazila, preverjanje, napredovanje ter administracija.

PostgreSQL, avtentikacijo in datotečno shrambo bo zagotavljal Supabase kot zunanja podatkovna platforma. To ne spremeni odločitve, da je aplikacijska koda modularni monolit: Next.js aplikacija ostane ena glavna aplikacija, ki uporablja upravljane podporne storitve.

Vse strežniške akcije in API končne točke, ki spreminjajo podatke ali vračajo zaščitene podatke, bodo preverjale uporabniško sejo, pravice in vhodne podatke. Pravila dostopa na ravni podatkovne baze so dodatno določena z ločeno arhitekturno odločitvijo.

<!-- This is an optional element. Feel free to remove. -->
### Consequences

* Good, because frontend in strežniška logika sta v enem projektu, zato je za razvoj in lokalni zagon potrebnih manj aplikacijskih komponent.
* Good, because skupni TypeScript tipi in moduli zmanjšujejo podvajanje podatkovnih struktur med frontendom in backendom.
* Good, because razvoj je primernejši za obseg projekta, saj ni treba posebej vzpostavljati in povezovati ločenega API-strežnika.
* Good, because logična razdelitev na module omogoča, da se področja, kot so dokazila, napredovanje in moderiranje, razvijajo ločeno znotraj iste aplikacije.
* Bad, because frontend in strežniška logika sta tesneje vezana na Next.js; če bi v prihodnosti potrebovali več ločenih odjemalcev ali neodvisno skaliranje posameznih področij, bi bilo morda treba del funkcionalnosti izločiti v ločen backend.