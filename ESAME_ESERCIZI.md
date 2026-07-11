# Esercizi per l’Esame — Modellistica delle Colture Erbacee

**Università Cattolica del Sacro Cuore** · Modellistica Applicata alle Produzioni Vegetali (Coltivazioni Erbacee)

Documento di preparazione con **20 esercizi** di difficoltà **base–intermedia**, ispirati alla sezione *Esercizi* dell’applicazione CropModel Lab.  
Argomenti: fenologia, funzioni di risposta, bilancio idrico, LAI/radiazione, biomassa, gestione colturale, **confronto località × meteo**.

Per ogni esercizio: enunciato, domande guidate e **soluzioni** in fondo al documento.

**Suggerimento:** per gli esercizi su **località e meteo**, usa il **Generatore Meteo** (tab **ERA5**: coordinate + anno, oppure **Climate**). Poi confronta le viste **Fenologia**, **Bilancio Idrico** e **Biomassa** mantenendo coltura, data di semina e suolo uguali tra i due scenari. Gli altri esercizi si possono svolgere **a mano** o con calcolatrice.

---

## Esercizio 1 — Gradi giorno (DTU)

**Modulo:** Fenologia e tempo termico

Per un giorno con \(T_{min} = 12\,°C\), \(T_{max} = 26\,°C\) e \(T_{base} = 8\,°C\):

1. Calcolare \(T_{media}\) e la **DTU** con la formula semplificata \(\text{DTU} = \max(0,\; T_{media} - T_{base})\).
2. Se \(CTU\) al giorno precedente era \(850\,°C\cdot d\) e **tuHAR** \(= 1400\,°C\cdot d\), calcolare **NDS** dopo questo giorno: \(\text{NDS} = \min(CTU/tu_{HAR},\, 1)\).
3. Quanti **gradi giorno** mancano ancora alla maturità fisiologica (NDS = 1)?

---

## Esercizio 2 — Effetto di Tbase sulla durata del ciclo

**Modulo:** Fenologia

Due simulazioni identiche (stesso meteo, stesso **tuHAR** = 1500 °C·d) differiscono solo per **Tbase**:

- Scenario A: Tbase = 6 °C  
- Scenario B: Tbase = 10 °C  

1. In quale scenario la **DTU giornaliera media** sarà più alta? Motivare in una riga (senza ricalcolare tutto l’anno).
2. In quale scenario il ciclo (NDS da 0 a 1) richiederà **più giorni solari**? Motivare.
3. Quale parametro (**tuHAR** o **Tbase**) determina il **numero totale** di gradi giorno necessari per la maturità?

---

## Esercizio 3 — Fillocrono e nodi

**Modulo:** Fenologia

Un modello usa \(\text{INODE} = \text{DTU} / \text{PHYL}\) con **PHYL** = 45 °C·d per nodo.

1. In un giorno con DTU = 18 °C·d, quanti nodi si aggiungono?
2. Dopo 30 giorni consecutivi con DTU media = 15 °C·d, quanti nodi totali si sono formati (approssimazione: somma costante)?
3. Confrontare con **PHYL** = 60 °C·d: in quale caso la pianta ha **più nodi** a parità di CTU accumulato? Spiegare in una frase.

---

## Esercizio 4 — Effetto di tuHAR sulla durata del ciclo

**Modulo:** Fenologia

Stesso meteo e stessa coltura (**Tbase** = 8 °C):

- Scenario 1: **tuHAR** = 1200 °C·d  
- Scenario 2: **tuHAR** = 1600 °C·d  

1. Quale scenario raggiunge prima **NDS = 1**? Perché?
2. Se la DTU media del periodo è 14 °C·d/giorno, stimare approssimativamente la **durata del ciclo** (giorni) per ciascuno scenario.
3. A parità di intercettazione radiativa, quale scenario tende a produrre **più biomassa finale**? Argomentare brevemente (fenologia vs durata del ciclo).

---

## Esercizio 5 — Funzione di risposta alla temperatura (Tempfun)

**Modulo:** Funzioni di risposta

Per una forma **trapezoidale** con TBD = 8 °C, TP1 = 18 °C, TP2 = 28 °C, TCD = 40 °C:

1. A quale intervallo di temperature **f(T) = 1** (sviluppo massimo)?
2. Se \(T_{media} = 5\,°C\), qual è **f(T)**?
3. Perché la forma **triangolare** (un solo picco) differisce dalla trapezoidale per colture estive?

---

## Esercizio 6 — FTSW e stress idrico

**Modulo:** Bilancio idrico

Dati: contenuto idrico \(W = 110\,mm\), punto appassimento \(W_{wp} = 70\,mm\), capacità di campo \(W_{fc} = 190\,mm\).

\[
\text{FTSW} = \frac{W - W_{wp}}{W_{fc} - W_{wp}}
\]

1. Calcolare **FTSW**.
2. Se la soglia critica tipica è FTSW ≈ 0,25, la coltura è in stress significativo? Sì/No e perché.
3. Cosa succede ad **ARID** quando FTSW diminuisce molto? (risposta qualitativa: 1–2 righe)

---

## Esercizio 7 — WSFG e soglia WSSG

**Modulo:** Biomassa / bilancio idrico

Il fattore di riduzione della crescita per stress idrico è modellato come:

\[
\text{WSFG} = \min\left(1,\; \frac{\text{FTSW}}{\text{WSSG}}\right) \quad \text{se FTSW} < \text{WSSG}
\]

1. Con **WSSG** = 0,30 e **FTSW** = 0,18, calcolare **WSFG** (espresso come frazione della crescita potenziale).
2. Ripetere con **WSSG** = 0,40 e stesso FTSW.
3. Una coltura con WSSG **più alto** è più o meno **tollerante** allo stress? Argomentare brevemente.

---

## Esercizio 8 — Confronto pluviometrico e biomassa

**Modulo:** Bilancio idrico

Due anni con la **stessa** temperatura e radiazione, ma:

- Anno umido: pioggia annua equivalente a ~900 mm  
- Anno secco: pioggia annua equivalente a ~400 mm  

1. In quale anno ci si aspetta **FTSW media** più alta durante l’estate?
2. In quale anno **ARID** sarà mediamente più elevato?
3. Collegare in 3–4 righe: meno pioggia → biomassa finale più bassa (passando per FTSW e WSFG).

---

## Esercizio 9 — Intercettazione radiativa (Beer–Lambert)

**Modulo:** LAI e radiazione

\[
\text{FINT} = 1 - e^{-K_{PAR} \cdot LAI}
\]

Con **KPAR** = 0,55 e **LAI** = 3,0:

1. Calcolare **FINT** (usa \(e^{-1{,}65} \approx 0{,}192\) oppure calcolatrice).
2. Quale **LAI** approssimativo serve perché FINT superi **0,90**?
3. Perché, oltre un certo LAI, aumentare ancora l’area fogliare ha **scarso effetto** su FINT?

---

## Esercizio 10 — Coefficiente KPAR e intercettazione

**Modulo:** LAI e radiazione

**LAI** fisso = 4,0 m² m⁻².

1. Calcolare **FINT** con **KPAR** = 0,45 e con **KPAR** = 0,70 (calcolatrice).
2. Quale KPAR produce **FINT** più alta? Ha senso aumentare KPAR all’infinito? Perché?
3. Per il **frumento**, valori tipici di KPAR sono 0,4–0,6: cosa rappresenta biologicamente questo coefficiente?

---

## Esercizio 11 — Produzione di biomassa e RUE

**Modulo:** Accumulo di biomassa

In un giorno ideale (nessuno stress):

\[
\Delta B \approx PAR \cdot \text{FINT} \cdot \text{RUE}
\]

con **PAR** = 22 MJ m⁻², **FINT** = 0,75, **RUE** = 3,2 g MJ⁻¹.

1. Calcolare \(\Delta B\) in g m⁻² per quel giorno.
2. Se lo **stress idrico** porta **WSFG** = 0,60, quale \(\Delta B\) si ottiene (stessi PAR, FINT, RUE)?
3. Stessi PAR e WSFG = 1: se **RUE** passa da 3,2 a 4,0 g MJ⁻¹, di quanto aumenta \(\Delta B\) (in percentuale)?

---

## Esercizio 12 — Ruscellamento e Curve Number (SCS)

**Modulo:** Bilancio idrico

1. Con **CN** basso (es. 55) o **CN** alto (es. 90), dove va **più acqua** dopo un evento di pioggia intensa: infiltrazione o ruscellamento?
2. A parità di pioggia annua, perché un suolo con CN = 90 può produrre **meno biomassa** di uno con CN = 65?
3. Il **Curve Number** dipende principalmente da quali caratteristiche del sito? (elencare due fattori)

---

## Esercizio 13 — Data di semina e ciclo colturale

**Modulo:** Fenologia / analisi integrata

Stesso cultivar e stesso anno meteorologico:

- **Semina A:** giorno 1 (inizio anno)  
- **Semina B:** giorno 120 (fine aprile)  

1. In quale semina la **DTU giornaliera media** durante il ciclo sarà generalmente più alta?
2. In quale semina il ciclo (giorni da semina a NDS = 1) sarà **più corto** in giorni solari?
3. La biomassa finale dipende da durata del ciclo, radiazione intercettata e stress idrico: elencare **due motivi** per cui semina B non è sempre “migliore” di A.

---

## Esercizio 14 — LAI, FINT e fase di massima produzione

**Modulo:** LAI, radiazione e biomassa

Durante il ciclo colturale, **LAI** e **FINT** aumentano fino a un massimo, poi la senescenza riduce l’area fogliare fotosinteticamente attiva.

1. In quale intervallo di **NDS** (approssimativo) il **LAI** è tipicamente massimo, subito prima della senescenza?
2. Perché la **produzione giornaliera di biomassa** (ΔB) è massima quando **FINT** è alta e il **LAI** è ancora verde (non in senescenza)?
3. Se la senescenza anticipa di 10 giorni (LAI cala prima), cosa succede alla **biomassa finale** anche senza stress idrico? Motivare in 2–3 righe.

---

## Esercizio 15 — Situazione potenziale e stress (schema Rabbinge)

**Modulo:** Introduzione / bilancio idrico–biomassa

Secondo lo schema di Rabbinge (1993), la resa passa da **potenziale** → limitata da **acqua** → da **nutrienti** → **ridotta da biotici**.

1. Cosa limita la situazione **potenziale**? (solo due fattori)
2. In un anno **piovoso** (FTSW spesso alta, ARID basso) ma con **poca radiazione** in estate, quale fattore può limitare la biomassa nonostante l’acqua abbondante?
3. In un anno **secco**, quale catena di variabili collega la pioggia ridotta alla biomassa finale? (3–4 righe, senza formule di bilancio di massa generiche)

---

## Confronto località × meteo (ERA5 / Climate)

*Stessa coltura, stessa data di semina e stessi parametri del suolo; cambiano solo **coordinate** e/o **anno** del dataset meteorologico.*

---

## Esercizio 16 — Due siti, stesso anno: temperatura e durata del ciclo

**Modulo:** Fenologia · Scenari meteo reali

Preset **Mais (C4)**, semina giorno 120, stesso **anno** (es. 2019):

- **Sito A:** Pianura Padana (es. 45°N, 10°E)  
- **Sito B:** Italia meridionale (es. 40°N, 16°E)  

Dopo aver caricato i due dataset **ERA5** nell’app:

1. Quale sito ha **temperatura media annua** più alta? Quale accumula **DTU** più rapidamente durante il ciclo?
2. Quale sito raggiunge prima **NDS = 1** (in giorni dalla semina)? Motivare con il regime termico.
3. Il sito con ciclo **più corto** produce sempre **più biomassa**? Rispondere sì/no e argomentare in 2 righe (radiazione vs durata).

---

## Esercizio 17 — Stessa località, due anni: anno caldo vs anno fresco

**Modulo:** Fenologia · Scenari meteo reali

Stesse coordinate (es. una località in Emilia-Romagna), stesso preset **Frumento (C3)**, semina giorno 1:

- **Anno 1:** anno con temperatura media annua **più bassa** (es. 2010)  
- **Anno 2:** anno con temperatura media annua **più alta** (es. 2018)  

1. In quale anno il grafico **CTU** cumulato cresce più velocemente?
2. Annotare (o stimare dall’app) il **giorno dell’anno** in cui **NDS** raggiunge 1 per ciascun anno: quale anno matura prima?
3. Se l’anno caldo ha anche **meno pioggia** estiva, quale indicatore idrico (**FTSW** o **ARID**) può peggiorare nonostante il ciclo più breve?

---

## Esercizio 18 — Due siti, stesso anno: pioggia, stress e biomassa

**Modulo:** Bilancio idrico · Scenari meteo reali

Preset **Mais**, stesso anno, semina giorno 120:

- **Sito umido:** località con **precipitazione cumulata annua** più elevata (es. Nord Italia)  
- **Sito secco:** località con **precipitazione cumulata annua** più bassa (es. Sud Italia o area interna)  

1. Quale sito mostra **FTSW media** più alta durante il periodo estivo del ciclo?
2. Quale sito ha **ARID medio** più elevato?
3. Confrontare la **biomassa finale** simulata: quale sito è più produttivo? Elencare **due cause** legate al meteo (non al cultivar).

---

## Esercizio 19 — Radiazione solare tra località e intercettazione

**Modulo:** LAI e radiazione · Scenari meteo reali

Stesso preset **Frumento**, stesso anno, stessa data di semina:

- **Sito nord:** latitudine più alta (es. 46°N)  
- **Sito sud:** latitudine più bassa (es. 38°N)  

1. Quale sito ha in media **SRAD** (radiazione solare giornaliera) più alta **in estate**? Perché (in una riga, effetto latitudine/stagione)?
2. Durante la fase di **LAI massimo**, quale sito intercetta mediamente più **PAR** (qualitativo: collegare SRAD e FINT)?
3. Se le temperature del sito sud accelerano la fenologia (ciclo più corto) ma la radiazione in alcune fasi è favorevole, quale **compromesso** spiega risultati di biomassa simili o diversi tra i due siti?

---

## Esercizio 20 — Confronto integrato: tabella due località

**Modulo:** Analisi integrata · Scenari meteo reali

Scegli **due località** (coordinate diverse) o **due anni** ERA5 per la **stessa** località. Stesso preset colturale, stessa semina, stesso suolo.

Compilare una tabella con almeno queste colonne per ciascuno scenario:

| Scenario | Giorni fino a NDS=1 | FTSW media (estate) | ARID medio | Biomassa finale |

1. Quale scenario ha il **miglior bilancio idrico**? Quale la **miglior produttività**? Coincidono sempre?
2. Identificare il **fattore meteo limitante** principale in ciascuno scenario (temperatura, pioggia, radiazione).
3. Scrivere **4–5 righe** di conclusione: quale località/anno consiglieresti per quella coltura e perché (fenologia + acqua + luce).

---

# Soluzioni

---

### Soluzione 1

1. \(T_{media} = (12+26)/2 = 19\,°C\); **DTU** = 19 − 8 = **11 °C·d**.
2. **CTU** = 850 + 11 = **861 °C·d**; **NDS** = 861/1400 ≈ **0,615**.
3. Mancano **1400 − 861 = 539 °C·d** (circa 49 giorni a 11 °C·d/d se DTU costante).

---

### Soluzione 2

1. **Scenario A** (Tbase più bassa): DTU giornaliera più alta.
2. **Scenario B**: più giorni solari (stesso tuHAR ma meno DTU al giorno).
3. **tuHAR** fissa il totale di gradi giorno necessario; **Tbase** influenza solo quanti se ne accumulano al giorno.

---

### Soluzione 3

1. INODE = 18/45 = **0,40 nodi/giorno**.
2. DTU totale ≈ 30 × 15 = 450 °C·d; nodi ≈ 450/45 = **10 nodi**.
3. **PHYL più basso** (45): più nodi a parità di CTU.

---

### Soluzione 4

1. **Scenario 1** (tuHAR 1200): raggiunge NDS = 1 prima (meno gradi giorno richiesti).
2. Durata ≈ 1200/14 ≈ **86 giorni** vs 1600/14 ≈ **114 giorni**.
3. **Scenario 2** spesso più biomassa: ciclo più lungo → più giorni di crescita con LAI elevato, se non limitato da stress (dipende da meteo e acqua).

---

### Soluzione 5

1. **f(T) = 1** tra **18 °C e 28 °C**.
2. A 5 °C < TBD → **f(T) = 0**.
3. La triangolare ha un **unico picco** (Topt), senza plateau; la trapezoidale tollera un **intervallo** di temperature ottimali.

---

### Soluzione 6

1. FTSW = (110−70)/(190−70) = 40/120 ≈ **0,33**.
2. **Sì**, stress moderato–significativo (FTSW sotto soglia tipica 0,25–0,30).
3. **ARID aumenta**: meno acqua disponibile → traspirazione effettiva minore rispetto alla domanda.

---

### Soluzione 7

1. WSFG = 0,18/0,30 = **0,60**.
2. WSFG = 0,18/0,40 = **0,45**.
3. WSSG **più alto** → **meno tollerante**.

---

### Soluzione 8

1. **Anno umido**: FTSW media più alta.
2. **Anno secco**: ARID più elevato.
3. Meno pioggia → meno ricarico idrico → **FTSW** più bassa → sotto **WSSG** la **WSFG** riduce la crescita giornaliera → meno incrementi di biomassa → **resa/biomassa finale** inferiore.

---

### Soluzione 9

1. FINT = 1 − e^(−1,65) ≈ **0,81**.
2. LAI ≈ **4,2 m² m⁻²** (accettabile 4–4,5).
3. Curva **saturante**: quasi tutta la PAR già intercettata.

---

### Soluzione 10

1. KPAR 0,45: FINT ≈ 1 − e^(−1,8) ≈ **0,83**; KPAR 0,70: FINT ≈ 1 − e^(−2,8) ≈ **0,94**.
2. **KPAR più alto** → FINT più alta, ma FINT è limitata a **1** (saturazione).
3. **KPAR** è il coefficiente di **estinzione** della radiazione nel canopy: descrive quanto rapidamente la luce viene assorbita/scoraggiata con l’aumentare del LAI.

---

### Soluzione 11

1. ΔB = 22 × 0,75 × 3,2 = **52,8 g m⁻²**.
2. ΔB = 52,8 × 0,60 ≈ **31,7 g m⁻²**.
3. ΔB nuovo = 22 × 0,75 × 4,0 = 66 g m⁻²; aumento (66−52,8)/52,8 × 100 ≈ **25%** (rapporto diretto con RUE).

---

### Soluzione 12

1. **CN basso** → più infiltrazione; **CN alto** → più ruscellamento.
2. Meno acqua nel profilo → più stress → meno biomassa.
3. **Tessitura/uso del suolo**, **copertura vegetale**, umidità antecedente, gestione del suolo.

---

### Soluzione 13

1. **Semina B**: DTU/giorno maggiore (temperature primaverili–estive più alte).
2. **Semina B**: ciclo più **corto** in giorni solari.
3. Esempi: meno PAR totale sul ciclo; possibile siccità estiva; LAI massimo in periodo meno luminoso.

---

### Soluzione 14

1. **NDS** tipicamente tra **0,6 e 0,7** (subito prima dell’inizio della senescenza, fase frBLS nel modello).
2. ΔB ∝ PAR × **FINT** × RUE × … : FINT alta = massima intercettazione; LAI verde = area fotosinteticamente attiva, senza perdita da senescenza.
3. **Biomassa finale inferiore**: meno giorni con LAI elevato e FINT alta → meno PAR intercettata complessivamente sul ciclo.

---

### Soluzione 15

1. **Genetica/cultivar**, **radiazione** e **temperatura** (acqua e nutrienti non limitanti; niente stress biotici).
2. **Radiazione** (o PAR intercettata) anche con acqua sufficiente.
3. Esempio: pioggia ↓ → contenuto idrico suolo ↓ → **FTSW** ↓ → **WSFG** ↓ → crescita giornaliera ↓ → **biomassa finale** ↓.

---

### Soluzione 16

1. **Sito B** (Sud): di solito temperatura media annua più alta → **DTU** giornaliera più alta.
2. **Sito B** conclude prima (meno giorni dalla semina a NDS = 1): più calore → più gradi giorno al giorno.
3. **No**: ciclo breve non garantisce più biomassa; il Sud può avere ciclo rapido ma anche **stress idrico** o meno giorni con LAI alto in condizioni ottimali; il Nord può compensare con ciclo più lungo e più radiazione in alcune fasi (dipende dall’anno simulato).

---

### Soluzione 17

1. **Anno caldo** (Anno 2): CTU cumulato cresce più velocemente.
2. **Anno caldo** raggiunge NDS = 1 prima (giorno dell’anno minore).
3. **ARID** (e FTSW più bassa): meno pioggia + temperature alte → maggiore domanda evaporativa e meno ricarico idrico, stress estivo possibile anche con maturazione anticipata.

---

### Soluzione 18

1. **Sito umido**: FTSW media estiva più alta.
2. **Sito secco**: ARID medio più elevato.
3. Di solito **sito umido** più produttivo; cause: più **pioggia** → meno stress (**WSFG** più alta); spesso anche **FTSW** sufficiente nella fase di crescita attiva. Il sito secco può avere ciclo simile o più breve ma crescita limitata dallo stress.

---

### Soluzione 19

1. **Sito sud**: in estate SRAD tende a essere più alta (giornate più lunghe, sole più intenso a latitudini mediterranee); il nord ha estate più corta e talvolta nuvolosità diversa (dipende dall’anno).
2. **Sito sud** (se LAI comparabile): più PAR disponibile → potenzialmente **FINT** e ΔB giornalieri più alti in piena estate.
3. **Compromesso:** Sud = ciclo più corto (meno giorni totali di crescita) ma giornate più “energetiche”; Nord = ciclo più lungo, possibile minor stress idrico → biomassa dipende da quale effetto prevale nell’anno scelto.

---

### Soluzione 20

1. **Miglior bilancio idrico:** scenario con FTSW più alta e ARID più basso (spesso sito/anno più piovoso). **Miglior produttività:** scenario con biomassa finale più alta — **non sempre coincide** (es. anno umido ma poco soleggiato).
2. Esempi: scenario A limitato da **radiazione**; scenario B da **acqua**; scenario C da **temperatura** (ciclo troppo breve/lungo rispetto alla luce disponibile).
3. Conclusione tipo: preferire località/anno con **FTSW** adeguata in fase critica, **PAR** sufficiente a LAI massimo e ciclo che sincronizza maturità con fine estate; evitare combinazioni con siccità estiva forte o estate troppo piovosa e poco luminosa (risposte coerenti con la tabella compilata).

---

*Fine documento — 20 esercizi con soluzioni.*
