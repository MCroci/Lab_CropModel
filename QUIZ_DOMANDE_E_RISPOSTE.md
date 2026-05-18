# Prova di Valutazione — Domande e Risposte di Riferimento

**Università Cattolica del Sacro Cuore** · Facoltà di Scienze Agrarie, Alimentari e Ambientali
**Modellistica Applicata alle Produzioni Vegetali** — Modulo Coltivazioni Erbacee
*Prof. Stefano Amaducci*

Questo file contiene le 100 domande del quiz nella versione "pulita" (acronimi sempre introdotti alla prima occorrenza) e le risposte di riferimento per la verifica. Le risposte aperte sono indicative: confrontare con il materiale del corso.

---

## PARTE A — Risposta aperta (D1–D50)

### Introduzione alla Modellistica

#### D1
**Domanda.** Cos'è un Modello colturale? Dare una definizione in 2–3 righe.

**Risposta.** Un modello colturale è una rappresentazione matematica semplificata dei principali processi fisiologici di una coltura (fenologia, intercettazione della luce, fotosintesi, traspirazione, ripartizione degli assimilati) e delle sue interazioni con suolo, clima e gestione. Permette di simulare nel tempo crescita, sviluppo, resa e bilanci di acqua e nutrienti.

---

#### D2
**Domanda.** Qual è la differenza tra una **variabile di stato** e una **variabile di tasso (flusso)** in un modello dinamico?

**Risposta.**
- **Variabile di stato:** quantità accumulata che descrive lo stato del sistema in un dato istante (es. biomassa totale [g m⁻²], contenuto idrico del suolo [mm], tempo termico cumulato [°C·d]).
- **Variabile di tasso:** velocità di variazione di una variabile di stato nel tempo (es. dB/dt [g m⁻² d⁻¹], traspirazione giornaliera [mm d⁻¹]).

La variabile di stato è integrata nel tempo a partire dai tassi (state(t+1) = state(t) + rate · Δt).

---

#### D3
**Domanda.** Qual è la differenza tra una **variabile di stato** e un **parametro** in un modello di simulazione?

**Risposta.**
- **Variabile di stato:** cambia nel tempo durante la simulazione (es. indice di area fogliare LAI giornaliero).
- **Parametro:** coefficiente fisso che descrive una proprietà della coltura, del suolo o del sistema; non cambia durante la singola simulazione (es. RUE, T_base, K_PAR).

---

#### D4
**Domanda.** Citare tre esempi di input tipici di un Modello colturale.

**Risposta.** Tre esempi:
1. **Dati meteo giornalieri** (T_min, T_max, radiazione solare, precipitazione, umidità, vento).
2. **Caratteristiche del suolo** (tessitura, profondità, contenuto idrico iniziale, sostanza organica).
3. **Gestione agronomica** (data di semina, densità, irrigazioni, concimazioni, raccolta).

---

#### D5
**Domanda.** Cosa si intende per situazione produttiva "potenziale"? Quali fattori la limitano?

**Risposta.** Secondo lo schema di Rabbinge (1993), la situazione **potenziale** è quella in cui la crescita è limitata **solo** dalle caratteristiche genetiche della cultivar e dai fattori climatici non gestibili: **radiazione solare e temperatura**. Acqua e nutrienti sono assunti abbondanti, e non ci sono stress biotici (parassiti, malattie, infestanti). Le situazioni successive sono "limitata da acqua", "limitata da nutrienti" e "ridotta da stress biotici".

---

#### D6
**Domanda.** Cosa si intende per **calibrazione** di un modello? E per **validazione**? Qual è la differenza?

**Risposta.**
- **Calibrazione:** regolazione dei parametri del modello (per tentativi o con metodi automatici, es. grid search, ottimizzazione) in modo che le simulazioni si avvicinino il più possibile a un set di dati osservati.
- **Validazione:** verifica delle prestazioni del modello calibrato su un set di dati **indipendente** (non usato nella calibrazione), tramite metriche statistiche (RMSE, R², nRMSE).

Differenza: la calibrazione *aggiusta* il modello, la validazione lo *mette alla prova*.

---

### Fenologia e Sviluppo

#### D7
**Domanda.** Dare la definizione di **fenologia** e scrivere la formula della **DTU** (Daily Temperature Unit, unità termica giornaliera).

**Risposta.** La fenologia è lo studio delle fasi di sviluppo della coltura (emergenza, comparsa foglie, fioritura, maturazione) in funzione del **tempo termico** accumulato.
Formula semplificata:
$$\text{DTU} = \max\!\left(0,\; \tfrac{T_{\min}+T_{\max}}{2} - T_{\text{base}}\right)$$
Versione corretta dalla funzione di risposta: DTU = (TP1D − TBD) × Tempfun(T_media), dove TP1D e TBD sono temperatura ottimale inferiore e temperatura base per lo sviluppo.

---

#### D8
**Domanda.** Cos'è il **fillocrono (PHYL)**? Scrivere la formula per calcolare **INODE** (tasso giornaliero di emissione dei nodi).

**Risposta.** Il fillocrono è il tempo termico (gradi giorno, °C·d) richiesto per emettere un nuovo nodo/foglia sul fusto.
$$\text{INODE} = \frac{\text{DTU}}{\text{PHYL}} \quad [\text{nodi}/\text{giorno}]$$

---

#### D9
**Domanda.** Con DTU = 15 °C e PHYL = 90 °C, quanti giorni occorrono per emettere un nuovo nodo, assumendo DTU costante nel periodo? Mostrare il calcolo.

**Risposta.**
INODE = DTU/PHYL = 15/90 = **0,167 nodi/giorno**
Giorni per 1 nodo = 1 / INODE = PHYL / DTU = 90 / 15 = **6 giorni**.

---

#### D10
**Domanda.** Scrivere la formula per la **somma cumulata dei nodi fogliari** (qui indicata con MSNN, *Main Stem Node Number*) giorno per giorno.

**Risposta.**
$$\text{MSNN}(t+1) = \text{MSNN}(t) + \text{INODE}(t)$$
o equivalentemente $\text{MSNN}(t) = \sum_{i=1}^{t} \text{INODE}(i)$.

---

#### D11
**Domanda.** Qual è la temperatura base per lo sviluppo (T_base) del **mais**? E quella del **frumento**? E quella della **barbabietola da zucchero**?

**Risposta.**
- Mais: **≈ 8 °C** (in letteratura anche 10 °C).
- Frumento: **≈ 0 °C**.
- Barbabietola: **≈ 3 °C** (3–4 °C).

---

#### D12
**Domanda.** Descrivere brevemente i due metodi di calcolo dei **gradi giorno (GDD)** quando T_min è inferiore a T_base. Qual è la differenza nei risultati?

**Risposta.**
- **Metodo 1 (semplice):** GDD = max(0, (T_min + T_max)/2 − T_base). T_min reale viene usata anche se negativa rispetto a T_base.
- **Metodo 2 (corretto):** se T_min < T_base, si sostituisce T_min con T_base, poi GDD = ((max(T_min, T_base) + T_max)/2) − T_base.

Differenza: il Metodo 2 **non penalizza** la coltura per le notti fredde (la pianta non "perde" sviluppo quando smette di crescere, semplicemente non avanza). Il Metodo 2 dà sempre GDD ≥ Metodo 1.

---

#### D13
**Domanda.** Con T_min = 5 °C, T_max = 28 °C e T_base = 8 °C (mais), calcolare i GDD giornalieri con entrambi i metodi.

**Risposta.**
- **Metodo 1:** T_media = (5 + 28)/2 = 16,5 °C → GDD = 16,5 − 8 = **8,5 °C·d**.
- **Metodo 2:** T_min sostituita con 8 °C → T_media = (8 + 28)/2 = 18 °C → GDD = 18 − 8 = **10 °C·d**.

---

#### D14
**Domanda.** Cos'è la **vernalizzazione**? Cosa indica il parametro **VDSAT** nel modello?

**Risposta.** La vernalizzazione è l'esposizione obbligata o facilitante di certe colture (frumento autunnale, barbabietola, colza) a basse temperature (≈ 0–10 °C) per indurre o accelerare la fioritura.
**VDSAT** = numero di giorni di vernalizzazione necessari per **saturare** la risposta: oltre VDSAT, la pianta è completamente vernalizzata e il freddo aggiuntivo non accelera ulteriormente la fioritura.

---

#### D15
**Domanda.** Qual è la differenza tra risposta **quantitativa** e **qualitativa** alla vernalizzazione?

**Risposta.**
- **Quantitativa:** il freddo *accelera* la fioritura ma non è strettamente necessario; la pianta fiorisce comunque, solo più tardi.
- **Qualitativa:** il freddo è *obbligatorio*; senza il periodo di vernalizzazione la pianta non fiorisce affatto (resta vegetativa).

---

#### D16
**Domanda.** Quali sono i cinque parametri/argomenti della funzione **Tempfun** (funzione di risposta alla temperatura)? Qual è il valore della funzione quando la temperatura media TMP è minore di TBD?

**Risposta.** Cinque elementi:
1. **TMP** = temperatura media giornaliera (input)
2. **TBD** = temperatura base per lo sviluppo
3. **TP1D** = temperatura ottimale inferiore
4. **TP2D** = temperatura ottimale superiore
5. **TCD** = temperatura critica (massima)

Quando TMP < TBD, **Tempfun = 0** (nessuno sviluppo / crescita nulla).

---

#### D17
**Domanda.** Cos'è la **funzione beta** per la risposta alla temperatura? Quali vantaggi offre rispetto alla funzione lineare a tratti (trapezoidale)?

**Risposta.** La funzione beta è una funzione non lineare a forma di campana asimmetrica definita tra TBD e TCD con massimo a Topt:
$$f(T) = \left(\tfrac{T-\text{TBD}}{\text{Topt}-\text{TBD}}\right)^{a} \cdot \left(\tfrac{\text{TCD}-T}{\text{TCD}-\text{Topt}}\right)^{b}$$
**Vantaggi rispetto alla trapezoidale:**
- Curva *liscia* e biologicamente più realistica (transizioni graduali).
- Derivata continua → utile in metodi di ottimizzazione.
- Una sola temperatura ottimale (Topt) invece di due (TP1D, TP2D).

---

#### D18
**Domanda.** Descrivere le tre fasi di sviluppo del modello fenologico per la **canapa**: BVP, PIP e FDP.

**Risposta.**
- **BVP** (*Basic Vegetative Phase*): fase vegetativa di base, lo sviluppo dipende **solo dalla temperatura** (tempo termico). Insensibile al fotoperiodo.
- **PIP** (*Photoperiod-Induced Phase*): fase indotta dal fotoperiodo; lo sviluppo procede solo quando il fotoperiodo scende sotto una soglia critica (canapa è pianta brevidiurna).
- **FDP** (*Flower Development Phase*): sviluppo dei fiori fino alla maturazione, di nuovo guidato dal tempo termico.

---

### Assimilazione — RUE e Fotosintesi

#### D19
**Domanda.** Definire la **Radiation Use Efficiency (RUE)** e scrivere la formula per calcolare la biomassa giornaliera prodotta.

**Risposta.** RUE è l'efficienza con cui la coltura converte la radiazione fotosinteticamente attiva (PAR) intercettata in biomassa secca.
$$\frac{dB}{dt} = \text{RUE} \cdot \text{FINT} \cdot \text{PAR}_{\text{incidente}}$$
dove FINT è la frazione di PAR intercettata dalla chioma.

---

#### D20
**Domanda.** Qual è l'unità di misura della RUE? Spiegarne il significato fisico.

**Risposta.** **g MJ⁻¹** (grammi di biomassa secca per megajoule di PAR intercettata). Indica quanti grammi di sostanza secca la coltura produce per ogni MJ di radiazione PAR effettivamente assorbita. Valori tipici: 1,5–2,5 g/MJ per C3, 3,0–4,0 g/MJ per C4 (mais).

---

#### D21
**Domanda.** Scrivere la formula della **frazione di luce intercettata (FINT)** e spiegare a cosa serve il coefficiente **K_PAR**.

**Risposta.**
$$\text{FINT} = 1 - e^{-K_{\text{PAR}} \cdot \text{LAI}}$$
(legge di Beer–Lambert applicata alla chioma).
**K_PAR** è il coefficiente di estinzione della luce PAR attraverso la canopy: dipende dall'architettura fogliare (foglie erette → K basso, ~0,4; foglie orizzontali → K alto, ~0,8). Quantifica quanto rapidamente la chioma "assorbe" la luce all'aumentare del LAI.

---

#### D22
**Domanda.** Se l'indice di area fogliare LAI = 3 e K_PAR = 0,5, calcolare la frazione di luce intercettata FINT.

**Risposta.**
FINT = 1 − e^(−0,5 · 3) = 1 − e^(−1,5) = 1 − 0,2231 ≈ **0,777** (77,7 % della PAR intercettata).

---

#### D23
**Domanda.** Qual è la differenza principale tra l'approccio **RUE** (empirico) e un modello **meccanicistico** come Gecros o Daisy?

**Risposta.**
- **RUE:** approccio *empirico*, riassume in un singolo coefficiente l'effetto netto di fotosintesi e respirazione. Pochi parametri, rapido da calibrare. Non distingue P_lorda da R, né i singoli pool di carbonio.
- **Meccanicistico (Gecros, Daisy):** calcola esplicitamente la **fotosintesi lorda** (es. modello biochimico di Farquhar a livello fogliare, integrato sulla canopy), la **respirazione** (di mantenimento e crescita), e gestisce un **pool di assimilati** che viene ripartito tra gli organi. Più dati e parametri, ma più trasferibile e capace di rispondere a [CO₂] elevata, deficit idrico, ecc.

---

#### D24
**Domanda.** Cosa si intende per approccio "basato sul carbonio" per lo sviluppo del LAI? E per approccio "basato sulla temperatura"?

**Risposta.**
- **Basato sul carbonio:** la crescita dell'area fogliare è proporzionale alla biomassa fogliare prodotta tramite SLA (*Specific Leaf Area*):
$$\frac{dLAI}{dt} = \text{SLA} \cdot \frac{dW_{\text{foglia}}}{dt}$$
La pianta cresce in foglie *se ha assimilati*; in caso di stress la canopy si espande meno.
- **Basato sulla temperatura:** lo sviluppo del LAI è guidato dal tempo termico (gradi giorno). Si assume che gli assimilati non siano mai limitanti, quindi il LAI segue una traiettoria prefissata in funzione di DTU.

---

#### D25
**Domanda.** Descrivere la **crescita esponenziale** di una coltura nelle prime fasi. Qual è il valore tipico del tasso di crescita relativo (rm) e da cosa dipende?

**Risposta.** Nelle prime fasi, quando il LAI è piccolo e la chioma non è ancora chiusa, la biomassa accumulata cresce esponenzialmente:
$$\frac{dW}{dt} = r_m \cdot W \quad \Rightarrow \quad W(t) = W_0 \cdot e^{r_m \cdot t}$$
Valore tipico (Goudriaan & Van Laar, 1994): **r_m ≈ 0,1 g g⁻¹ d⁻¹**.
Dipende da: temperatura, efficienza fotosintetica delle giovani foglie, allocazione preferenziale verso foglie, specie (C3 vs C4).

---

#### D26
**Domanda.** Cos'è la **funzione expolineare** (Goudriaan & Monteith, 1990)? Quali parametri la caratterizzano?

**Risposta.** È una funzione che descrive la transizione dalla fase esponenziale iniziale a una fase lineare quando la chioma è chiusa (intercettazione PAR satura):
$$W(t) = \tfrac{c_m}{r_m} \cdot \ln\!\left(1 + e^{r_m(t - t_b)}\right)$$
Parametri:
- **r_m** = tasso relativo di crescita esponenziale (fase iniziale)
- **c_m** = tasso massimo di crescita lineare (g m⁻² d⁻¹) dopo chiusura della chioma
- **t_b** = tempo base (tempo "fittizio" di emergenza estrapolato)

---

### Traspirazione ed Evapotraspirazione

#### D27
**Domanda.** Dare la definizione di **evapotraspirazione potenziale (ETP)**.

**Risposta.** Quantità massima di acqua che può essere persa per evaporazione dal suolo e traspirazione dalla coltura quando l'acqua è abbondante e non c'è alcun limite stomatico/idrico. Dipende solo dai fattori climatici (radiazione netta, temperatura, umidità, vento) e dalle caratteristiche della superficie evaporante (es. coltura di riferimento per ET₀).

---

#### D28
**Domanda.** Citare tre variabili meteorologiche necessarie per calcolare l'ETP con il metodo Penman–Monteith.

**Risposta.** Quattro variabili tipicamente richieste, tre delle quali sono:
1. **Radiazione netta** (o globale + albedo)
2. **Temperatura dell'aria**
3. **Umidità relativa** (o pressione di vapore)
4. **Velocità del vento** a 2 m

---

#### D29
**Domanda.** Come viene separata la **traspirazione della coltura** dall'**evaporazione del suolo** nei modelli? Quale variabile di stato è centrale?

**Risposta.** La ripartizione tra T (traspirazione) ed E (evaporazione suolo) è tipicamente regolata dal **LAI** (la variabile di stato centrale):
- LAI piccolo → la maggior parte dell'energia raggiunge il suolo → E domina.
- LAI alto → la chioma intercetta la radiazione → T domina.

Una formulazione comune: T = ET · (1 − exp(−K · LAI)); E = ET · exp(−K · LAI).

---

#### D30
**Domanda.** In che modo lo stress idrico riduce la fotosintesi nel modello **Daisy**? Descrivere il meccanismo in 2 righe.

**Risposta.** Quando l'acqua disponibile nel suolo scende, la pianta **chiude gli stomi** per limitare le perdite. La chiusura stomatica aumenta la resistenza al passaggio della CO₂ verso il mesofillo, riducendo l'assimilazione fotosintetica.

---

#### D31
**Domanda.** Cos'è la **Water Use Efficiency (WUE)**? Scrivere la formula per calcolarla.

**Risposta.** WUE = efficienza con cui la coltura converte l'acqua usata in biomassa o resa.
$$\text{WUE} = \frac{\text{Biomassa (o resa)}}{\text{Acqua evapotraspirata}} \quad [\text{g/kg oppure kg/m}^3]$$

---

#### D32
**Domanda.** Spiegare il ruolo della **resistenza stomatica** (r_s) e della **resistenza aerodinamica** (r_a) nel calcolo della traspirazione fogliare.

**Risposta.**
- **r_s:** resistenza al passaggio del vapore acqueo attraverso gli stomi; controllata dalla pianta (apertura/chiusura) in risposta a luce, CO₂, deficit idrico. Bassa con stomi aperti, alta con stomi chiusi.
- **r_a:** resistenza al rimescolamento dell'aria sopra la canopy; dipende da velocità del vento e altezza della coltura. Bassa con vento forte / coltura alta, alta con aria ferma.

Insieme determinano il flusso di vapore acqueo (T ∝ ΔVPD / (r_a + r_s)) nell'equazione di Penman–Monteith.

---

### Acqua nel Suolo

#### D33
**Domanda.** Definire **SAT** (saturazione), **DUL** (Drained Upper Limit) e **LL** (Lower Limit) nel bilancio idrico del suolo. A quale concetto agronomico corrisponde DUL?

**Risposta.**
- **SAT:** contenuto idrico a saturazione (tutti i pori pieni d'acqua, salvo aria intrappolata).
- **DUL:** contenuto idrico al limite superiore drenato, raggiunto dopo che l'acqua gravitazionale è defluita. **Corrisponde alla capacità di campo.**
- **LL:** limite inferiore, contenuto idrico oltre il quale la pianta non riesce più a estrarre acqua. **Corrisponde al punto di appassimento permanente.**

Ordine: LL < DUL < SAT.

---

#### D34
**Domanda.** Scrivere le formule per il Lower Limit (LL) e per l'**acqua disponibile (AWC, Available Water Capacity)**. Spiegare cosa rappresenta **EXTR** (extractable water).

**Risposta.**
$$\text{LL} = \text{DUL} - \text{EXTR}$$
$$\text{AWC} = \text{DUL} - \text{LL} \;(= \text{EXTR})$$
**EXTR** = quantità di acqua estraibile dalla pianta tra capacità di campo e punto di appassimento. È la riserva utile.

---

#### D35
**Domanda.** Elencare tutti gli **input** e tutte le **vie di perdita** del bilancio idrico del suolo.

**Risposta.**
- **Input:** precipitazione, irrigazione, eventuale risalita capillare da falda.
- **Perdite:** evaporazione dal suolo (E), traspirazione della coltura (T), scorrimento superficiale (runoff), drenaggio profondo (oltre la profondità radicale).

Equazione: ΔS = (P + I) − (E + T + Runoff + Drainage).

---

#### D36
**Domanda.** Cos'è l'**equazione di Richards** e in quale contesto viene usata nei Modelli colturali rispetto all'approccio a "benne" (tipping bucket)?

**Risposta.** L'equazione di Richards è una PDE non lineare che descrive il moto dell'acqua in un mezzo poroso non saturo, ottenuta combinando la legge di Darcy con l'equazione di continuità:
$$\frac{\partial\theta}{\partial t} = \frac{\partial}{\partial z}\!\left[K(\theta)\!\left(\frac{\partial\psi}{\partial z}+1\right)\right]$$
Viene usata nei modelli **meccanicistici** (Hydrus, Daisy) per simulare in dettaglio i profili idrici verticali. L'**approccio a benne** discretizza il suolo in strati e usa regole semplici (overflow oltre DUL → strato sottostante): è veloce e poco esigente in parametri, ma trascura la dinamica capillare.

---

#### D37
**Domanda.** In quale condizione si verifica il **drenaggio profondo** nel bilancio idrico del suolo?

**Risposta.** Quando il contenuto idrico del suolo (o di uno strato) supera la **capacità di campo (DUL)**: l'acqua in eccesso percola verso strati inferiori per gravità, finché lo strato torna a DUL.

---

#### D38
**Domanda.** Spiegare come lo **stress idrico** viene calcolato in relazione ai parametri DUL e LL del suolo.

**Risposta.** Si definisce la frazione di acqua disponibile per la pianta:
$$\text{FTSW} = \frac{\theta - \text{LL}}{\text{DUL} - \text{LL}}$$
- FTSW ≥ soglia (es. 0,5): nessuno stress (fattore = 1).
- FTSW ≤ 0: stress massimo (fattore = 0, appassimento).
- Tra le due: fattore lineare (o non lineare).

Il fattore di stress (compreso tra 0 e 1) moltiplica il tasso potenziale di crescita o traspirazione.

---

### Azoto nel Suolo

#### D39
**Domanda.** Citare i quattro principali processi del ciclo dell'azoto nel suolo simulati nei Modelli colturali.

**Risposta.**
1. **Mineralizzazione** (N organico → NH₄⁺) e immobilizzazione (processo inverso).
2. **Nitrificazione** (NH₄⁺ → NO₂⁻ → NO₃⁻).
3. **Denitrificazione** (NO₃⁻ → N₂O, N₂; perdita gassosa in condizioni anaerobiche).
4. **Lisciviazione** (perdita di NO₃⁻ verso le acque profonde) e/o **assorbimento da parte della coltura**.

---

#### D40
**Domanda.** In quale condizione avviene la denitrificazione? Quali tre variabili la governano nei modelli?

**Risposta.** La denitrificazione avviene in condizioni **anaerobiche** (suolo saturo o quasi). I batteri denitrificanti riducono NO₃⁻ a N₂O e N₂ usando il nitrato come accettore di elettroni in assenza di O₂.
Tre variabili che la governano:
1. **Contenuto idrico del suolo** (proxy dell'anaerobiosi).
2. **Temperatura** (attività microbica).
3. **Concentrazione di NO₃⁻** (substrato).

---

#### D41
**Domanda.** Qual è il valore limite di N solubile (indicato con NCON nei modelli) usato nel calcolo della denitrificazione e perché viene imposto?

**Risposta.** Circa **400 mg N/litro** di acqua (≈ 0,0004 g/g acqua). È un limite di **saturazione**: oltre questa concentrazione la dipendenza della denitrificazione dalla [NO₃⁻] viene troncata. Serve per evitare valori irrealisticamente alti quando, in suoli molto asciutti, la concentrazione locale calcolata diventerebbe non fisica.

---

#### D42
**Domanda.** Qual è il valore tipico di accumulo stagionale massimo di azoto per una coltura non leguminosa come il mais?

**Risposta.** Circa **25 g N/m²**, equivalenti a **~250 kg N/ha**.

---

#### D43
**Domanda.** Come influisce una carenza di azoto sulla crescita della biomassa rispetto allo sviluppo fenologico?

**Risposta.** La carenza di N riduce principalmente:
- **Crescita della biomassa** (per riduzione di RUE, dell'area fogliare e del contenuto di clorofilla).
- **Espansione fogliare** (LAI più basso).

Lo **sviluppo fenologico** invece è poco influenzato: le tappe fenologiche (emergenza, fioritura, maturazione) dipendono soprattutto dalla temperatura, quindi una coltura carente di N risulta più piccola ma matura ai tempi soliti.

---

#### D44
**Domanda.** Cos'è la **Nitrogen Use Efficiency (NUE)**? Come si calcola a partire dagli output di un modello?

**Risposta.** NUE = efficienza con cui la coltura usa l'azoto disponibile per produrre biomassa o resa.
Due definizioni operative comuni:
- NUE agronomica = (Resa − Resa testimone non concimato) / N apportato
- NUE fisiologica = Biomassa (o resa) / N totale assorbito dalla pianta

Da un modello: si prendono i pool simulati di N nella biomassa e si rapportano alla resa o alla biomassa totale.

---

### Ripartizione dei Fotosintetati e Senescenza

#### D45
**Domanda.** Cos'è l'**Harvest Index (HI)**? Scrivere la formula e indicare valori tipici per mais e frumento.

**Risposta.**
$$\text{HI} = \frac{\text{Resa (granella)}}{\text{Biomassa aerea totale}}$$
Valori tipici:
- **Mais:** HI ≈ 0,45–0,55
- **Frumento:** HI ≈ 0,40–0,50

---

#### D46
**Domanda.** Quali sono le due principali cause di **senescenza fogliare** simulate nei Modelli colturali?

**Risposta.**
1. **Auto-ombreggiamento:** quando il LAI supera un valore critico (LAI critico, LAICR), le foglie basali ricevono troppa poca luce e senescono.
2. **Età / stress:** senescenza ontogenetica (legata alla fase fenologica, soprattutto dopo fioritura) o indotta da stress idrico, termico (gelo, caldo) e nutrizionale.

---

#### D47
**Domanda.** Cos'è il **LAI critico** (LAICR) e cosa accade quando il LAI lo supera nei modelli?

**Risposta.** LAICR è il valore di LAI oltre il quale la canopy si auto-ombreggia: le foglie basali ricevono meno luce della loro soglia di compensazione. Quando LAI > LAICR, il modello attiva un **tasso di senescenza** proporzionale all'eccesso (es. dLAI/dt_senescenza = k · (LAI − LAICR)), in modo che il LAI converga verso LAICR.

---

#### D48
**Domanda.** Descrivere il meccanismo con cui il **gelo** (temperature negative) distrugge l'area fogliare nei modelli. Da quali variabili dipende?

**Risposta.** Quando la temperatura minima giornaliera T_min scende sotto una soglia critica (specie-specifica, es. −2 °C), il modello rimuove una frazione del LAI proporzionale a:
- **Intensità del gelo** (T_crit − T_min): più freddo = più danno.
- **LAI attuale** (più foglie esposte = più area persa in valore assoluto).

Formulazione tipica: ΔLAI_gelo = −LAI · f(T_min), con f(T_min) crescente al diminuire di T_min.

---

#### D49
**Domanda.** Cosa si intende per **source limitation** e **sink limitation** nella crescita della coltura?

**Risposta.**
- **Source limitation:** la produzione di assimilati (la "sorgente": foglie, fotosintesi) è il fattore limitante. La pianta produce troppo poco e gli organi di accumulo restano sotto-riempiti (es. coltura ombreggiata, in stress).
- **Sink limitation:** la capacità degli organi di accumulo (la "destinazione": numero di granella, dimensione massima della granella) è il fattore limitante. La pianta produce assimilati ma non ha "dove metterli" (es. cultivar con basso numero di granella).

In una coltura ben gestita, sorgente e destinazione sono bilanciate.

---

### Simulazione degli Stress

#### D50
**Domanda.** Come agisce un fattore di stress (idrico o azotato) sul tasso di crescita in un modello? Descrivere il concetto di **moltiplicatore**.

**Risposta.** I fattori di stress sono implementati come **moltiplicatori** compresi tra 0 e 1 che riducono il tasso di crescita potenziale:
$$\frac{dB}{dt}_{\text{attuale}} = \frac{dB}{dt}_{\text{potenziale}} \cdot f_{\text{idrico}} \cdot f_{\text{N}} \cdot f_{\text{T}}$$
- f = 1 → nessuno stress (crescita = potenziale)
- f = 0 → stress massimo (crescita = 0)
- 0 < f < 1 → crescita ridotta proporzionalmente

Spesso si applica il principio del **fattore limitante** (legge di Liebig): si usa il minimo tra i moltiplicatori, o il loro prodotto in caso di interazione.

---

## PARTE B — Risposta chiusa (D51–D100)

> Indicazione: una sola opzione corretta per domanda. Le risposte corrette sono evidenziate con ✅.

### Introduzione alla Modellistica

#### D51
Quale delle seguenti è una **variabile di stato** in un Modello colturale?
- A) Temperatura massima giornaliera
- ✅ **B) Biomassa totale della coltura (g m⁻²)**
- C) Quantità di fertilizzante applicata
- D) Radiazione solare incidente

*Nota: A, C, D sono input (forzanti o gestione).*

---

#### D52
Un **parametro** in un modello di simulazione è:
- A) Una variabile che cambia ogni giorno
- B) Un valore misurato direttamente in campo ogni stagione
- ✅ **C) Un coefficiente fisso che descrive proprietà della coltura o del suolo**
- D) Il risultato finale della simulazione

---

#### D53
Quale delle seguenti **non** è un input tipico di un Modello colturale?
- A) Dati meteorologici giornalieri
- B) Profilo del suolo
- ✅ **C) Resa della coltura dell'anno precedente**
- D) Data di semina

*Nota: la resa dell'anno precedente è un output, non un input.*

---

#### D54
Nella situazione produttiva "potenziale" (Rabbinge, 1993) la crescita è limitata solo da:
- A) Disponibilità di acqua e azoto
- ✅ **B) Radiazione solare e temperatura**
- C) Infestanti e parassiti
- D) Disponibilità di fosforo

---

#### D55
La **calibrazione** di un modello consiste nel:
- A) Testare il modello su dati indipendenti non usati per la messa a punto
- ✅ **B) Regolare i parametri del modello per riprodurre dati osservati**
- C) Calcolare la biomassa potenziale massima
- D) Convertire le unità di misura dei dati di input

*Nota: A descrive la validazione.*

---

#### D56
Secondo Goudriaan & Van Laar (1994), un tipico valore del **tasso di crescita relativo nella fase esponenziale** (r_m) è:
- A) 0,01 g g⁻¹ d⁻¹
- ✅ **B) 0,1 g g⁻¹ d⁻¹**
- C) 1,0 g g⁻¹ d⁻¹
- D) 10,0 g g⁻¹ d⁻¹

---

### Fenologia e Sviluppo

#### D57
La formula semplificata per calcolare l'unità termica giornaliera (DTU) è:
- A) DTU = T_MAX − T_MIN
- ✅ **B) DTU = (T_MIN + T_MAX) / 2 − T_base**
- C) DTU = T_MAX − T_base
- D) DTU = T_MIN × PHYL

---

#### D58
Con DTU = 12 °C e fillocrono PHYL = 60 °C, il valore di **INODE** (nodi/giorno) è:
- A) 0,10
- ✅ **B) 0,20**
- C) 0,50
- D) 5,0

*Calcolo: 12/60 = 0,20.*

---

#### D59
La temperatura base per lo sviluppo (T_base) del **mais** vale:
- A) 0 °C
- B) 5 °C
- ✅ **C) 8 °C**
- D) 15 °C

---

#### D60
Le temperature cardinali (T_base / T_opt_inf / T_opt_sup / T_critica) del **frumento** sono:
- ✅ **A) 0 – 25 – 28 – 40 °C**
- B) 8 – 30 – 37 – 45 °C
- C) 5 – 20 – 30 – 42 °C
- D) 0 – 15 – 25 – 38 °C

---

#### D61
Le temperature cardinali (T_base / T_opt_inf / T_opt_sup / T_critica) del **mais** sono:
- A) 0 – 25 – 28 – 40 °C
- ✅ **B) 8 – 30 – 37 – 45 °C**
- C) 5 – 20 – 30 – 42 °C
- D) 0 – 15 – 25 – 38 °C

---

#### D62
Nel **Metodo 2** di calcolo dei GDD (quando T_min < T_base, T_min viene sostituita con T_base per evitare GDD negativi): se T_min osservata = 3 °C e T_base = 8 °C (mais), quale valore di T_min si usa nel calcolo?
- A) 3 °C (valore osservato)
- B) 5,5 °C (media tra 3 e 8)
- ✅ **C) 8 °C (sostituito con T_base)**
- D) 0 °C

---

#### D63
Il valore tipico del fillocrono (PHYL) per la maggior parte delle colture è tra:
- A) 5 – 20 °C
- ✅ **B) 40 – 120 °C**
- C) 200 – 400 °C
- D) 500 – 1000 °C

---

#### D64
Il parametro VDSAT nella vernalizzazione indica:
- A) La temperatura minima soglia per la vernalizzazione
- ✅ **B) I giorni di vernalizzazione necessari per saturare la risposta**
- C) Il tasso giornaliero di sviluppo al freddo
- D) La durata totale del ciclo colturale

---

#### D65
In una risposta **qualitativa** alla vernalizzazione, la pianta:
- A) Fiorisce comunque, ma più lentamente senza freddo
- ✅ **B) Non fiorisce affatto senza il necessario periodo di freddo**
- C) Aumenta la RUE in assenza di freddo
- D) Sviluppa foglie più grandi in assenza di freddo

---

#### D66
Nella funzione di risposta termica Tempfun, se la temperatura media TMP è **minore di T_base**, il valore della funzione è:
- A) 1
- B) 0,5
- ✅ **C) 0**
- D) Dipende da T_opt_inf

---

#### D67
Nella funzione Tempfun, se T_opt_inf < TMP < T_opt_sup il valore della funzione è:
- A) 0
- B) 0,5
- C) Dipende da T_base
- ✅ **D) 1**

*(Nel plateau ottimale la funzione vale 1.)*

---

#### D68
La **funzione beta** per la risposta alla temperatura è preferita rispetto alla funzione lineare a tratti (trapezoidale) perché:
- A) Richiede meno parametri
- ✅ **B) Produce curve lisce e realistiche**
- C) Non dipende dalla temperatura ottimale
- D) È più semplice da implementare in Excel

---

### Assimilazione — RUE e Fotosintesi

#### D69
L'unità di misura della Radiation Use Efficiency (RUE) è:
- A) g m⁻² d⁻¹
- ✅ **B) g MJ⁻¹**
- C) MJ m⁻²
- D) kg ha⁻¹

---

#### D70
La formula per la frazione di luce intercettata FINT è:
- A) FINT = K · LAI
- B) FINT = 1 − K · e^LAI
- ✅ **C) FINT = 1 − e^(−K · LAI)**
- D) FINT = LAI / K

---

#### D71
Se LAI = 0 in una coltura appena emersa, il valore di FINT è:
- A) 1
- B) 0,5
- ✅ **C) 0**
- D) Uguale a K_PAR

*Calcolo: 1 − e^0 = 1 − 1 = 0.*

---

#### D72
Un valore più alto di K_PAR indica che la chioma:
- A) Intercetta la luce più lentamente
- ✅ **B) Intercetta la luce più rapidamente per unità di LAI**
- C) Ha una maggiore respirazione notturna
- D) Ha radici più profonde

---

#### D73
Nell'approccio basato sulla **temperatura** per il LAI si assume che:
- A) Gli assimilati siano sempre il fattore limitante
- B) Lo sviluppo fogliare dipenda solo dall'acqua
- ✅ **C) Ci siano sempre abbastanza assimilati e lo sviluppo dipenda dai gradi giorno**
- D) Il LAI non cambi durante la stagione

---

#### D74
Rispetto all'approccio RUE, un modello **meccanicistico** calcola esplicitamente:
- A) Solo la temperatura del suolo
- ✅ **B) La fotosintesi lorda, la respirazione e il pool di assimilati**
- C) Solo i parametri genetici della cultivar
- D) Solo il bilancio idrico del suolo

---

#### D75
Nell'equazione expolineare, il parametro **c_m** rappresenta:
- A) La biomassa iniziale alla semina
- ✅ **B) Il tasso massimo di crescita lineare (g m⁻² d⁻¹)**
- C) Il coefficiente di estinzione della luce
- D) La temperatura base di crescita

---

#### D76
Il tasso giornaliero di aumento del LAI (dLAI/dt) nell'approccio **basato sul carbonio** è proporzionale a:
- A) Solo al fillocrono
- B) Alla quantità totale di acqua nel suolo
- ✅ **C) Al tasso di accumulo della materia secca (dw/dt)**
- D) All'inverso dell'età della pianta

*(Relazione: dLAI/dt = SLA · dW_foglia/dt.)*

---

### Traspirazione ed Evapotraspirazione

#### D77
La variabile meteorologica **non** necessaria per calcolare l'ETP con Penman–Monteith è:
- A) Temperatura dell'aria
- ✅ **B) Concentrazione di CO₂ atmosferico**
- C) Umidità relativa
- D) Velocità del vento

---

#### D78
La partizione di ETP tra traspirazione della coltura ed evaporazione del suolo dipende principalmente da:
- A) La temperatura del suolo
- B) Il contenuto di azoto del suolo
- ✅ **C) Il Leaf Area Index (LAI)**
- D) La profondità delle radici

---

#### D79
Nel modello Daisy, lo stress idrico riduce la fotosintesi principalmente attraverso:
- A) Riduzione della clorofilla
- B) Aumento della respirazione notturna
- ✅ **C) Chiusura stomatica che riduce l'assimilazione di CO₂**
- D) Caduta precoce delle foglie

---

#### D80
La Water Use Efficiency (WUE) si calcola come:
- A) Rapporto tra ETP e precipitazione
- ✅ **B) Rapporto tra biomassa (o resa) e acqua evapotraspirata**
- C) Differenza tra precipitazione e deflusso
- D) Prodotto tra LAI e traspirazione giornaliera

---

#### D81
La resistenza aerodinamica nella formula di Penman–Monteith dipende principalmente da:
- A) Il contenuto idrico del suolo
- ✅ **B) La velocità del vento e l'altezza della coltura**
- C) Il LAI e la temperatura
- D) La concentrazione di CO₂

---

### Acqua nel Suolo

#### D82
DUL (Drained Upper Limit) corrisponde al concetto agronomico di:
- A) Punto di appassimento permanente
- ✅ **B) Capacità di campo**
- C) Porosità totale
- D) Acqua gravitazionale libera

---

#### D83
La formula corretta per il Lower Limit (LL) è (con EXTR = acqua estraibile):
- A) LL = SAT − PO (porosità totale)
- ✅ **B) LL = DUL − EXTR**
- C) LL = DUL_gravimetrico × BD (bulk density)
- D) LL = PO − e (aria intrappolata)

---

#### D84
Quale delle seguenti è un **input** di acqua nel bilancio idrico del suolo?
- A) Traspirazione della coltura
- B) Evaporazione dal suolo
- ✅ **C) Precipitazione**
- D) Drenaggio profondo

---

#### D85
L'acqua disponibile per la pianta (AWC, Available Water Capacity) si calcola come:
- A) AWC = SAT − DUL
- ✅ **B) AWC = DUL − LL**
- C) AWC = SAT − LL
- D) AWC = DUL + LL

---

#### D86
Il drenaggio profondo nel bilancio idrico avviene quando il contenuto idrico del suolo supera:
- A) Il punto di appassimento (LL)
- ✅ **B) La capacità di campo (DUL)**
- C) La metà di AWC
- D) Il valore di SAT diviso 2

---

#### D87
SAT (contenuto idrico a saturazione) nel modello idrico del suolo si calcola come (PO = porosità totale, e = aria intrappolata):
- A) SAT = DUL + EXTR
- ✅ **B) SAT = PO − e**
- C) SAT = DUL × BD
- D) SAT = LL + AWC

---

### Azoto nel Suolo

#### D88
La denitrificazione nel suolo avviene principalmente quando:
- A) La temperatura è sotto 0 °C
- ✅ **B) Il suolo è saturo d'acqua (condizioni anaerobiche)**
- C) C'è eccesso di radiazione solare
- D) Il pH del suolo è molto acido

---

#### D89
Il valore massimo di N solubile usato nel calcolo della denitrificazione è circa:
- A) 4 g N / litro
- ✅ **B) 400 mg N / litro (≈ 0,0004 g/g acqua)**
- C) 40 mg N / litro
- D) 4 mg N / litro

---

#### D90
Il tipico accumulo stagionale massimo di N per una coltura non leguminosa è circa:
- A) 100 g m⁻²
- B) 2,5 g m⁻²
- ✅ **C) 25 g m⁻²** (≈ 250 kg/ha)
- D) 250 g m⁻²

---

#### D91
Una carenza di azoto in una coltura influenza principalmente:
- A) Lo sviluppo fenologico (fioritura anticipata)
- ✅ **B) La crescita della biomassa e il tasso fotosintetico**
- C) L'assorbimento di acqua dalle radici
- D) La temperatura del suolo

---

#### D92
Il processo di **mineralizzazione** dell'azoto organico è favorito da:
- A) Suolo freddo e secco
- ✅ **B) Temperatura elevata e suolo umido**
- C) Alte concentrazioni di N minerale
- D) Condizioni di anaerobiosi

---

#### D93
Il principale gas serra prodotto dalla denitrificazione nel suolo agricolo è:
- A) CO₂
- B) CH₄
- ✅ **C) N₂O** (protossido d'azoto)
- D) NH₃

---

### Ripartizione dei Fotosintetati e Senescenza

#### D94
L'Harvest Index (HI) è definito come:
- A) Rapporto tra produzione lorda e netta
- ✅ **B) Rapporto tra resa della granella e biomassa totale della coltura**
- C) Rapporto tra N nella granella e N totale
- D) Rapporto tra LAI massimo e LAI alla raccolta

---

#### D95
La senescenza fogliare da **ombreggiamento** si attiva quando:
- A) La temperatura scende sotto 0 °C
- ✅ **B) Il LAI supera il valore critico (LAI critico)**
- C) L'acqua nel suolo scende sotto il LL
- D) Il contenuto di N fogliare è nullo

---

#### D96
La perdita di LAI per danno da **gelo** nei modelli dipende principalmente da:
- A) Il LAI attuale e la radiazione solare
- ✅ **B) La temperatura minima giornaliera (T_min)**
- C) Il contenuto idrico del suolo
- D) La quantità di azoto disponibile

---

#### D97
Nelle prime fasi di crescita di una coltura, lo sviluppo del LAI è principalmente:
- A) Lineare nel tempo
- ✅ **B) Esponenziale, proporzionale alla biomassa esistente**
- C) Costante finché non si raggiunge il LAI massimo
- D) Inversamente proporzionale alla temperatura

---

### Simulazione degli Stress e Sostanza Organica del Suolo

#### D98
I fattori di stress nei Modelli colturali agiscono tipicamente come:
- A) Costanti addizionali al tasso di crescita
- ✅ **B) Moltiplicatori compresi tra 0 e 1 che riducono il tasso potenziale**
- C) Offset negativi sulla temperatura base
- D) Parametri genotipici fissi

---

#### D99
Nel modello ECOSSE per la dinamica della **sostanza organica del suolo (SOM, Soil Organic Matter)**, i pool organici includono generalmente:
- A) Solo humus stabile e lettiera fresca
- ✅ **B) Pool labile, pool recalcitrante, biomassa microbica e humus stabile**
- C) Solo carbonio inorganico e organico totale
- D) Unicamente pool di N ammoniacale e nitrico

---

#### D100
Simulare la **sostanza organica del suolo (SOM)** in un Modello colturale è importante perché:
- A) Determina direttamente la temperatura del suolo
- ✅ **B) Influenza la mineralizzazione dell'N, la struttura del suolo e le emissioni di gas serra (GHG)**
- C) Sostituisce il calcolo del bilancio idrico
- D) È necessaria solo per le colture perenni

---

## Quadro riassuntivo risposte chiuse (D51–D100)

| N. | Risp. | N. | Risp. | N. | Risp. | N. | Risp. | N. | Risp. |
|---:|:----:|---:|:----:|---:|:----:|---:|:----:|---:|:----:|
| 51 | B | 61 | B | 71 | C | 81 | B | 91 | B |
| 52 | C | 62 | C | 72 | B | 82 | B | 92 | B |
| 53 | C | 63 | B | 73 | C | 83 | B | 93 | C |
| 54 | B | 64 | B | 74 | B | 84 | C | 94 | B |
| 55 | B | 65 | B | 75 | B | 85 | B | 95 | B |
| 56 | B | 66 | C | 76 | C | 86 | B | 96 | B |
| 57 | B | 67 | D | 77 | B | 87 | B | 97 | B |
| 58 | B | 68 | B | 78 | C | 88 | B | 98 | B |
| 59 | C | 69 | B | 79 | C | 89 | B | 99 | B |
| 60 | A | 70 | C | 80 | B | 90 | C | 100 | B |

---

## Glossario sintetico degli acronimi

| Sigla | Significato | Unità tipica |
|---|---|---|
| AWC | Available Water Capacity (acqua disponibile) | mm |
| BVP / PIP / FDP | Fasi fenologiche canapa (basic vegetative / photoperiod-induced / flower development) | — |
| DTU | Daily Temperature Unit (unità termica giornaliera) | °C·d |
| DUL | Drained Upper Limit (= capacità di campo) | mm o frazione volumetrica |
| ETP / ET₀ | Evapotraspirazione potenziale / di riferimento | mm/d |
| EXTR | Acqua estraibile dalla pianta | mm |
| FINT | Frazione di PAR intercettata | 0–1 |
| GDD | Growing Degree Days (gradi giorno) | °C·d |
| GHG | Greenhouse Gases (gas serra) | — |
| HI | Harvest Index | 0–1 |
| INODE | Tasso giornaliero di emissione nodi | nodi/d |
| K_PAR | Coefficiente di estinzione della PAR | — |
| LAI | Leaf Area Index (indice di area fogliare) | m²/m² |
| LAICR | LAI critico per ombreggiamento | m²/m² |
| LL | Lower Limit (= punto di appassimento permanente) | mm |
| MSNN | Main Stem Node Number (numero cumulato di nodi sul fusto principale) | nodi |
| NCON | Concentrazione massima di N solubile nel calcolo della denitrificazione | mg/L |
| NUE | Nitrogen Use Efficiency | — |
| PAR | Photosynthetically Active Radiation | MJ/m² |
| PHYL | Fillocrono | °C·d/nodo |
| r_m, c_m, t_b | Parametri della funzione expolineare | g/g·d, g/m²·d, d |
| RUE | Radiation Use Efficiency | g/MJ |
| SAT | Contenuto idrico a saturazione | mm |
| SLA | Specific Leaf Area | m²/g |
| SOM | Soil Organic Matter | t C/ha |
| TBD | Temperatura base per lo sviluppo | °C |
| TP1D, TP2D | Temperature ottimali (inferiore e superiore) | °C |
| TCD | Temperatura critica massima | °C |
| TMP | Temperatura media giornaliera | °C |
| VDSAT | Giorni di vernalizzazione per saturare la risposta | d |
| WUE | Water Use Efficiency | g/kg o kg/m³ |
