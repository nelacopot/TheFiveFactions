# Uporaba Next.js Server Actions in Route Handlers

## Context and Problem Statement

The Five Factions potrebuje strežniško plast, ki obdeluje uporabniške spremembe in izvaja poslovna pravila, ne da bi bilo treba vzdrževati ločen backend projekt. Primeri takih operacij so izbira ločin, oddaja dokazila, potrjevanje dokazila drugega člana ter urejanje vsebine v administratorskem delu. Izbrati moramo način, kako bo frontend varno komuniciral s strežniško logiko in storitvami Supabase.

## Considered Options

* Next.js Server Actions in Route Handlers (Server Actions za spremembe, ki jih sprožijo dejanja v uporabniškem vmesniku, Route Handlers pa za namenske HTTP/API končne točke)
* Ločen backend z ogrodjem Express ali NestJS (frontend bi prek HTTP API-ja komuniciral z ločeno strežniško aplikacijo)
* Neposredni dostop do Supabase iz brskalnika za večino operacij (odjemalec bi neposredno klical Supabase, poslovna pravila in nadzor dostopa pa bi se večinoma izvajali s pravili RLS ter podatkovnimi omejitvami)

## Decision Outcome

Chosen option: "Next.js Server Actions in Route Handlers", KER omogočata, da frontend in strežniška logika ostaneta v enem projektu, hkrati pa nudita primeren način za obdelavo sprememb in izpostavljanje namenskih HTTP končnih točk. To ustreza obsegu The Five Factions in zmanjša količino infrastrukture, ki jo je treba razviti ter vzdrževati.

Server Actions bom uporabljala predvsem za spremembe, ki jih sprožijo dejanja v uporabniškem vmesniku, npr. posodobitev izbire ločin, oddajo dokazila, odločitev pri preverjanju dokazila ter urejanje nastavitev profila. Route Handlers bom uporabljala, kadar bo potreben izrecen HTTP/API endpoint, na primer za zunanji klic, webhook ali integracijo, ki zahteva določene HTTP metode. Za običajno branje podatkov bom načeloma uporabila strežniške komponente oziroma namensko strežniško podatkovno plast, namesto da bi Server Actions uporabljala kot splošen mehanizem za pridobivanje podatkov.

<!-- This is an optional element. Feel free to remove. -->
### Consequences

* Good, because frontend in strežniška logika ostaneta v istem repozitoriju, zato je lokalni razvoj, testiranje in vzdrževanje preprostejše.
* Good, because Server Actions so primerni za obrazce in spremembe podatkov, Route Handlers pa omogočajo standardne HTTP končne točke, kadar jih aplikacija potrebuje.
* Good, because preverjanje identitete, vlog in poslovnih pravil je mogoče izvajati na strežniški strani pred spremembo podatkov.
* Bad, because logika je še vedno odvisna od Next.js in načina njegovega izvajanja; če bi pozneje potrebovali ločen API za več različnih odjemalcev ali kompleksne dolgotrajne procese, bi bilo treba arhitekturo ponovno oceniti.
* Bad, because razvijalec mora vsak Server Action in zaščiten Route Handler izrecno zavarovati, validirati vhodne podatke in upoštevati pravice uporabnika; ogrodje tega ne zagotovi samodejno za poslovna pravila aplikacije.