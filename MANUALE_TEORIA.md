# Manuale di Teoria – Modellistica delle Colture Erbacee

**CropModel Lab** – Documento completo sulla teoria contenuta nell'applicazione

---

## Indice

1. [Introduzione](#1-introduzione)
2. [Concetti Fondamentali](#2-concetti-fondamentali)
3. [Input Meteorologici](#3-input-meteorologici)
4. [Fenologia e Tempo Termico](#4-fenologia-e-tempo-termico)
5. [Area Fogliare (LAI) e Intercettazione Radiativa](#5-area-fogliare-lai-e-intercettazione-radiativa)
6. [Accumulo di Biomassa](#6-accumulo-di-biomassa)
7. [Bilancio Idrico del Suolo](#7-bilancio-idrico-del-suolo)
8. [Fotosintesi: Modello di Farquhar](#8-fotosintesi-modello-di-farquhar)
9. [Emergenza della Plantula](#9-emergenza-della-plantula)
10. [Bilancio Energetico e Evapotraspirazione](#10-bilancio-energetico-e-evapotraspirazione)
11. [Agrivoltaico e Development–Growth Decoupling](#11-agrivoltaico-e-developmentgrowth-decoupling)
12. [Calibrazione e Validazione](#12-calibrazione-e-validazione)
13. [Riferimenti Bibliografici](#13-riferimenti-bibliografici)
14. [Dinamica dell'Azoto (Approfondimento)](#14-dinamica-dellazoto-approfondimento)

---

## 1. Introduzione

Questa applicazione è progettata per l'apprendimento della **modellistica delle colture erbacee**. Il modello implementato è semplificato a scopi didattici e si concentra sui principi fisici fondamentali: **radiazione solare**, **temperatura** e **acqua**. Aspetti quali nutrienti e parassiti non sono considerati.

### Obiettivi di apprendimento

- Distinguere tra variabili di **stato**, variabili di **flusso**, **parametri** e **variabili forzanti**
- Comprendere il ciclo giornaliero: Meteo → Fenologia → LAI → Intercettazione → Biomassa
- Introdurre l'accoppiamento con il bilancio idrico del suolo e gli indici di stress
- Valutare l'impatto dei parametri fisiologici (es. RUE, KPAR) sulla produttività

### 1.1 Funzione Expolinear (Goudriaan e Monteith, 1990)

La funzione **expolinear** descrive il passaggio dalla crescita **esponenziale** (pianta piccola, copertura incompleta) alla crescita **lineare** (intercettazione massima della luce).

- **Fase esponenziale** (LAI basso, luce non limitante):
\[
\frac{dW}{dt} = r_m \cdot W
\]
con \(r_m\) = tasso di crescita relativo (es. 0.1 g g⁻¹ d⁻¹).

- **Fase lineare** (LAI elevato, radiazione limitante):
\[
\frac{dW}{dt} = C_m
\]
con \(C_m\) = tasso di crescita massimo (determinato dalla radiazione intercettata).

- **Equazione expolinear** (forma integrata):
\[
W = \frac{C_m}{r_m} \cdot \ln\left\{1 + \exp\left[r_m \cdot (t - t_b)\right]\right\}
\]
 dove \(t_b\) è il tempo di base (momento in cui la fase lineare inizierebbe se non ci fosse l'esponenziale).

---

## 2. Concetti Fondamentali

### 2.1 Variabili di Stato (State)

Descrivono lo **stato del sistema** in un dato momento. Si **accumulano** nel tempo.

| Variabile | Unità | Descrizione |
|-----------|-------|-------------|
| CTU | °C·d | Accumulo cumulativo di gradi giorno |
| NDS | 0–1 | Stadio di sviluppo normalizzato |
| LAI | m²/m² | Indice di area fogliare attuale |
| Biomassa | g/m² | Biomassa totale accumulata |
| W (Acqua suolo) | mm | Contenuto idrico del suolo |

### 2.2 Variabili di Flusso (Rate)

Rappresentano la **velocità di cambiamento** delle variabili di stato. Sono **derivate giornaliere**.

| Variabile | Unità | Descrizione |
|-----------|-------|-------------|
| DTU | °C·d/giorno | Incremento giornaliero di gradi giorno |
| dB | g/m²/giorno | Incremento giornaliero di biomassa |
| dLAI | m²/m²/giorno | Variazione giornaliera di LAI |
| ET | mm/giorno | Evapotraspirazione giornaliera |

### 2.3 Parametri

Proprietà **costanti** del sistema o della cultivar durante la simulazione.

| Parametro | Unità | Descrizione |
|-----------|-------|-------------|
| Tbase | °C | Temperatura base per sviluppo |
| tuHAR | °C·d | Somma termica per maturazione |
| RUE | g/MJ | Efficienza d'uso della radiazione |
| KPAR | — | Coefficiente di estinzione radiativa |

### 2.4 Variabili Forzanti (Forcing)

**Input esterni** che guidano il sistema. Cambiano ogni giorno.

| Forzante | Unità | Descrizione |
|----------|-------|-------------|
| TMIN, TMAX | °C | Temperatura min/max giornaliera |
| SRAD | MJ/m² | Radiazione solare giornaliera |
| RAIN | mm | Precipitazione giornaliera |

### 2.5 Ciclo Giornaliero di Simulazione

1. **Aggiorna forzanti**: lettura di temperatura, radiazione, pioggia per il giorno corrente
2. **Calcola flussi**: calcolo di DTU, dLAI, dB, ET in base a forzanti e stati
3. **Aggiorna stati**: Stato[N] = Stato[N-1] + Flusso[N]

**Relazione fondamentale**: Lo stato al giorno N = Stato al giorno N-1 + Flusso al giorno N

### 2.6 Bilancio di Massa

Molti processi (acqua, azoto, carbonio) sono simulati tramite l'equazione generale:

\[
\text{Stato attuale} = \text{Stato precedente} + \text{Ingressi} - \text{Uscite}
\]

Esempi:
- **Acqua nel suolo**: \(W(t+1) = W(t) + \text{Pioggia} - ET - \text{Drenaggio} - \text{Ruscellamento}\) — calcolo del ruscellamento (SCS / fallback): §7.2
- **Biomassa**: \(B(t+1) = B(t) + \Delta B\) (dove \(\Delta B\) è la produzione giornaliera)
- **CTU**: \(CTU(t) = CTU(t-1) + DTU(t)\)

---

## 3. Input Meteorologici

### 3.1 Generatore Meteo Sintetico

Per simulazioni didattiche, i dati meteorologici possono essere generati sinteticamente:

- **Temperatura**: andamento sinusoidale annuale  
  \( T = T_{mean} + T_{amp} \sin\left(2\pi\frac{DOY - 30}{365}\right) \)

- **Radiazione**: stagionalità simile, con picco in estate  
  \( SRAD = SRAD_{base} + 6 \sin\left(2\pi\frac{DOY - 80}{365}\right) \)

- **Pioggia**: distribuzione esponenziale (pochi eventi intensi, molti nulli)  
  \( Rain = -\ln(U) \cdot \bar{R} \) con U uniforme in (0,1)

### 3.2 Dati Reali

L'app supporta:
- **ERA5** (Open-Meteo): dati storici per lat/lon e anno
- **Caricamento CSV**: TMIN, TMAX, SRAD, RAIN per giorno

---

## 4. Fenologia e Tempo Termico

### 4.1 Gradi Giorno (GDD)

Le piante non misurano il tempo in giorni solari, ma in **accumulo di calore**. Si usa il concetto di **Gradi Giorno di Crescita (GDD)**.

### 4.2 Unità Termiche Giornaliere (DTU)

\[
DTU = \max(T_{media} - T_{base}, 0)
\]

dove \(T_{media} = (T_{min} + T_{max})/2\). Se \(T_{media} \leq T_{base}\), lo sviluppo si arresta (DTU = 0).

### 4.3 Accumulo Cumulativo (CTU)

\[
CTU(t) = CTU(t-1) + DTU(t)
\]

### 4.4 Stadio di Sviluppo (NDS)

\[
NDS = \min\left(\frac{CTU}{tu_{HAR}}, 1\right)
\]

- NDS = 0: emergenza
- NDS = 1: maturità fisiologica (raccolta)
- **tuHAR**: somma termica necessaria per la raccolta (°C·d)

### 4.5 Funzione Beta (Temperature Cardinali)

Nei modelli avanzati (DSSAT, GECROS) si usa spesso una **funzione Beta** per descrivere risposte non lineari alla temperatura, con tre temperature cardinali: base (\(T_{base}\)), ottimale (\(T_{opt}\)), massima (\(T_{max}\)):

\[
f(T) = R_{max} \cdot \left(\frac{T - T_{base}}{T_{opt} - T_{base}}\right) \cdot \left(\frac{T_{max} - T}{T_{max} - T_{opt}}\right)^{\frac{T_{opt}-T_{base}}{T_{max}-T_{opt}}} \cdot c
\]

dove \(c\) è un parametro di curvatura. Questa curva è più realistica delle soglie lineari quando \(T\) è vicina ai limiti.

### 4.6 Sviluppo di Nodi e Fillocrono (PHYL)

Per colture con architettura a nodi (es. leguminose, cereali), l'**incremento giornaliero del numero di nodi** è:

\[
INODE_i = INODE_{i-1} + \frac{DTU}{PHYL}
\]

Il **fillocrono** (PHYL) è l'intervallo termico (°C·d) necessario per la comparsa di un nuovo nodo sul fusto principale.

---

## 5. Area Fogliare (LAI) e Intercettazione Radiativa

### 5.1 Indice di Area Fogliare (LAI)

\[
LAI = \frac{\text{Area fogliare}}{\text{Area suolo}} \quad [\text{m}^2/\text{m}^2]
\]

### 5.2 Dinamica del LAI

Il LAI segue una **crescita logistica** e una fase di **senescenza**:

- **Fase crescita** (frEMR ≤ NDS < frBLS):  
  \[
  \frac{dLAI}{dt} = \alpha \cdot LAI \cdot (LAI_{max} - LAI)
  \]

- **Fase senescenza** (frBLS ≤ NDS < 1):  
  \[
  \frac{dLAI}{dt} = -SENRATE \cdot LAI
  \]

### 5.3 Legge di Beer-Lambert

La frazione di **radiazione intercettata** (FINT) è:

\[
F_{int} = 1 - e^{-k \cdot LAI}
\]

Il coefficiente **k** (KPAR) dipende dall'architettura della pianta:
- Foglie erette (es. cereali): k ≈ 0.5
- Foglie planofile (es. soia): k ≈ 0.7

### 5.4 SLA (Specific Leaf Area)

Lo **SLA** (Specific Leaf Area) è il rapporto tra area fogliare e peso secco fogliare (m²/g). È fondamentale per convertire la biomassa allocata alle foglie in area fogliare: \(LAI \propto B_{foglie} \cdot SLA\).

### 5.5 Espansione PLA per Pianta (Modello Allometrico)

In modelli basati sulla singola pianta, l'area fogliare per pianta (PLA) può essere calcolata con relazioni **allometriche** basate sul numero di nodi (MSNN):

\[
PLA_i = PLACON \cdot MSNN_i^{PLAPOW}
\]

dove PLACON e PLAPOW sono costanti. Da PLA e densità di piante si ottiene il LAI.

### 5.6 Senescenza da Ombreggiamento

Quando il LAI supera una soglia critica (LAICR), l'ombreggiamento eccessivo induce senescenza. Il tasso di decadimento è:

\[
LDRSH = 0.03 \cdot \frac{LAI - LAICR}{LAICR} \quad \text{se } LAI > LAICR
\]

\[
DLAI_{SH} = LAI \cdot LDRSH
\]

---

## 6. Accumulo di Biomassa

### 6.1 Radiation Use Efficiency (RUE) – Monteith (1977)

La produzione di biomassa è legata **linearmente** alla radiazione fotosinteticamente attiva intercettata:

\[
\Delta B = RUE \cdot PAR \cdot F_{int} \cdot f(T) \cdot f(Heat)
\]

dove:
- **RUE**: efficienza di conversione (g biomassa secca per MJ di PAR)
- **PAR**: Photosynthetically Active Radiation ≈ 48% della radiazione globale
- **F_int**: frazione intercettata (Beer-Lambert)
- **f(T)**: fattore di limitazione termica (0–1)
- **f(Heat)**: stress termico (SIMPLE, Zhao et al. 2019)

### 6.2 Risposta alla Temperatura f(T)

Funzione **trapezoidale**:
- f(T) = 0 se T ≤ T_base_RUE o T ≥ T_ceiling
- f(T) lineare crescente tra T_base e T_ottimale_1
- f(T) = 1 tra T_ottimale_1 e T_ottimale_2
- f(T) lineare decrescente tra T_ottimale_2 e T_ceiling

### 6.3 Stress Termico f(Heat)

Quando T_max supera una soglia (~35°C), la crescita si riduce linearmente fino ad azzerarsi sopra ~45°C (modello SIMPLE).

### 6.4 Effetto della CO₂ sulla RUE

La concentrazione atmosferica di CO₂ influisce sull'efficienza fotosintetica. L'effetto sulla RUE può essere modellato come:

\[
RUE_x = RUE_0 \left[1 + b \cdot \ln\left(\frac{C_x}{C_0}\right)\right]
\]

dove \(C_x\) è la concentrazione attuale, \(C_0\) quella di riferimento (es. 360 ppm). Il parametro \(b\) è circa 0.4 per piante C4 e 0.8 per piante C3.

---

## 7. Bilancio Idrico del Suolo

### 7.1 Modello "a Secchio" (Tipping Bucket)

\[
W(t+1) = W(t) + Pioggia - Ruscellamento - ET_{reale} - Drenaggio
\]

In forma dettagliata per il primo strato:
\[
ATSW_1(t+1) = ATSW_1(t) + RAIN + IRRIG - DRAIN - RUNOFF - E_{suolo} - TR_1
\]

### 7.2 Ruscellamento (SCS Curve Number, Eq. 14.14)

Nell’applicazione il **ruscellamento giornaliero** \(RUNOFF\) (mm) segue il metodo **SCS Curve Number** quando è definito un **Curve Number (CN)** strettamente positivo (intervallo tipico in didattica: 50–95).

**Ritenzione massima potenziale** del suolo (mm):

\[
S = 254 \left( \frac{100}{CN} - 1 \right)
\]

Il fattore **254** converte la formulazione classica (pollici) in millimetri. CN basso corrisponde a maggiore infiltrazione / minore runoff; CN alto a suoli compatti, impermeabili o spogli.

**Astrazione iniziale**: nella formulazione standard si assume che le perdite iniziali (intercettazione, infiltrazione iniziale) equivalgano a **\(0{,}2\,S\)** prima che si manifesti runoff significativo.

Per la precipitazione giornaliera \(P\) (= **RAIN**, mm), il ruscellamento è calcolato così:

| Condizione | RUNOFF (mm) |
|------------|-------------|
| \(P \le 0\) oppure \(CN \le 0\) | \(0\) |
| \(S \le 0\) (caso limite numerico) | \(P\) |
| \(0 < P \le 0{,}2\,S\) | \(0\) (evento sotto la soglia di astrazione iniziale) |
| \(P > 0{,}2\,S\) | \(\displaystyle RUNOFF = \frac{(P - 0{,}2\,S)^2}{P + 0{,}8\,S}\) |

**Senza Curve Number**: se **CN** non è impostato o è nullo, il modello non usa la formula SCS e adotta un fallback basato sulla **capacità di infiltrazione giornaliera** \(inf\_cap\) (mm/giorno):

\[
RUNOFF = \max(P - inf\_cap,\, 0)
\]

Nel bilancio idrico (§7.1), il RUNOFF è un’**uscita**: riduce l’acqua disponibile per ricaricare \(W\) rispetto alla pioggia caduta.

### 7.3 Parametri Idrologici

| Parametro | Descrizione |
|-----------|-------------|
| W_wp (Punto Appassimento) | Acqua non disponibile alla pianta |
| W_fc (Capacità di Campo) | Massima acqua trattenuta contro gravità |
| W_sat (Saturazione) | Porosità totale |

### 7.4 Partizione ET0

- **Tpot**: traspirazione potenziale = ET0 × f_cover (f_cover ∝ LAI)
- **Epot**: evaporazione potenziale dal suolo = ET0 × (1 - f_cover)
- **Tact, Eact**: limitati dall'acqua disponibile (AW = W - W_wp)

### 7.5 Indice ARID (Stress Idrico)

\[
ARID = 1 - \frac{T_{act}}{ET_0}
\]

- ARID = 0: nessuno stress
- ARID = 1: stress totale

### 7.6 FTSW (Frazione di Acqua Traspirabile)

La **FTSW** (Fraction of Transpirable Soil Water) è il principale indicatore di stress idrico per la pianta:

\[
FTSW = \frac{ATSW}{TTSW}
\]

dove ATSW = acqua transpirabile attuale (W - W_wp nello strato radicale), TTSW = acqua transpirabile totale (W_fc - W_wp). Il fattore di stress \(F_w\) è legato all'ARID: \(F_w = T_{act}/T_{pot}\), quindi ARID = 1 - F_w.

---

## 8. Fotosintesi: Modello di Farquhar

### 8.1 Modello Biochimico (Farquhar et al., 1980)

La fotosintesi netta (A_n) è il **minimo** di tre tassi limitanti, meno la respirazione mitocondriale (R_d):

\[
A_n = \min(w_c, w_j, w_s) - R_d
\]

### 8.2 I Tre Limitanti

- **w_c (Rubisco-limited)**: limitata da bassa CO₂  
  \[
  w_c = \frac{V_{max}(c_i - \Gamma^*)}{c_i + K_c(1 + O_i/K_o)}
  \]

- **w_j (Light-limited)**: limitata da bassa luce  
  \[
  w_j = \frac{J(c_i - \Gamma^*)}{4(c_i + 2\Gamma^*)}
  \]

- **w_s (Sink-limited, TPU)**: utilizzo dei triosi fosfati  
  \[
  w_s = \frac{V_{max}}{2}
  \]

Dove: c_i = pressione parziale CO₂ intercellulare, Γ* = punto di compensazione, J = tasso di trasporto elettronico.

---

## 9. Emergenza della Plantula

### 9.1 Modello 1: GDD Semplice

Accumulo termico basato sulla temperatura dell'aria:

\[
GDD_{cum} = \sum \max(T_{media} - T_{base}, 0)
\]

Emergenza quando GDD_cum ≥ GDD_target.

### 9.2 Modello 2: ETT (Effective Thermal Time)

Considera **temperatura del suolo** e **fattore idrico**:

- T_suolo ≈ T_aria + fattore × Radiazione
- f_temp: risposta trapezoidale T_base – T_ottimale – T_ceiling
- f_acqua: risposta lineare tra θ_wilt e θ_opt
- ETT_giornaliero ∝ f_temp × f_acqua

### 9.3 Effetto Agrivoltaico

Sotto pannelli fotovoltaici:
- Radiazione ridotta → T_suolo inferiore
- Emergenza ritardata rispetto al pieno campo

---

## 10. Bilancio Energetico e Evapotraspirazione

### 10.1 Equazione di Penman-Monteith

L'evapotraspirazione di riferimento (ET₀) combina termine radiativo e aerodinamico:

\[
ET_0 = \frac{0.408\Delta(R_n - G) + \gamma\frac{900}{T+273}u_2(e_s - e_a)}{\Delta + \gamma(1 + 0.34 u_2)}
\]

dove: \(\Delta\) = pendenza della curva di saturazione, \(R_n\) = radiazione netta, \(G\) = flusso di calore nel suolo, \(\gamma\) = costante psicrometrica, \(u_2\) = vento a 2 m, \(e_s - e_a\) = deficit di pressione di vapore.

### 10.2 Resistenza Aerodinamica (r_a)

Basata sulla teoria di **Monin-Obukhov**:
- Correzione per stabilità atmosferica
- Legge logaritmica del vento

### 10.3 Resistenza Stomatica (r_s)

Modello tipo Jarvis:
- Dipendenza dalla PAR (luce)
- Stress idrico (acqua disponibile)

### 10.4 Bilancio Radiativo

\[
R_n = H + LE + G
\]

con: R_n = radiazione netta, H = flusso sensibile, LE = flusso latente (ET), G = flusso nel suolo.

---

## 11. Agrivoltaico e Development–Growth Decoupling

### 11.1 Il Problema Fondamentale

In pieno campo, **radiazione e temperatura** sono correlate: giorni soleggiati tendono a essere più caldi. Sia la **crescita** (biomassa) che lo **sviluppo** (fenologia) accelerano insieme.

Sotto sistemi **agrivoltaici**, l'ombreggiamento riduce la PAR ma altera poco la temperatura (1–2°C). Il fotoperiodo non cambia. Si crea un **disaccoppiamento** tra sviluppo e crescita.

### 11.2 Sviluppo (Development)

Guidato da **temperatura e fotoperiodo**. Sotto APV:
- Temperatura leggermente ridotta → sviluppo leggermente rallentato
- Fotoperiodo invariato
- **Risultato**: la fenologia procede quasi normalmente

### 11.3 Crescita (Growth)

Guidata dalla **radiazione intercettata**. Sotto APV:
- PAR ridotta del 20–50% → crescita molto rallentata
- **Risultato**: canopi più piccole, meno biomassa

### 11.4 Conseguenze

La coltura può raggiungere la fioritura "in tempo" ma con:
- Canopi più piccole
- Meno fusti/rami
- Sistemi radicali ridotti
- Biomassa pre-antesi inferiore

Effetti su: dimensione dei sink, fornitura di assimilati, harvest index, resa finale.

---

## 12. Calibrazione e Validazione

### 12.1 Metriche di Validazione

- **RMSE** (Root Mean Square Error): errore quadratico medio
- **R²**: coefficiente di determinazione
- **nRMSE**: RMSE normalizzato alla media osservata (%)
- **MAE**: errore assoluto medio
- **Bias**: scostamento medio (sovra/sottostima sistematica)

### 12.2 Calibrazione

- **Grid search**: ricerca esaustiva su una griglia di parametri
- **Analisi di sensibilità**: variazione dei parametri per valutare l'impatto sulla risposta

### 12.3 Scenario

Confronto tra configurazioni diverse: baseline vs scenario con modifiche climatiche o gestionali.

---

## 13. Riferimenti Bibliografici

| Autore | Anno | Titolo | Categoria |
|--------|------|--------|-----------|
| Wallach et al. | 2014 | Working with Dynamic Crop Models | Modellistica Generale |
| Monteith | 1977 | Climate and the efficiency of crop production | Fisiologia (RUE) |
| Farquhar et al. | 1980 | A biochemical model of photosynthetic CO₂ assimilation | Fotosintesi |
| Penman | 1948 | Natural evaporation from open water, bare soil and grass | Evapotraspirazione |
| Monteith | 1965 | Evaporation and environment | Penman-Monteith |
| Beer | 1852 | Bestimmung der Absorption… | Legge Beer-Lambert |
| Wang | 1960 | A critique of the heat unit approach | Fenologia (GDD) |
| Marrou et al. | 2013 | Microclimate under agrivoltaic systems | Agrivoltaico |
| Dupraz et al. | 2011 | Combining solar photovoltaic panels and food crops | Agrivoltaico |
| Zhao et al. | 2019 | SIMPLE crop model | Modelli Specifici |
| Goudriaan & Monteith | 1990 | A mathematical function for crop growth | Crescita Expolinear |
| Arnold | 1960 | Maximum-minimum temperatures as a basis for computing heat units | Fenologia (GDD) |

Per i riferimenti completi e i DOI, consultare la sezione **Bibliografia** nell'applicazione.

---

## 14. Dinamica dell'Azoto (Approfondimento)

*Questa sezione presenta concetti usati in modelli avanzati (DSSAT, GECROS); l'app non include il bilancio dell'azoto.*

L'azoto limita spesso la produzione insieme all'acqua. La **domanda giornaliera** (NUP) è:

\[
NUP = (GLAI \cdot SLNG) + (GST \cdot SNCG)
\]

dove SLNG = N specifico target nelle foglie (g N m⁻²), SNCG = concentrazione target negli steli (g N g⁻¹).

**Bilancio nel suolo** (ingressi/uscite):
- **Mineralizzazione netta**: \(NMIN = MNORG \cdot K_N \cdot R_N\)
- **Volatilizzazione**: \(NVOL = VOLF \cdot NFERT\)
- **Lisciviazione**: \(NLEACH = NSOL \cdot \frac{DRAIN1}{WAT1 + DRAIN1}\)
- **Denitrificazione**: \(NDNIT = \min(NCON, 0.0004) \cdot (1 - e^{-KDNIT})\)

In carenza di N, i modelli applicano una **priorità**: si riduce la concentrazione negli steli fino a un minimo; se non basta, si inibisce l'espansione fogliare; in casi gravi si induce senescenza fogliare per mobilizzare N verso i sink.

---

*Manuale redatto per CropModel Lab – Laboratorio di Modellistica delle Colture Erbacee*
