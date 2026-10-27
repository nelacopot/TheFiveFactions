# Uporaba PostgreSQL relacijske podatkovne baze

## Context and Problem Statement

The Five Factions potrebuje trajno shranjevanje uporabniških profilov in vlog, izbranih ločin, predlog in tedenskih dodelitev nalog, dokazil ter odločitev pri medsebojnem preverjanju. Ti podatki so med seboj tesno povezani, aplikacija pa mora zagotavljati njihovo doslednost: na primer, dokazilo mora pripadati obstoječi dodelitvi naloge, preverjanje mora biti povezano z obstoječim dokazilom in uporabnikom, uporabnik pa istega dokazila ne sme preverjati večkrat. Izbrati je treba podatkovno bazo, ki dobro podpira takšne povezave, omejitve in poizvedbe za izračun napredka.

## Considered Options

* PostgreSQL relacijska PB (podatki so organizirani v povezane tabele, njihove povezave in veljavnost pa je mogoče uveljavljati s primarnimi in tujimi ključi, unikatnimi omejitvami ter transakcijami)
* MySQL/MariaDB relacijska PB (podatki so organizirani v tabele in povezani z relacijami)
* MongoDB dokumentna PB (podatke shranjuje v dokumentih s prilagodljivo strukturo, določene povezave med različnimi vrstami podatkov pa bi bilo treba obravnavati na ravni aplikacije ali s skrbno zasnovanimi referencami)
* SQLite vgrajena relacijska PB (preprosta za lokalne prototipe in manjše aplikacije, vendar je manj primerna kot osrednja podatkovna baza za spletno aplikacijo, ki jo uporablja več uporabnikov in potrebuje deljeno strežniško okolje)


## Decision Outcome

Chosen option: "PostgreSQL relacijska PB", KER relacijski model ustreza strukturi podatkov The Five Factions, hkrati pa omogoča uveljavljanje podatkovne celovitosti in dosledno izvajanje sprememb, ki so med seboj povezane.

Podatki bodo razdeljeni v povezane tabele, kot so profili uporabnikov, uporabniške vloge, ločine, članstva v ločinah, predloge nalog, tedenske dodelitve, dokazila in preverjanja dokazil. Podrobna struktura entitet in njihovih atributov je določena v dokumentu 03-podatkovni-model.md.

Primarni ključi bodo enolično identificirali zapise, tuji ključi pa bodo zagotavljali, da se povezave nanašajo na obstoječe zapise. Unikatne omejitve bodo uporabljene tam, kjer je treba preprečiti podvojitve, na primer pri članstvu uporabnika v isti ločini, pri dodelitvi iste predloge naloge istemu uporabniku za isti teden in pri večkratnem preverjanju istega dokazila s strani istega člana.

Poizvedbe SQL bodo uporabljene za pridobivanje povezanih podatkov in izračun prikaza napredka. Pri operacijah, ki morajo biti medsebojno usklajene, npr. potrditvi dokazila, označitvi dodeljene naloge kot opravljene in posodobitvi napredka, bo treba zagotoviti transakcijsko oziroma drugo ustrezno atomarno izvajanje, da ne pride do delno posodobljenega stanja.

V izbrani tehnični zasnovi bo PostgreSQL zagotavljal Supabase. Ta ADR se nanaša na izbiro vrste in sistema podatkovne baze, odločitev za Supabase kot platformo za podatkovne storitve, Supabase Auth in Supabase Storage pa je opisana v ločenih ADR-jih.

<!-- This is an optional element. Feel free to remove. -->
### Consequences

* Good, because relacije med uporabniki, ločinami, nalogami, dodelitvami, dokazili in preverjanji so jasno predstavljene s tabelami in tujimi ključi
* Good, because primarni ključi, tuji ključi in unikatne omejitve pomagajo preprečevati neveljavne povezave ter podvojene zapise
* Good, because transakcije omogočajo, da se povezana poslovna stanja posodobijo kot celota, kar je pomembno pri potrjevanju dokazil in izračunu napredka.
* Good, because relacijski model je dovolj strukturiran za preverljiva pravila sistema, hkrati pa omogoča nadaljnje razširitve z dodatnimi tabelami, na primer za prijave vsebine, obvestila in zgodovino napredka
* Bad, because pri spremembah podatkovnega modela je treba načrtovati shemo in migracije ter upoštevati obstoječe povezave in omejitve.
* Bad, because zahtevnejše poizvedbe čez več tabel so lahko kompleksnejše kot branje posameznega dokumenta v dokumentni bazi.