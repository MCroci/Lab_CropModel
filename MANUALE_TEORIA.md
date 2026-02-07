# Manuale di Teoria – Modellistica delle Colture Erbacee

**Crop mod lab** – Documento completo sulla teoria contenuta nell'applicazione

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

---

## 1. Introduzione

Questa applicazione è progettata per l'apprendimento della **modellistica delle colture erbacee**. Il modello implementato è semplificato a scopi didattici e si concentra sui principi fisici fondamentali: **radiazione solare**, **temperatura** e **acqua**. Aspetti quali nutrienti e parassiti non sono considerati.

### Obiettivi di apprendimento

- Distinguere tra variabili di **stato**, variabili di **flusso**, **parametri** e **variabili forzanti**
- Comprendere il ciclo giornaliero: Meteo → Fenologia → LAI → Intercettazione → Biomassa
- Introdurre l'accoppiamento con il bilancio idrico del suolo e gli indici di stress
- Valutare l'impatto dei parametri fisiologici (es. RUE, KPAR) sulla produttività

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

---

## 7. Bilancio Idrico del Suolo

### 7.1 Modello "a Secchio" (Tipping Bucket)

\[
W(t+1) = W(t) + Pioggia - Ruscellamento - ET_{reale} - Drenaggio
\]

### 7.2 Parametri Idrologici

| Parametro | Descrizione |
|-----------|-------------|
| W_wp (Punto Appassimento) | Acqua non disponibile alla pianta |
| W_fc (Capacità di Campo) | Massima acqua trattenuta contro gravità |
| W_sat (Saturazione) | Porosità totale |

### 7.3 Partizione ET0

- **Tpot**: traspirazione potenziale = ET0 × f_cover (f_cover ∝ LAI)
- **Epot**: evaporazione potenziale dal suolo = ET0 × (1 - f_cover)
- **Tact, Eact**: limitati dall'acqua disponibile (AW = W - W_wp)

### 7.4 Indice ARID (Stress Idrico)

\[
ARID = 1 - \frac{T_{act}}{ET_0}
\]

- ARID = 0: nessuno stress
- ARID = 1: stress totale

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

L'evapotraspirazione di riferimento (ET0) combina:
- Termine radiativo (energia netta)
- Termine aerodinamico (vapore pressione, vento)

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

Per i riferimenti completi e i DOI, consultare la sezione **Bibliografia** nell'applicazione.

---

*Manuale redatto per Crop mod lab – Laboratorio di Modellistica delle Colture Erbacee*
