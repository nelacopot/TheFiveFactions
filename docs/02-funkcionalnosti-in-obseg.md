Opredelite uporabniške vloge, funkcionalnosti in obseg rešitve.

Vključite:

- **Uporabniške vloge**

    Opišite vsaj tri smiselne uporabniške vloge. Za vsako navedite, kaj lahko počne in katerih pravic nima.

- **Predvidene funkcionalnosti**

    Pripravite seznam 10–15 predvidenih funkcionalnosti.

    Funkcionalnosti naj opisujejo vsebinsko uporabo rešitve, ne samo splošnih možnosti, kot so prijava, registracija, pregled, dodajanje, urejanje in brisanje.

    Izberite 5–7 funkcionalnosti, ki so ključne za prvo delujočo različico (označite jih z oznako MVP). Vsaj 3 od teh funkcionalnosti morajo biti domensko specifične, torej značilne za vašo rešitev (in ne samo CRUD).


- **Kasnejše nadgradnje**

    Navedite vsaj 5 možnih nadgradenj.


- **Out of scope**

    Po alinejah navedite funkcionalnosti, ki  jih v tem projektu ne boste implementirali oz. kaj vaš projekt ne bo.


---

# Uporabniške vloge #

The Five Factions ima 3 uporabniške vloge:
- Član
- Moderator
- Administrator

### Član ločine (Faction Member) ###

Tipični uporabnik aplikacije, ki želi razvijati svoje vrline, opravljati tedenske naloge in spremljati svoj napredek.

Dovoljene aktivnosti:

- registracija, prijava, upravljanje lastnega uporabniškega profila
- izbira ene ali več ločin ("factions") oz. vrlin
- pregled njegovih vrlin
- pregled tedenskih nalog, ki so mu dodeljene glede na izbrano vrlino in stopnjo napredka
- označevanje tedenskih nalog kot opravljenih
- oddaja dokazil o opravljenih nalogah, na primer opisa, razmisleka ali fotografije
- pregled statusa oddanih dokazil in povratnih informacij drugih članov
- potrjevanje ali zavračanje dokazil drugih članov
- spremljanje lastnih stopenj, zaporedja aktivnih tednov in splošnega napredka
- prijava neprimerne vsebine dokazil

Omejitve:

- ne more spreminjati sistemskih pravil napredovanja, rangov ali tedenskih nalog
- ne more ustvarjati ali spreminjati vgrajenih frakcij in nalog
- ne more spreminjati vlog uporabnikov ali upravljati uporabniške račune drugih članov
- ne more potrjevati lastnih dokazil opravljene naloge
- ne more spreminjati rezultatov preverjanja že oddanih dokazil

### Moderator ###

Moderator skrbi za varnost in poštenost v skupnosti, predvsem pri medsebojnem preverjanju dokazil.

Dovoljene aktivnosti:

- pregled prijav neprimerne vsebine ali zlorab pri preverjanju dokazil
- skrivanje neprimerne vsebine
- posredovanje nepravilnih dokazil v ponovno preverjanje
- obravnava prijav
- dokumentiranje razlogov za ukrep moderatorja
- lahko uporablja aplikacijo tudi kot **običajni član** ter opravlja naloge in preverja dokazila drugih članov

Omejitve:

- ne more upravljati vseh uporabniških računov
- ne more dodeljevati administratorskih pravic
- ne more ustvarjati ločin, spreminjati nalog ali določati pravil rangiranja
- glede dokazil poseže predvsem ob prijavah, sporih ali ob sumu zlorabe

### Administrator ###

Administrator skrbi za tehnično in vsebinsko upravljanje aplikacije in osnovna pravila delovanja

Dovoljene aktivnosti:

- upravljanje uporabniških računov in dodeljevanje uporabniških vlog
- ustvarjanje, urejanje in deaktiviranje ločin
- ustvarjanje in urejanje tedenskih nalog ter povezovanje nalog z ločinami
- nastavljanje pravil napredovanja, rangov, tedenskih "ciklov" ...
- upravljanje osnovnih nastavitev sistema in pregledovanje podatkov, potrebnih za vzdrževanje aplikacije

Omejitve:

- ne more spreminjati gesel uporabnikov (vsaj ne tako, da bi jih lahko prebral)
- ne more brez ustreznega razloga na skrivaj spreminjati zgodovino opravljenih nalog
- ne rabi sodelovati pri preverjanju dokazil: to je naloga članov in moderatorjev (v primeru težav)

---

# Funkcionalnosti #

1. (MVP) ***Registracija in prijava uporabnikov***

Uporabnik ustvari račun in se prijavi v aplikacijo. Sistem preverja identiteto uporabnika ter mu omogoči dostop do njegovih podatkov in funkcionalnosti.

2. (MVP) ***Izbira in upravljanje ločin ("factions")***

Uporabnik izbere eno ali več ločin (factions), ki predstavljajo vrline, na katerih želi delati. Če jih izbere več, se njegov profil označi kot **Divergent**.

3. (MVP) ***Pregled osebnega napredka***

Uporabnik na nadzorni plošči (dashboard) spremlja svoje izbrane ločine, trenutne range in zaporedje aktivnih tednov (streak).

4. (MVP) ***Dodeljevanje in pregled tedenskih nalog + obvestila zanje (notifications)***

Sistem uporabniku zagotovi tedenske naloge, povezane z njegovo eno ali več ločinami. Vsaj v prvi različici spletne rešitve, se naloge dodeljujejo na podlagi ločin in vnaprej določenih nalog glede rang in napredek v posamezni vrlini.

5. (MVP) ***Oddaja dokazil o opravljenih nalogah***

Uporabnik k nalogi doda opis izvedbe, osebni razmislek ali fotografijo kot dokazilo. Sistem shrani dokazilo in status dokazila.

6. (MVP) ***Medsebojno preverjanje dokazil***

Drugi člani (torej ne tisti, ki je dokazilo vložil) lahko dokazilo potrdijo ali zavrnejo. Ena potrditev drugega člana zadostuje za uspešno potrjeno nalogo. Član ne more potrditi svojega lastnega dokazila.

7. (MVP) ***Napredovanje po ločinah in spremljanje zaporednih aktivnih tednov (streak)***

Na podlagi potrjenih nalog se v sistemu beleži napredek uporabnika. Opravljene naloge vplivajo na stopnjo napredka v posameznih ločinah. Zaporedni tedni, v katerih so bile opravljene vse naloge, so beleženi s "streak".

8. ***Preizkus za priporočilo ločine***

Uporabnik ima na voljo vprašalnik, na podlagi katerega sistem predlaga ločine, ki bi mu lahko ustrezale. Dejanska izbira ločine je vseeno svobodna izbira uporabnika.

9. ***Prilagajanje težavnosti nalog rangu uporabnika***

Sistem pri dodeljevanju nalog upošteva rang uporabnika in pravila posamezne ločine, tako da naloge postanejo vedno bolj zahtevne.

10. ***Obravnava prijav in spornih dokazil***

Uporabniki lahko prijavijo neprimerno vsebino ali zlorabo. Moderator prijavo pregleda in po potrebi skrije vsebino ali zahteva ponovno preverjanje

11. ***Znižanje ranga in status Factionless***

Ob daljši neaktivnosti se uporabniku niža stopnja. Po izredno dolgi neaktivnosti lahko izgubi vse svoje ločine oz. vrline in prodobi status Factionless.

12. ***Upravljanje ločin in nalog***

Administrator ustvarja in ureja ločine, njihove opise, naloge ter povezave med nalogami in ločinami.

13. ***Upravljanje uporabnikov in uporabniških vlog***

Administrator upravlja uporabniške račune in določa, kateri uporabniki imajo pravice člana ločin, moderatorja ali administratorja.


---

# Kasnejše nadgradnje

1. ***Zgodovina opravljenih nalog***

Uporabnik si lahko ogleda pretekle naloge, oddana dokazila, rezultate preverjanj dokazil in spremembe svojega napredka.

2. ***Avtomatizacija dodeljevanja nalog***

Namesto velike baze vnaprej določenih nalog, bi se lahko glede ranga in zgodovine opravljenih nalog, naloge dinamično dodeljevale posameznikom (potencialno preko umetne inteligence). Tako bi bile naloge zagotovljene vsak teden za neomejen čas.

3. ***Personalizacija dodeljenih nalog***

Naloge bodo v osnovni verziji določene za vse uporabnike enako, če so le-ti v enakem rangu z enakim "streak" v isti ločini. Nadgradnja bi lahko šla v smer personalizacije, da lahko uporabnik v nastavitvah določi, katere tipe aktivnosti si želi. 

Npr. v "Grit faction" lahko označi, da želi glede telesnih aktivnosti izvajati predvsem aktivnosti, ki temeljijo na kondiciji (npr. tek, kolesarjenje ...) in tako bo dobil manj telesnih aktivnosti, ki temeljijo na moči (npr. dvigovanje uteži).

Personalizacija bi se lahko dodala tudi s "Shuffle" funkcijo, ki bi zamenjala naloge, ki so dodeljene uporabniku, z drugačnimi.

4. ***Podrobna statistika glede na zgodovino***

Podrobnejši grafi in analitike glede na zgodovino, lahko tudi statistika posameznih tipov aktivnosti, npr. število prebranih strani, število pretečenih kilometrov, število minut meditacije ...

---

# Out of scope

Naslednje funkcionalnosti NE bodo implementirane:
- posebej namenski mobilni aplikaciji za Android in iOS (razvila bom samo spletno rešitev, ki pa bo imela ustrezen prikaz tudi na mobilnih napravah)

- samodejno preverjanje dokazil z umetno inteligenco (potrjevanje in zavračanje dokazil bodo izvajali uporabniki)

- integracija s pametnimi urami ali drugimi zunanjimi napravami

- sistem družbenega omrežja (projekt ne bo vseboval celotnega klepetalnega sistema in možnosti spremljanja vseh ostalih uporabnikov, občutek za skupnost bom zagotavljala zgolj preko medsebojnega preverjanja dokazil)
