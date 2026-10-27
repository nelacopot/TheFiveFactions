# Uporaba Tailwind CSS za oblikovanje uporabniškega vmesnika

## Context and Problem Statement

The Five Factions bo odzivna spletna aplikacija, ki bo vsebovala več različnih vrst zaslonov: registracijo in prijavo, izbiro ločin, nadzorno ploščo z napredkom, sezname tedenskih nalog, obrazce za oddajo dokazil ter vmesnike za moderatorja in administratorja. Potrebujemo način oblikovanja, ki omogoča dosleden videz, prilagoditev različnim velikostim zaslona in učinkovito izdelavo ter spreminjanje uporabniškega vmesnika znotraj izbranega sklada Next.js, React in TypeScript.

## Considered Options

* Tailwind CSS (utility-first CSS-ogrodje, pri katerem se videz elementov določa z razredi neposredno v JSX/TSX komponentah)
* Navadni CSS in CSS Modules (slogovna pravila se pišejo v ločenih datotekah, pri CSS Modules pa so slogi omejeni na posamezne komponente)
* Komponentno CSS-ogrodje, npr. Bootstrap ali Material UI (uporaba že pripravljenih komponent in privzetih slogov za običajne vzorce uporabniškega vmesnika)

## Decision Outcome

Chosen option: "Tailwind CSS", KER omogoča hitro izdelavo in prilagajanje odzivnega uporabniškega vmesnika, ne da bi aplikacijo zavezali k vnaprej določenemu videzu komponent. Utility razredi omogočajo dosledno oblikovanje obrazcev, gumbov, kartic, seznamov nalog, oznak statusov in nadzorne plošče. Tailwind se lahko uporablja neposredno v komponentah React in ima uradna navodila za integracijo z Next.js.

Tailwind CSS bo primarni način oblikovanja aplikacije. Po potrebi bo še vedno mogoče uporabiti globalni CSS ali CSS Modules za posebne sloge, ki jih z utility razredi ni smiselno izraziti. Ponovljene vzorce oblikovanja bom, kjer je to smiselno, združila v ponovno uporabne React komponente, da se iste dolge kombinacije razredov ne bodo nepotrebno podvajale.

<!-- This is an optional element. Feel free to remove. -->
### Consequences

* Good, because omogoča hitro sestavljanje in spreminjanje vmesnikov neposredno ob komponentah React
* Good, because podpira odzivno oblikovanje z razredi za različne velikosti zaslonov, kar ustreza uporabi aplikacije tudi na mobilnih napravah
* Good, because omogoča izdelavo izvirnega videza The Five Factions brez potrebe, da bi aplikacija prevzela celoten videz vnaprej pripravljenega komponentnega ogrodja (kot pri Bootstrap-u)
* Good, because skupne oblikovalske vzorce je mogoče poenotiti in uporabiti v različnih delih aplikacije

* Bad, because razvijalec se mora naučiti Tailwindovih razredov in pravil odzivnega oblikovanja
* Bad, because zelo posebne animacije ali kompleksni, unikatni slogi lahko še vedno zahtevajo dodaten CSS
* … <!-- numbers of consequences can vary -->