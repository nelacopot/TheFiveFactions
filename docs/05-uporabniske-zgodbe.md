Napišite kakovostne uporabniške zgodbe za vse (dovolj je 15) vaše funkcionalnosti. Pri tem upoštevajte vse kar ste že definirali pri 1. nalogi.

**Uporabniške zgodbe strukturirajte tako:**

Kot [uporabniška vloga] želim [dejanje/cilj], da [razlog/vrednost].

**Za vsako uporabniško zgodbo napišite:**

- oznako, npr. US-01,
- povezano funkcionalnost,
- uporabniško vlogo,
- accceptance criteria (3-5 za vsak US).

Pogoji naj bodo konkretni in preverljivi. Ne pišite splošnih zahtev, npr. “aplikacija mora biti uporabniku prijazna”.

**INVEST** Criteria: Independent, Negotiable, Valuable, Estimable, Small, and Testable.

### **Primer uporabniške zgodbe in acceptance criteria:**

**User story:**
 As a customer, I want to search for products by name so I can quickly find the items I’m looking for.

**Acceptance criteria:**

- The system returns all products that exactly match the entered search term.
- The system returns partial matches when the user enters at least three characters.
- Search results display the product name, image, and price in a clear and organized layout.
- The search results page supports pagination, displaying a maximum of 20 results per page.
- If no results are found, the system displays a “No results found” message with helpful next steps.

---

### 1. Registracija in prijava uporabnikov (MVP)

- **Oznaka**: US-01
- **Povezana funkcionalnost**: Registracija in prijava uporabnikov
- **Uporabniška vloga**: Običajni uporabnik (član/member)

**Uporabniška zgodba**

Kot obiskovalec želim ustvariti uporabniški račun in se prijaviti v aplikacijo, da lahko izbiram ločine, opravljam tedenske naloge in spremljam svoj napredek.

**Acceptance criteria**

1. Sistem omogoča registracijo z veljavnim elektronskim naslovom, uporabniškim imenom in geslom. Elektronski naslov in uporabniško ime morata biti unikatna. Geslo mora biti dolgo 8-20 znakov, vsebovati mora vsaj eno veliko črko, vsaj eno malo črko, vsaj eno številko in vsaj en posebni znak (~ ! @ # $ ^ * _ { } | : ? ` - = [ ] ; ’ , . /). Uporabnik mora svoj elektronski naslov potrditi ob prvi registraciji s klikom na povezavo v potrditvenem e-sporočilu, preden se lahko prvič prijavi.
2. Pri zasedenem uporabniškem imenu uporabnik dobi sporočilo, da uporabniško ime ni na voljo.
3. Ob vnosu pravilnih prijavnih podatkov sistem uporabniku omogoči dostop do njegovega računa. Ob napačnih podatkih dostop zavrne in o tem prikaže sporočilo uporabniku.
4. Prijavljeni uporabnik se lahko odjavi in ureja svoje osnovne profilne podatke (e-poštni naslov, uporabniško ime in geslo), ne more pa spreminjati profila drugega uporabnika.
Če uporabnik spremeni e-poštni naslov ali uporabniško ime, morata biti ta prav tako unikatna (kot ob registraciji)
5. Prijavljeni uporabnik ostane prijavljen do konca trajanja seje (15 min neaktivnosti)

---

### 2. Izbira in upravljanje ločin (MVP)

- **Oznaka**: US-02
- **Povezana funkcionalnost**: Izbira in upravljanje ločin (*factions*)
- **Uporabniška vloga**: Običajni uporabnik (član/member)

**Uporabniška zgodba**

Kot uporabnik želim izbirati eno ali več ločin, da lahko začnem razvijati vrline, ki so mi pomembne.

**Acceptance criteria**
1. Spletna rešitev prikaže seznam aktivnih ločin: Altruism, Intellect, Grit, Harmony in Verity skupaj z njihovimi opisi.
2. Uporabnik lahko izbere eno ali več ločin in spremeni svoj izbor tudi po izbiri.
3. Če ima član izbrano natanko eno ločino, njegov profil ni označen kot *"Divergent"*. Oznaka služi kot povezava z zgodbo in zgolj označuje osebo kot nekoga, ki trenutno razvija več kot eno vrlino.
4. Sprememba izbora ločin se odrazi na profilu in nadzorni plošči. Zgodovina opravljenih nalog in dokazil se ohrani. Ob odstranitvi ločine se prekličejo oziroma arhivirajo samo še neopravljene dodelitve, povezane s to ločino; naloge drugih aktivnih ločin ostanejo nespremenjene.

---

### 3. Pregled osebnega napredka (MVP)

- **Oznaka**: US-03
- **Povezana funkcionalnost**: Pregled osebnega napredka
- **Uporabniška vloga**: Član ločine

**Uporabniška zgodba**

Kot član ločine želim na nadzorni plošči pregledovati svoj napredek v izbranih ločinah, da lahko hitro ugotovim, kako uspešno razvijam posamezne vrline.

**Acceptance criteria**
1. Nadzorna plošča (dashboard) prikaže vse ločine, ki jih ima član trenutno izbrane oziroma aktivne.
2. Za vsako ločino posebej sistem beleži in prikaže uporabnikov trenutni rang in streak, ki je izračunan po pravilih sistema.
3. Podatki na nadzorni plošči se posodobijo, ko se spremeni članov izbor ločin, rang ali streak (to pomeni, da so v odvisnosti od opravljenih nalog za posamezni teden - torej, ali so vse naloge opravljene ali ne).
4. Rang in streak se posodobita na koncu tedna, v nedeljo ob 23:59 po centralnem evropskem času.

---

### 4. Dodeljevanje in pregled tedenskih nalog ter obvestila (MVP)

- **Oznaka**: US-04
- **Povezana funkcionalnost**: Dodeljevanje in pregled tedenskih nalog in obvestila
- **Uporabniška vloga**: Član ločine

**Uporabniška zgodba**

Kot član ločine želim vsak teden prejeti seznam nalog, prilagojenim mojim izbranim ločinam in trenutnemu rangu, da vem, katere aktivnosti moram opraviti za nadaljnji razvoj svojih vrlin

**Acceptance criteria**

1. Uporabniku sistem dodeli tedenske naloge glede na njegove izbrane (aktivne) ločine in njegov trenutni rang.
2. Uporabnik lahko pregleda seznam svojih nalog za trenutni teden, vključno z opisom, pripadajočo ločino, rokom in trenutnim statusom (To-Do, In Progress, Awaiting Review, Done ali Rejected).
3. Za istega uporabnika v istem tednu niso dodeljene iste naloge več kot enkrat.
4. Uporabnik dobi obvestilo (notification) na elektronsko pošto, ki jo je navedel ob prijavi, ko so na voljo nove tedenske naloge ali ko se je spremenil status njegovega oddanega dokazila (torej da je bilo dokazilo potrjeno ali zavrnjeno).

---

### 5. Oddaja dokazil o opravljenih nalogah (MVP)

- **Oznaka**: US-05
- **Povezana funkcionalnost**: Oddaja dokazil o opravljenih nalogah
- **Uporabniška vloga**: Član ločine

**Uporabniška zgodba**

Kot član ločine želim k opravljeni nalogi oddati opis mojega opravljanja naloge, osebni razmislek ali fotografijo, da lahko drugi člani preverijo, ali sem nalogo opravil.

**Acceptance criteria**

1. Član lahko odda dokazilo samo za nalogo, ki mu je bila dodeljena
2. Dokazilo mora vsebovati vsaj opis opravljanja, osebni razmislek ali priloženo fotografijo (karkoli od tega, lahko tudi vse, a mora biti vsaj eno)
3. Po oddaji dokazila se dokazilo shrani v sistemu, shrani datum oddaje in status (kar se tiče preverjanja) ter ga označi kot čakajoče na preverjanje. Dokazilo ima 3 možne statuse: čakajoče na preverjanje, potrjeno in zavrnjeno
4. Če je dokazilo zavrnjeno, lahko član za isto dodelitev naloge odda novo dokazilo. Prejšnja oddaja in odločitev ostaneta shranjeni v zgodovini, zavrnjeno dokazilo pa ne more biti naknadno potrjeno.

---

### 6. Medsebojno preverjanje dokazil (MVP)

- **Oznaka**: US-06
- **Povezana funkcionalnost**: Medsebojno preverjanje dokazil
- **Uporabniška vloga**: Član ločine

**Uporabniška zgodba**

Kot član ločine želim pregledovati in potrjevati/zavračati dokazila drugih članov, da skupnost zagotavlja pošteno preverjanje opravljenih nalog in občutek povezanosti.

**Acceptance criteria**

1. Član lahko pregleduje dokazila drugih članov, ki čakajo na preverjanje ter za posamezno dokazilo izbere "potrdi" ali "zavrni"
2. Sistem članu ne dovoli potrditi ali zavrniti lastnega dokazila.
3. Ko član potrdi dokazilo, ga sistem označi kot potrjeno in povezano nalogo kot opravljeno (Done). Za uspešno potrditev zadostuje ena potrditev drugega člana (ne nujno iste ločine).
4. Sistem istemu članu ne dovoli večkrat oddati odločitve za isto dokazilo: ob zavrnitvi (stanje naloge: Rejected) shrani odločitev, je pa avtorju dokazila dovoljeno, da odda novo dokazilo, če ni prepričan, da dokazilo ni dovolj dobro (glede na to, da je bilo zavrnjeno)

---

### 7. Napredovanje po ločinah in spremljanje zaporednih aktivnih tednov - *streak* (MVP)

- **Oznaka**: US-07
- **Povezana funkcionalnost**: Napredovanje po ločinah in spremljanje streak-a
- **Uporabniška vloga**: Član ločine

**Uporabniška zgodba**

Kot član ločine želim, da se potrjene naloge upoštevajo pri napredovanju po posameznih ločinah (torej pri rangu posameznih ločin) in pri spremljanju zaporednih aktivnih tednov (streak), da lahko vidim posledice svoje doslednosti in vloženega truda.

**Acceptance criteria**

1. Sistem pri izračunu napredka upošteva samo uspešno potrjena dokazila.
2. Sprememba ranga se računa tako: 2 tedna opravljanja tedenskih nalog- napredek v rangu. Rang se začne z rangom 1, najvišji možen rang je 10. Če 2 tedna niso opravljene vse naloge za posamezni teden (pri posamezni ločini), rang pade za 1 nivo. 0 je minimalni možen rang in pomeni, da je uporabnik pridobil stanje *Factionless*.
3. Če član v posameznem tednu opravi vse naloge, ki so mu bile dodeljene za to obdobje, sistem po zaključku tedenskega cikla poveča njegov streak za ustrezno ločino. Streak se meri po zaporednih tednih opravljanja nalog: po 4-ih zaporednih tednih ima član ločine streak vrednosti 4.
4. Če član do zaključka tedenskega cikla ne opravi vseh dodeljenih nalog, se njegov streak za to ločino ponastavi v skladu s pravili sistema: streak se resetira na 0.

---

### 8. Preizkus za priporočilo ločine

- **Oznaka**: US-08
- **Povezana funkcionalnost**: Preizkus za priporočilo ločine
- **Uporabniška vloga**: Član ločine oz. običajni uporabnik

**Uporabniška zgodba**

Kot uporabnik želim opraviti preizkus o mojem karakterju in željah, da dobim priporočilo, katere ločine bi bile zame glede na moje odgovore najprimerjnejše.

**Acceptance criteria**

1. Uporabnik lahko kadar koli odpre neobvezen vprašalnik z 10 vprašanji. Sistem mu pred oddajo prikaže, ali mora odgovoriti na vsa vprašanja.
2. Na podlagi odgovorov sistem izračuna rezultat in prikaže rezultate oziroma stopnjo ujemanja z vsako ločino.
3. Sistem uporabniku omogoča, da ne glede na priporočilo (rezultate preizkusa) prosto in samostojno izbere druge ločine ali več ločin.

---

### 9. Prilagajanje težavnosti nalog rangu člana ločine

- **Oznaka**: US-09
- **Povezana funkcionalnost**: Prilagajanje težavnosti nalog rangu uporabnika
- **Uporabniška vloga**: Član ločine

**Uporabniška zgodba**

Kot član ločine želim prejemati naloge, katerih težavnost ustreza mojemu rangu v posamezni ločini, da se izzvi postopoma stopnjujejo v skladu z mojim napredkom

**Acceptance criteria**
1. Sistem za vsako ločino upošteva članov trenutni rang in povezuje rang z lastnostjo "težavnost" naloge.
2. Pri dodeljevanju novih nalog vsak teden sistem izbira samo naloge s težavnostjo, ki ustrezajo rangu člana ločine - vsak teden je pri tem pozoren na rang, ki se je spremenil na koncu prejšnjega tedna: to je v nedeljo ob 23:59 po centralnem evropskem času.
3. Težavnost in pogoji dodeljevanja nalog se določujejo ločeno za posamezne ločine in range uporabnika znotraj tistih ločin.

---

### 10. Prijava neprimernega dokazila

- **Oznaka**: US-10
- **Povezana funkcionalnost**: Obravnava prijav in spornih dokazil
- **Uporabniška vloga**: Član ločine

**Uporabniška zgodba**

Kot član ločine želim prijaviti dokazilo, za katero menim, da vsebuje neprimerno vsebino ali kaže na zlorabo, da lahko moderator preveri morebitne kršitve pravil skupnosti.

**Acceptance criteria**

1. Član lahko pri dokazilu odda prijavo in navede razlog zanjo.
2. Ob oddaji prijave sistem zabeleži prijavitelja, prijavljeno dokazilo, razlog in datum prijave.
3. Po uspešni oddaji je prijava evidentirana za moderatorsko obravnavo, član pa prejme potrditev, da je bila prijava sprejeta.
4. Član lahko preveri, ali je njegova prijava še v obravnavi ali je bila zaključena, ne more pa sam spreminjati moderatorske odločitve.

---

### 11. Obravnava prijav in moderiranje dokazil

- **Oznaka**: US-11
- **Povezana funkcionalnost**: Obravnava prijav in spornih dokazil
- **Uporabniška vloga**: Moderator

**Uporabniška zgodba**

Kot moderator želim pregledovati prijave in ukrepati pri neprimernih ali spornih dokazilih, da lahko ohranjam varnost in poštenost skupnosti.

**Acceptance criteria**

1. Moderator lahko pregleda seznam odprtih prijav skupaj z razlogom prijave in povezanim dokazilom.
2. Moderator lahko prijavo označi kot obravnavano in izbere ustrezen ukrep: skritje neprimerne vsebine ali posredovanje dokazila v ponovno preverjanje.
3. Pri moderatorskem ukrepu sistem shrani izbrani ukrep, razlog, moderatorja in čas izvedbe.
4. Moderatorske pravice ne omogočajo spreminjanja rangov, sistemskih pravil, frakcij ali uporabniških vlog, lahko pa moderator obenem uporablja običajne funkcionalnosti člana ločine.

---

### 12. Znižanje ranga in status Factionless

- **Oznaka**: US-12
- **Povezana funkcionalnost**: Znižanje ranga in status Factionless
- **Uporabniška vloga**: Član ločine

**Uporabniška zgodba**

Kot član ločine želim, da sistem upošteva mojo daljšo neaktivnost pri napredovanju po ločinah, da ima redno opravljanje nalog dejanski pomen v dolgoročnem razvoju.

**Acceptance criteria**
1. Sistem spremlja aktivnost člana glede na zaključene tedenske cikle in potrjene naloge.
2. Če niso opravljene vse naloge v posameznem tednu, uporabnikov streak pade na 0, rang pa ostane na enakem nivoju. Če 2 tedna niso opravljene vse naloge za posamezni teden, rang pade za 1 nivo.
3. Ko uporabnikov rang pade na 0 (kar je najmanjša možna vrednost ranga), mu sistem dodeli stanje *Factionless*. Tako izgubi njegovo "članstvo" v ločinah.
4. Spremembe rangov in streak-a ne izbrišejo uporabniškega računa ali zgodovine predhodno opravljenih nalog in potrjenih dokazil.

---

### 13. Upravljanje ločin in nalog

- **Oznaka**: US-13
- **Povezana funkcionalnost**: Upravljanje ločin in nalog
- **Uporabniška vloga**: Administrator

**Uporabniška zgodba**

Kot administrator želim ustvarjati in urejati ločine in naloge, da lahko vzdržujem vsebino aplikacije in zagotavljam ustrezne izzive za razvoj posameznih vrlin.

**Acceptance criteria**
1. Administrator lahko ureja podatke ločine (ime in opis).
2. Administrator lahko ustvari in ureja nalogo, vključno z njenim naslovom, opisom, težavnostjo in pripadajočo ločino
3. Administrator lahko nalogo poveže z obstoječo ločino ter jo aktivira ali deaktivira za prihodnje delovanje.
4. Sistem uporabnikom brez administratorskih pravic ne omogoča spreminjanja ločin in predlog nalog.
Deaktiviranje že uporabljenih zapisov ne izbriše zgodovine opravljenih nalog.

---

### 14. Upravljanje uporabnikov in uporabniških vlog

- **Oznaka**: US-14
- **Povezana funkcionalnost**: Upravljanje uporabnikov in uporabniških vlog
- **Uporabniška vloga**: Administrator

**Uporabniška zgodba**

Kot administrator želim upravljati uporabniške račune in njihove vloge, da lahko nadziram dostop do funkcionalnosti aplikacije in ustrezno razdelim odgovornosti.

**Acceptance criteria**

1. Administrator lahko pregleda seznam uporabnikov in njihove osnovne podatke
2. Administrator lahko uporabniku dodeli ali odvzame vlogo člana ločine oziroma moderatorja (dodeli lahko tudi administratorske pravice)
3. Sistem po spremembi vloge uveljavi ustrezne pravice pri naslednji zahtevi, ki jo uporabnik stori. Uporabnik brez administratorskih pravic ne more spreminjati vlog.
4. Administrator ne more prebrati uporabnikovega gesla. Spremembe uporabniških vlog pa so vseeno evidentirane.

---

### 15. Upravljanje pravil napredovanja in tedenskih ciklov

- **Oznaka**: US-15
- **Povezana funkcionalnost**: Nastavljanje pravil napredovanje, rangov in tedenskih ciklov
- **Uporabniška vloga**: Administrator

**Uporabniška zgodba**

Kot administrator želim določati pravila napredovanja, pogoje za pridobivanje rangov in trajanje ciklov nalog, da sistem dosledno obračunava rezultate opravljenih nalog.

**Acceptance criteria**

1. Administrator lahko določi oziroma ureja pravila, po katerih potrjene naloge vplivajo na točke napredovanja po rangu v vsaki ločini.
2. Administrator lahko nastavi pravila za štetje streak-a in prag neaktivnosti, ki vpliva na znižanje ranga in postopoma tudi stanje *Factionless*.
3. Spremembe pravil ne spreminjajo zgodovine že potrjenih nalog.
4. Uporabniki brez administratorskih pravic ne morejo spreminjati pravil napredovanja ali nastavitev tedenskih ciklov.