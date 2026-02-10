# Analisi concetti da Gemini – Dove aggiungere nel progetto

Questo documento mappa i concetti estratti dalla conversazione con Gemini alle sezioni esistenti del manuale, delle view e delle funzioni. Per ogni concetto è indicato: **stato attuale**, **dove aggiungere** e **priorità**.

---

## 1. Introduzione – Funzione Expolinear

### Stato attuale
- **Assente**. Il manuale e l'intro non menzionano la funzione expolinear (Goudriaan e Monteith, 1990).

### Dove aggiungere
- **MANUALE_TEORIA.md**: nuova sottosezione **§1.1 Funzione Expolinear** subito dopo gli obiettivi di apprendimento (prima di §2).
- **ConceptsView.tsx** (opzionale): box introduttivo "Dalla crescita esponenziale a quella lineare".
- **FunctionsView.tsx** (opzionale): CodeBlock aggiuntivo "Crescita Expolinear".

### Equazioni da includere
```
Fase esponenziale:  dW/dt = r_m · W
Fase lineare:       dW/dt = C_m
Expolinear:         W = (C_m/r_m) · ln{1 + exp[r_m · (t - t_b)]}
```
- r_m: tasso di crescita relativo
- C_m: tasso di crescita massimo (da radiazione)
- t_b: tempo base (inizio fase lineare se non ci fosse l’esponenziale)

### Priorità
**Alta** – È un concetto base spesso usato nell’intro del corso.

---

## 2. Concetti Fondamentali – Bilancio di Massa

### Stato attuale
- Parzialmente presente in §2.5 con "Stato[N] = Stato[N-1] + Flusso[N]".
- Manca la formulazione generale **Stato = Stato_precedente + Ingressi - Uscite**.

### Dove aggiungere
- **MANUALE_TEORIA.md**: nuova sottosezione **§2.6 Bilancio di Massa** dopo §2.5.
- **ConceptsView.tsx**: card o nota "Bilancio di massa" nel ciclo di simulazione.

### Testo suggerito
> Molti processi (acqua, azoto, carbonio) sono simulati con l’equazione generale:
> **Stato attuale = Stato precedente + Ingressi - Uscite**
> Es.: W(t+1) = W(t) + Pioggia - ET - Drenaggio - Ruscellamento.

### Priorità
**Alta** – Chiarisce la logica comune di molti moduli.

---

## 3. Fenologia – Equazioni aggiuntive

### 3.1 DTU (già presente)
- Presente in §4.2 e in PhenologyView. Nessuna modifica necessaria.

### 3.2 Funzione Beta (temperature cardinali)
- **MANUALE_TEORIA.md** §4: aggiungere **§4.5 Funzione Beta** come alternativa alla soglia lineare.
- **MANUALE_TEORIA.md** §6.2: aggiungere nota: "Nei modelli avanzati (GECROS, DSSAT) si usa spesso una funzione Beta con T_base, T_opt, T_max."

### Equazione Beta
\[
f(T) = R_{max} \cdot \left(\frac{T - T_{base}}{T_{opt} - T_{base}}\right) \cdot \left(\frac{T_{max} - T}{T_{max} - T_{opt}}\right)^{\frac{T_{opt}-T_{base}}{T_{max}-T_{opt}}} \cdot c
\]

### 3.3 Fillocrono (PHYL) e sviluppo nodi
- **MANUALE_TEORIA.md**: nuova sottosezione **§4.6 Sviluppo di nodi e foglie (Fillocrono)**.
- **PhenologyView.tsx** (opzionale): box teorico "Fillocrono".

### Equazioni
```
INODE_i = INODE_{i-1} + DTU/PHYL
```
PHYL = gradi-giorno tra un nodo e il successivo.

### 3.4 Vernalizzazione (CUMVER)
- **MANUALE_TEORIA.md**: box **§4.7 Vernalizzazione** (solo teorico; non implementata nell’app).
- Priorità **bassa** (cereali invernali, fuori ambito didattico attuale).

### Priorità
- Funzione Beta: **media**
- Fillocrono: **media**
- Vernalizzazione: **bassa**

---

## 4. Area fogliare (LAI) – Equazioni aggiuntive

### 4.1 Integrazione LAI (già implicita)
- Presente come crescita logistica + senescenza. Nessuna modifica necessaria.

### 4.2 PLA e allometria (MSNN, PLACON, PLAPOW)
- **MANUALE_TEORIA.md**: nuova sottosezione **§5.4 Espansione PLA per pianta (modello allometrico)**.
- **LaiView.tsx** o **FunctionsView.tsx**: menzione del modello alternativo.

### Equazione
\[
PLA_i = PLACON \cdot MSNN_i^{PLAPOW}
\]
MSNN = numero di nodi sul fusto principale.

### 4.3 Senescenza da ombreggiamento (LDRSH)
- **MANUALE_TEORIA.md**: nuova sottosezione **§5.5 Senescenza da ombreggiamento**.

### Equazioni
\[
LDRSH = 0.03 \cdot \frac{LAI - LAICR}{LAICR} \quad \text{se } LAI > LAICR
\]
\[
DLAI_{SH} = LAI \cdot LDRSH
\]

### 4.4 SLA (Specific Leaf Area)
- **MANUALE_TEORIA.md**: aggiungere in **§5** una breve definizione: "SLA = area fogliare / peso secco; serve a passare da biomassa a area fogliare."

### Priorità
- PLA/allometria: **media**
- Senescenza ombreggiamento: **bassa**
- SLA: **bassa**

---

## 5. Produzione biomassa (RUE) – Equazioni aggiuntive

### 5.1 DDMP e FINT (già presenti)
- Presenti in §6 e in BiomassView. Nessuna modifica necessaria.

### 5.2 Correzione CO₂ sulla RUE
- **MANUALE_TEORIA.md**: nuova sottosezione **§6.4 Effetto della CO₂**.
- **BiomassView.tsx** (opzionale): slider o nota teorica sulla CO₂.

### Equazione
\[
RUE_x = RUE_0 \left[1 + b \cdot \ln\left(\frac{C_x}{C_0}\right)\right]
\]
b ≈ 0.4 (C4), 0.8 (C3).

### 5.3 Fotosintesi con resistenza stomatica
- Già coperta in **§8 Fotosintesi Farquhar** e **FarquharView**. Possibile nota su P_actual vs stress idrico in §8.

### Priorità
- CO₂: **media**

---

## 6. Bilancio idrico – Equazioni aggiuntive

### 6.1 FTSW (Frazione di acqua transpirabile)
- **MANUALE_TEORIA.md**: nuova sottosezione **§7.5 FTSW**.
- **WaterView.tsx**: includere FTSW = ATSW/TTSW nella sezione teorica.

### Equazione
\[
FTSW = \frac{ATSW}{TTSW}
\]

### 6.2 Bilancio dettagliato (ATSW1)
- **MANUALE_TEORIA.md**: estendere **§7.1** con l’equazione completa.
- **FunctionsView.tsx**: aggiornare CODE_WATER con la formula di bilancio.

### Equazione
\[
ATSW1_i = ATSW1_{i-1} + RAIN + IRGW - DRAIN1 - RUNOFF - SEVP - TR1
\]

### 6.3 ET₀ Penman-Monteith (formula completa)
- **MANUALE_TEORIA.md**: aggiungere in **§10.1** la formula esplicita.

### Equazione
\[
ET_0 = \frac{0.408\Delta(R_n - G) + \gamma\frac{900}{T+273}u_2(e_s - e_a)}{\Delta + \gamma(1 + 0.34u_2)}
\]

### 6.4 Fattore di stress idrico F_w
- **MANUALE_TEORIA.md**: collegare a §7.4 (ARID); F_w = T_act/T_pot, ARID = 1 - F_w.

### Priorità
- FTSW: **alta**
- ET₀ formula: **media**
- Bilancio ATSW1: **bassa**

---

## 7. Dinamica dell’azoto

### Stato attuale
- **Non presente** nell’app (modello semplificato senza nutrienti).

### Dove aggiungere
- **MANUALE_TEORIA.md**: nuovo capitolo **§14 Dinamica dell’Azoto (teoria)** come “Approfondimento per modelli avanzati”.

### Equazioni da includere
- Domanda: NUP = (GLAI·SLNG) + (GST·SNCG)
- Mineralizzazione: NMIN = MNORG·K_N·R_N
- Volatilizzazione: NVOL = VOLF·NFERT
- Lisciviazione: NLEACH = NSOL·(DRAIN1/(WAT1+DRAIN1))
- Denitrificazione: NDNIT = min(NCON, 0.0004)·(1-exp(-KDNIT))

### Priorità
**Bassa** – Solo teoria; non da implementare nell’app attuale.

---

## 8. Altre equazioni (senescenza da freddo, ecc.)

### 8.1 Senescenza da freddo (LDRFR)
- **MANUALE_TEORIA.md**: box in **§5** o **§4**.
- Equazione: LDRFR = f(TMIN) con parametri empirici a, b.

### 8.2 Priorità carenza N (logica algoritmica)
- Da citare nel futuro **§14 Dinamica dell’Azoto**.

### Priorità
**Bassa**

---

## Riepilogo interventi consigliati

| Priorità | Sezione                 | Intervento                                           |
|----------|-------------------------|------------------------------------------------------|
| Alta     | §1 Introduzione         | Aggiungere funzione Expolinear                        |
| Alta     | §2 Concetti             | Aggiungere Bilancio di Massa                         |
| Alta     | §7 Bilancio Idrico      | Aggiungere FTSW                                      |
| Media    | §4 Fenologia            | Aggiungere Funzione Beta, Fillocrono                 |
| Media    | §5 LAI                  | Aggiungere PLA/allometria, SLA                       |
| Media    | §6 Biomassa             | Aggiungere effetto CO₂ sulla RUE                     |
| Media    | §7/§10 Idrico           | Formula ET₀ Penman-Monteith                          |
| Bassa    | §4 Fenologia            | Vernalizzazione                                      |
| Bassa    | §5 LAI                  | Senescenza da ombreggiamento                         |
| Bassa    | Nuovo §14               | Dinamica dell’azoto (teoria)                         |

---

## Riferimenti bibliografici da aggiungere

- **Goudriaan & Monteith**, 1990 – "A mathematical function for crop growth" (Expolinear)
- **Arnold**, 1960 – Riferimento originale GDD (se non già presente)

---

*Documento generato per guidare l’integrazione dei concetti da Gemini nel Crop mod lab.*
