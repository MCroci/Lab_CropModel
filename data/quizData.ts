export type QuizSection =
  | 'Introduzione alla Modellistica'
  | 'Fenologia e Sviluppo'
  | 'Assimilazione – RUE e Fotosintesi'
  | 'Traspirazione e ETP'
  | 'Acqua nel Suolo'
  | 'Azoto nel Suolo'
  | 'Ripartizione dei Fotosintetati e Senescenza'
  | 'Simulazione degli Stress e SOM';

export interface OpenQuestion {
  id: string;
  number: number;
  section: QuizSection;
  text: string;
}

export interface ClosedQuestion {
  id: string;
  number: number;
  section: QuizSection;
  text: string;
  options: [string, string, string, string];
  /** Indice corretto: 0 = A, 1 = B, 2 = C, 3 = D */
  correctIndex: number;
}

export const QUIZ_SECTIONS: QuizSection[] = [
  'Introduzione alla Modellistica',
  'Fenologia e Sviluppo',
  'Assimilazione – RUE e Fotosintesi',
  'Traspirazione e ETP',
  'Acqua nel Suolo',
  'Azoto nel Suolo',
  'Ripartizione dei Fotosintetati e Senescenza',
  'Simulazione degli Stress e SOM',
];

export const OPEN_QUESTIONS: OpenQuestion[] = [
  { id: 'D1', number: 1, section: 'Introduzione alla Modellistica', text: "Cos'è un Modello colturale? Dare una definizione in 2-3 righe." },
  { id: 'D2', number: 2, section: 'Introduzione alla Modellistica', text: 'Qual è la differenza tra una variabile di stato e una variabile di tasso in un modello dinamico?' },
  { id: 'D3', number: 3, section: 'Introduzione alla Modellistica', text: 'Qual è la differenza tra una variabile di stato e un parametro in un modello di simulazione?' },
  { id: 'D4', number: 4, section: 'Introduzione alla Modellistica', text: 'Citare tre esempi di input tipici di un Modello colturale.' },
  { id: 'D5', number: 5, section: 'Introduzione alla Modellistica', text: "Cosa si intende per situazione produttiva 'potenziale'? Quali fattori la limitano?" },
  { id: 'D6', number: 6, section: 'Introduzione alla Modellistica', text: 'Cosa si intende per calibrazione di un modello? E per validazione? Qual è la differenza?' },
  { id: 'D7', number: 7, section: 'Fenologia e Sviluppo', text: 'Dare la definizione di fenologia e scrivere la formula della DTU (Daily Temperature Unit).' },
  { id: 'D8', number: 8, section: 'Fenologia e Sviluppo', text: "Cos'è il fillocrono (PHYL)? Scrivere la formula per calcolare INODE." },
  { id: 'D10', number: 10, section: 'Fenologia e Sviluppo', text: 'Scrivere la formula per la somma cumulata dei nodi fogliari (MSNN) giorno per giorno.' },
  { id: 'D12', number: 12, section: 'Fenologia e Sviluppo', text: 'Descrivere brevemente i due metodi di calcolo GDD quando Tmin è inferiore a Tbase. Qual è la differenza nei risultati?' },
  { id: 'D14', number: 14, section: 'Fenologia e Sviluppo', text: "Cos'è la vernalizzazione? Cosa indica il parametro VDSAT nel modello?" },
  { id: 'D15', number: 15, section: 'Fenologia e Sviluppo', text: 'Qual è la differenza tra risposta quantitativa e qualitativa alla vernalizzazione?' },
  { id: 'D16', number: 16, section: 'Fenologia e Sviluppo', text: 'Quali sono i cinque parametri della funzione Tempfun? Qual è il valore della funzione quando TMP < TBD?' },
  { id: 'D17', number: 17, section: 'Fenologia e Sviluppo', text: "Cos'è la funzione beta per la risposta alla temperatura? Quali vantaggi offre rispetto alla funzione lineare a tratti?" },
  { id: 'D18', number: 18, section: 'Fenologia e Sviluppo', text: 'Descrivere le tre fasi di sviluppo del modello fenologico per la canapa: BVP, PIP e FDP.' },
  { id: 'D19', number: 19, section: 'Assimilazione – RUE e Fotosintesi', text: 'Definire la Radiation Use Efficiency (RUE) e scrivere la formula per calcolare la biomassa giornaliera.' },
  { id: 'D20', number: 20, section: 'Assimilazione – RUE e Fotosintesi', text: "Qual è l'unità di misura della RUE? Spiegarne il significato fisico." },
  { id: 'D21', number: 21, section: 'Assimilazione – RUE e Fotosintesi', text: 'Scrivere la formula FINT e spiegare a cosa serve il coefficiente K_PAR.' },
  { id: 'D23', number: 23, section: 'Assimilazione – RUE e Fotosintesi', text: "Qual è la differenza principale tra l'approccio RUE e un modello meccanicistico come Gecros o Daisy?" },
  { id: 'D24', number: 24, section: 'Assimilazione – RUE e Fotosintesi', text: "Cosa si intende per approccio 'basato sul carbonio' per lo sviluppo del LAI? E per approccio 'basato sulla temperatura'?" },
  { id: 'D26', number: 26, section: 'Assimilazione – RUE e Fotosintesi', text: "Cos'è la funzione expolineare (Goudriaan & Monteith, 1990)? Quali parametri la caratterizzano?" },
  { id: 'D27', number: 27, section: 'Traspirazione e ETP', text: "Dare la definizione di evapotraspirazione potenziale (ETP)." },
  { id: 'D28', number: 28, section: 'Traspirazione e ETP', text: "Citare tre variabili meteorologiche necessarie per calcolare l'ETP con il metodo Penman-Monteith." },
  { id: 'D29', number: 29, section: 'Traspirazione e ETP', text: 'Come viene separata la traspirazione della coltura dall\'evaporazione del suolo nei modelli? Quale variabile di stato è centrale?' },
  { id: 'D30', number: 30, section: 'Traspirazione e ETP', text: 'In che modo lo stress idrico riduce la fotosintesi nel modello Daisy? Descrivere il meccanismo in 2 righe.' },
  { id: 'D31', number: 31, section: 'Traspirazione e ETP', text: "Cos'è la Water Use Efficiency (WUE)? Scrivere la formula per calcolarla." },
  { id: 'D32', number: 32, section: 'Traspirazione e ETP', text: 'Spiegare il ruolo della resistenza stomatica e della resistenza aerodinamica nel calcolo della traspirazione fogliare.' },
  { id: 'D33', number: 33, section: 'Acqua nel Suolo', text: 'Definire SAT, DUL e LL nel bilancio idrico del suolo. A quale concetto agronomico corrisponde DUL?' },
  { id: 'D34', number: 34, section: 'Acqua nel Suolo', text: 'Scrivere le formule per il Lower Limit (LL) e per l\'acqua disponibile (AWC). Spiegare cosa rappresenta EXTR.' },
  { id: 'D35', number: 35, section: 'Acqua nel Suolo', text: 'Elencare tutti gli input e tutte le vie di perdita del bilancio idrico del suolo.' },
  { id: 'D36', number: 36, section: 'Acqua nel Suolo', text: "Cos'è l'equazione di Richards e in quale contesto viene usata nei Modelli colturali rispetto all'approccio a 'benne'?" },
  { id: 'D37', number: 37, section: 'Acqua nel Suolo', text: 'In quale condizione si verifica il drenaggio profondo nel bilancio idrico del suolo?' },
  { id: 'D38', number: 38, section: 'Acqua nel Suolo', text: 'Spiegare come lo stress idrico viene calcolato in relazione ai parametri DUL e LL del suolo.' },
  { id: 'D39', number: 39, section: 'Azoto nel Suolo', text: 'Citare i quattro principali processi del ciclo dell\'azoto nel suolo simulati nei Modelli colturali.' },
  { id: 'D40', number: 40, section: 'Azoto nel Suolo', text: 'In quale condizione avviene la denitrificazione? Quali tre variabili la governano nei modelli?' },
  { id: 'D43', number: 43, section: 'Azoto nel Suolo', text: 'Come influisce una carenza di azoto sulla crescita della biomassa rispetto allo sviluppo fenologico?' },
  { id: 'D44', number: 44, section: 'Azoto nel Suolo', text: "Cos'è la Nitrogen Use Efficiency (NUE)? Come si calcola a partire dagli output di un modello?" },
  { id: 'D46', number: 46, section: 'Ripartizione dei Fotosintetati e Senescenza', text: 'Quali sono le due principali cause di senescenza fogliare simulate nei Modelli colturali?' },
  { id: 'D47', number: 47, section: 'Ripartizione dei Fotosintetati e Senescenza', text: 'Cos\'è il LAI critico (LAICR) e cosa accade quando il LAI lo supera nei modelli?' },
  { id: 'D48', number: 48, section: 'Ripartizione dei Fotosintetati e Senescenza', text: 'Descrivere il meccanismo con cui il gelo (temperature negative) distrugge l\'area fogliare nei modelli. Da quali variabili dipende?' },
  { id: 'D49', number: 49, section: 'Ripartizione dei Fotosintetati e Senescenza', text: "Cosa si intende per 'source limitation' e 'sink limitation' nella crescita della coltura?" },
  { id: 'D50', number: 50, section: 'Simulazione degli Stress e SOM', text: 'Come agisce un fattore di stress (idrico o azotato) sul tasso di crescita in un modello? Descrivere il concetto di moltiplicatore.' },
];

const mc = (
  id: string,
  number: number,
  section: QuizSection,
  text: string,
  options: [string, string, string, string],
  correctIndex: number
): ClosedQuestion => ({ id, number, section, text, options, correctIndex });

/**
 * Risposte di riferimento per le domande aperte (D1–D50).
 * Sono soluzioni indicative: il professore può accettare formulazioni equivalenti.
 */
export const OPEN_ANSWERS: Record<string, string> = {
  D1: `Un modello colturale è una rappresentazione matematica semplificata dei principali processi fisiologici di una coltura (fenologia, intercettazione della luce, fotosintesi, traspirazione, ripartizione degli assimilati) e delle sue interazioni con suolo, clima e gestione.
Permette di simulare nel tempo crescita, sviluppo, resa e bilanci di acqua e nutrienti.`,

  D2: `Variabile di stato: quantità accumulata che descrive lo stato del sistema in un dato istante (es. biomassa totale [g m⁻²], contenuto idrico del suolo [mm], CTU [°C·d]).
Variabile di tasso (flusso): velocità di variazione di una variabile di stato nel tempo (es. dB/dt [g m⁻² d⁻¹], traspirazione giornaliera [mm d⁻¹]).
Relazione: state(t+1) = state(t) + rate · Δt.`,

  D3: `Variabile di stato: cambia nel tempo durante la simulazione (es. LAI giornaliero, biomassa).
Parametro: coefficiente fisso che descrive una proprietà della coltura/suolo/sistema e non cambia durante la singola simulazione (es. RUE, T_base, K_PAR).`,

  D4: `Tre esempi tipici:
1) Dati meteo giornalieri (T_min, T_max, radiazione solare, precipitazione, umidità, vento).
2) Caratteristiche del suolo (tessitura, profondità, contenuto idrico iniziale, sostanza organica).
3) Gestione agronomica (data di semina, densità, irrigazioni, concimazioni).`,

  D5: `Situazione "potenziale" (Rabbinge, 1993): la crescita è limitata SOLO dalla cultivar, dalla radiazione solare e dalla temperatura.
Si assumono: acqua e nutrienti abbondanti, nessuno stress biotico (parassiti, malattie, infestanti).
Le situazioni successive sono "limitata da acqua", "limitata da nutrienti" e "ridotta da stress biotici".`,

  D6: `Calibrazione: regolazione dei parametri del modello (per tentativi o con metodi automatici come grid search/ottimizzazione) per riprodurre al meglio dati sperimentali osservati.
Validazione: verifica delle prestazioni del modello calibrato su un set di dati INDIPENDENTE, non usato in calibrazione, tramite metriche statistiche (RMSE, R², nRMSE).
Differenza: la calibrazione aggiusta il modello; la validazione lo mette alla prova.`,

  D7: `Fenologia: studio delle fasi di sviluppo della coltura (emergenza, foglie, fioritura, maturazione) in funzione del tempo termico accumulato.
Formula semplificata: DTU = max(0, (T_min + T_max)/2 − T_base).
Versione corretta dalla funzione di risposta: DTU = (TP1D − TBD) · Tempfun(T_media).`,

  D8: `Fillocrono (PHYL): tempo termico (gradi giorno, °C·d) necessario per emettere un nuovo nodo/foglia sul fusto principale.
INODE = DTU / PHYL  [nodi/giorno] = tasso di emissione di nodi al giorno.`,

  D10: `Somma cumulata dei nodi giorno per giorno (MSNN = Main Stem Node Number):
MSNN(t+1) = MSNN(t) + INODE(t)
oppure equivalentemente MSNN(t) = Σ INODE(i) per i = 1 ... t.`,

  D12: `Metodo 1 (semplice): GDD = max(0, (T_min + T_max)/2 − T_base). Si usa T_min reale anche quando è < T_base.
Metodo 2 (corretto): se T_min < T_base, si sostituisce T_min con T_base, poi GDD = ((max(T_min, T_base) + T_max)/2) − T_base.
Differenza: il Metodo 2 non penalizza la coltura per le notti fredde (sotto T_base la pianta non "perde" sviluppo, semplicemente non avanza). Risulta sempre GDD_Metodo2 ≥ GDD_Metodo1.`,

  D14: `Vernalizzazione: esposizione obbligata (o facilitante) di certe colture (frumento autunnale, barbabietola, colza) a basse temperature (≈ 0–10 °C) per indurre/accelerare la fioritura.
VDSAT: numero di giorni di vernalizzazione necessari per SATURARE la risposta. Oltre VDSAT la pianta è completamente vernalizzata e il freddo aggiuntivo non accelera ulteriormente la fioritura.`,

  D15: `Risposta quantitativa: il freddo ACCELERA la fioritura ma non è strettamente necessario. La pianta fiorisce anche senza vernalizzazione, solo più tardi.
Risposta qualitativa: il freddo è OBBLIGATORIO. Senza il periodo di vernalizzazione la pianta non fiorisce affatto (resta vegetativa).`,

  D16: `I cinque elementi della funzione Tempfun(T) sono:
1) TMP = temperatura media giornaliera (input)
2) TBD = temperatura base
3) TP1D = temperatura ottimale inferiore
4) TP2D = temperatura ottimale superiore
5) TCD = temperatura critica massima
Quando TMP < TBD ⇒ Tempfun = 0 (nessuno sviluppo / crescita nulla).`,

  D17: `Funzione beta: funzione non lineare a campana asimmetrica definita tra TBD e TCD con massimo a Topt:
f(T) = [(T − TBD)/(Topt − TBD)]^a · [(TCD − T)/(TCD − Topt)]^b
Vantaggi rispetto alla trapezoidale:
• curva liscia, biologicamente più realistica (transizioni graduali);
• derivata continua, utile per metodi di ottimizzazione;
• un solo Topt invece di due ottimali (TP1D, TP2D).`,

  D18: `BVP (Basic Vegetative Phase): fase vegetativa di base, sviluppo guidato SOLO dalla temperatura (insensibile al fotoperiodo).
PIP (Photoperiod-Induced Phase): fase indotta dal fotoperiodo; lo sviluppo procede solo quando il fotoperiodo scende sotto una soglia critica (la canapa è una specie brevidiurna).
FDP (Flower Development Phase): sviluppo dei fiori fino alla maturazione, di nuovo guidato dal tempo termico.`,

  D19: `RUE (Radiation Use Efficiency): efficienza di conversione della PAR intercettata in biomassa secca.
Formula: dB/dt = RUE · FINT · PAR_incidente
dove FINT è la frazione di PAR intercettata dalla chioma.`,

  D20: `Unità: g MJ⁻¹ (grammi di biomassa secca per MJ di PAR intercettata).
Significato fisico: quanti grammi di sostanza secca la coltura produce per ogni MJ di luce intercettata.
Valori tipici: 1,5–2,5 g/MJ per C3, 3,0–4,0 g/MJ per C4 (mais).`,

  D21: `FINT = 1 − exp(−K_PAR · LAI)   (legge di Beer–Lambert applicata alla chioma).
K_PAR è il coefficiente di estinzione della luce PAR: quantifica quanto rapidamente la chioma "assorbe" la luce all'aumentare del LAI.
Dipende dall'architettura fogliare: foglie erette → K basso (~0,4), foglie orizzontali → K alto (~0,8).`,

  D23: `Approccio RUE: empirico, una sola equazione (B = RUE · PAR intercettata) che riassume in un coefficiente l'effetto netto di fotosintesi e respirazione. Pochi parametri, rapido da calibrare.
Modello meccanicistico (Gecros, Daisy): calcola esplicitamente la fotosintesi lorda (es. Farquhar a livello fogliare integrato sulla canopy), la respirazione (mantenimento + crescita) e gestisce un pool di assimilati ripartito tra organi. Più dati e parametri, ma più trasferibile e sensibile a [CO₂], stress, ecc.`,

  D24: `Approccio "basato sul carbonio": l'area fogliare cresce in proporzione alla biomassa fogliare prodotta tramite SLA (Specific Leaf Area):
dLAI/dt = SLA · dW_foglia/dt.
Se mancano assimilati, la canopy si espande meno.
Approccio "basato sulla temperatura": lo sviluppo del LAI è guidato dai gradi giorno (DTU) e segue una traiettoria prefissata; si assume che gli assimilati non siano mai limitanti.`,

  D26: `Funzione expolineare (Goudriaan & Monteith, 1990): descrive la transizione dalla fase esponenziale (chioma aperta) alla fase lineare (chioma chiusa, intercettazione satura).
W(t) = (c_m / r_m) · ln[ 1 + exp(r_m · (t − t_b)) ]
Parametri caratteristici:
• r_m = tasso relativo nella fase esponenziale [g g⁻¹ d⁻¹]
• c_m = tasso massimo di crescita lineare [g m⁻² d⁻¹]
• t_b = tempo base (intercetta temporale)`,

  D27: `ETP (evapotraspirazione potenziale): quantità massima di acqua che può essere persa per evaporazione dal suolo + traspirazione dalla coltura quando l'acqua è abbondante e non c'è limitazione stomatica/idrica.
Dipende solo dai fattori climatici (radiazione netta, temperatura, umidità, vento) e dalle caratteristiche della superficie evaporante.`,

  D28: `Quattro variabili tipicamente richieste (tre qualsiasi):
1) Radiazione netta (o globale + albedo);
2) Temperatura dell'aria;
3) Umidità relativa (o pressione di vapore);
4) Velocità del vento a 2 m.`,

  D29: `La partizione di ETP fra traspirazione (T) ed evaporazione del suolo (E) è regolata dal LAI, che è la variabile di stato centrale:
• LAI piccolo → la radiazione raggiunge il suolo → E domina.
• LAI alto → la chioma intercetta la radiazione → T domina.
Formulazione tipica: T = ET · (1 − exp(−K · LAI));  E = ET · exp(−K · LAI).`,

  D30: `Nel modello Daisy, quando il contenuto idrico del suolo cala, la pianta CHIUDE GLI STOMI per limitare le perdite. La chiusura stomatica aumenta la resistenza al passaggio di CO₂ verso il mesofillo, riducendo l'assimilazione fotosintetica.`,

  D31: `WUE (Water Use Efficiency): efficienza con cui la coltura converte l'acqua usata in biomassa o resa.
WUE = Biomassa (o Resa) / Acqua evapotraspirata   [g/kg oppure kg/m³]`,

  D32: `Resistenza stomatica (r_s): controllata dalla pianta; regola l'apertura/chiusura degli stomi in risposta a luce, CO₂, deficit idrico. Bassa con stomi aperti, alta con stomi chiusi.
Resistenza aerodinamica (r_a): legata al rimescolamento dell'aria sopra la canopy; dipende da velocità del vento e altezza della coltura. Bassa con vento forte/coltura alta, alta con aria ferma.
Insieme determinano il flusso di vapore: T ∝ ΔVPD / (r_a + r_s) nell'equazione di Penman–Monteith.`,

  D33: `SAT: contenuto idrico a saturazione (pori pieni, salvo aria intrappolata).
DUL (Drained Upper Limit): contenuto idrico dopo che l'acqua gravitazionale è defluita. CORRISPONDE ALLA CAPACITÀ DI CAMPO.
LL (Lower Limit): contenuto idrico oltre cui la pianta non riesce più a estrarre acqua (= punto di appassimento permanente).
Ordine: LL < DUL < SAT.`,

  D34: `LL = DUL − EXTR
AWC = DUL − LL  (= EXTR)
EXTR (Extractable Water): quantità di acqua estraibile dalla pianta tra capacità di campo e punto di appassimento. Rappresenta la riserva utile.`,

  D35: `Input di acqua: precipitazione, irrigazione, eventuale risalita capillare dalla falda.
Vie di perdita: evaporazione dal suolo (E), traspirazione della coltura (T), scorrimento superficiale (runoff), drenaggio profondo (oltre la profondità radicale).
Equazione: ΔS = (P + I) − (E + T + Runoff + Drainage).`,

  D36: `Equazione di Richards: PDE non lineare per il moto dell'acqua in un mezzo poroso non saturo, ottenuta combinando Darcy + continuità:
∂θ/∂t = ∂/∂z [ K(θ) · (∂ψ/∂z + 1) ].
Usata nei modelli MECCANICISTICI (Hydrus, Daisy) per profili idrici dettagliati.
Approccio a "benne" (tipping bucket): discretizza il suolo in strati e usa regole semplici (overflow oltre DUL → strato sottostante). È veloce, parsimonioso in parametri, ma trascura la dinamica capillare.`,

  D37: `Il drenaggio profondo si verifica quando il contenuto idrico del suolo (o di uno strato) SUPERA LA CAPACITÀ DI CAMPO (DUL): l'acqua in eccesso percola per gravità verso strati inferiori finché lo strato torna a DUL.`,

  D38: `Si definisce la frazione di acqua trasferibile per la pianta:
FTSW = (θ − LL) / (DUL − LL)
• FTSW ≥ soglia (es. 0,5): nessuno stress (f_stress = 1).
• FTSW = 0: stress massimo (f_stress = 0, appassimento).
• Tra le due: f_stress varia tipicamente in modo lineare o non lineare.
Il fattore di stress (0–1) moltiplica il tasso potenziale di crescita o di traspirazione.`,

  D39: `Quattro processi del ciclo dell'N:
1) Mineralizzazione (N organico → NH₄⁺), e immobilizzazione (inverso).
2) Nitrificazione (NH₄⁺ → NO₂⁻ → NO₃⁻).
3) Denitrificazione (NO₃⁻ → N₂O, N₂; perdita gassosa in condizioni anaerobiche).
4) Lisciviazione di NO₃⁻ verso le acque profonde (e/o assorbimento da parte della coltura).`,

  D40: `La denitrificazione avviene in condizioni ANAEROBICHE (suolo saturo o quasi). I batteri denitrificanti riducono NO₃⁻ a N₂O e N₂ usando il nitrato come accettore di elettroni in assenza di O₂.
Tre variabili governano il processo:
1) Contenuto idrico del suolo (proxy dell'anaerobiosi).
2) Temperatura (attività microbica).
3) Concentrazione di NO₃⁻ (substrato).`,

  D43: `Una carenza di azoto riduce principalmente:
• la crescita della biomassa (per riduzione di RUE, del contenuto di clorofilla e dell'area fogliare);
• l'espansione fogliare (LAI più basso).
Lo sviluppo fenologico è poco influenzato: le tappe (emergenza, fioritura, maturazione) dipendono soprattutto dalla temperatura. Una coltura carente di N è più piccola ma matura ai tempi soliti.`,

  D44: `NUE (Nitrogen Use Efficiency): efficienza con cui la coltura usa l'azoto per produrre biomassa o resa.
Definizioni operative comuni:
• NUE agronomica = (Resa − Resa non concimato) / N apportato.
• NUE fisiologica = Biomassa (o Resa) / N totale assorbito.
Da un modello: si prendono i pool simulati di N nella biomassa e si rapportano alla biomassa/resa.`,

  D46: `Due cause principali di senescenza fogliare nei modelli:
1) Auto-ombreggiamento: quando LAI > LAI critico (LAICR), le foglie basali ricevono troppa poca luce e senescono.
2) Età/stress: senescenza ontogenetica (specie dopo la fioritura) o indotta da stress idrico, termico (gelo, caldo) e nutrizionale.`,

  D47: `LAICR è il valore di LAI oltre il quale la canopy si auto-ombreggia: le foglie basali ricevono meno luce della loro soglia di compensazione.
Quando LAI > LAICR il modello attiva un tasso di senescenza proporzionale all'eccesso, ad esempio dLAI/dt_sen = k · (LAI − LAICR), in modo che il LAI converga verso LAICR.`,

  D48: `Quando T_min scende sotto una soglia critica (specie-specifica, es. −2 °C), il modello rimuove una frazione del LAI proporzionale a:
• intensità del gelo (T_crit − T_min): più freddo = più danno;
• LAI attuale (più foglie esposte = più area persa in valore assoluto).
Formulazione tipica: ΔLAI_gelo = −LAI · f(T_min), con f(T_min) crescente al diminuire di T_min.
Dipende quindi da T_min e LAI attuale.`,

  D49: `Source limitation: la produzione di assimilati (la "sorgente": foglie/fotosintesi) è il fattore limitante. La pianta produce troppo poco e gli organi di accumulo restano sotto-riempiti (es. coltura giovane, ombreggiata, in stress).
Sink limitation: la capacità degli organi di accumulo (la "destinazione": numero/dimensione massima delle granella) è il fattore limitante. La pianta produce assimilati ma non ha "dove metterli".
In una coltura ben gestita, sorgente e destinazione sono bilanciate.`,

  D50: `I fattori di stress sono implementati come MOLTIPLICATORI compresi tra 0 e 1 che riducono il tasso potenziale:
dB/dt_attuale = dB/dt_potenziale · f_idrico · f_N · f_T
• f = 1 → nessuno stress (crescita = potenziale).
• f = 0 → stress massimo (crescita = 0).
• 0 < f < 1 → crescita ridotta proporzionalmente.
Spesso si applica il principio del fattore limitante (legge di Liebig): si usa il minimo tra i moltiplicatori, oppure il loro prodotto in caso di interazione tra stress.`,
};

export const CLOSED_QUESTIONS: ClosedQuestion[] = [
  mc('D51', 51, 'Introduzione alla Modellistica', 'Quale delle seguenti è una variabile di STATO in un Modello colturale?', ['Temperatura massima giornaliera', 'Biomassa totale della coltura (g m⁻²)', 'Quantità di fertilizzante applicata', 'Radiazione solare incidente'], 1),
  mc('D52', 52, 'Introduzione alla Modellistica', "Un 'parametro' in un modello di simulazione è:", ['Una variabile che cambia ogni giorno', 'Un valore misurato direttamente in campo ogni stagione', 'Un coefficiente fisso che descrive proprietà della coltura o del suolo', 'Il risultato finale della simulazione'], 2),
  mc('D53', 53, 'Introduzione alla Modellistica', 'Quale delle seguenti NON è un input tipico di un Modello colturale?', ['Dati meteorologici giornalieri', 'Profilo del suolo', "Resa della coltura dell'anno precedente", 'Data di semina'], 2),
  mc('D54', 54, 'Introduzione alla Modellistica', "Nella situazione produttiva 'potenziale' (Rabbinge, 1993) la crescita è limitata solo da:", ['Disponibilità di acqua e azoto', 'Radiazione solare e temperatura', 'Infestanti e parassiti', 'Disponibilità di fosforo'], 1),
  mc('D55', 55, 'Introduzione alla Modellistica', 'La calibrazione di un modello consiste nel:', ['Testare il modello su dati indipendenti non usati per la messa a punto', 'Regolare i parametri del modello per riprodurre dati osservati', 'Calcolare la biomassa potenziale massima', 'Convertire le unità di misura dei dati di input'], 1),
  mc('D57', 57, 'Fenologia e Sviluppo', 'La formula per calcolare la DTU (Daily Temperature Unit) è:', ['DTU = TMAX − TMIN', 'DTU = (TMIN + TMAX) / 2 − TBD', 'DTU = TMAX − TBD', 'DTU = TMIN × PHYL'], 1),
  mc('D64', 64, 'Fenologia e Sviluppo', 'Il parametro VDSAT nella vernalizzazione indica:', ['La temperatura minima soglia per la vernalizzazione', 'I giorni di vernalizzazione necessari per saturare la risposta', 'Il tasso giornaliero di sviluppo al freddo', 'La durata totale del ciclo colturale'], 1),
  mc('D65', 65, 'Fenologia e Sviluppo', 'In una risposta QUALITATIVA alla vernalizzazione, la pianta:', ['Fiorisce comunque, ma più lentamente senza freddo', 'Non fiorisce affatto senza il necessario periodo di freddo', 'Aumenta la RUE in assenza di freddo', 'Sviluppa foglie più grandi in assenza di freddo'], 1),
  mc('D66', 66, 'Fenologia e Sviluppo', 'Nella funzione Tempfun, se TMP < TBD il valore della funzione è:', ['1', '0.5', '0', 'Dipende da TP1D'], 2),
  mc('D67', 67, 'Fenologia e Sviluppo', 'Nella funzione Tempfun, se TP1D < TMP < TP2D il valore della funzione è:', ['0', '0.5', 'Dipende da TBD', '1'], 3),
  mc('D68', 68, 'Fenologia e Sviluppo', 'La funzione beta per la risposta alla temperatura è preferita rispetto alla funzione lineare perché:', ['Richiede meno parametri', 'Produce curve lisce e realistiche', 'Non dipende dalla temperatura ottimale', 'È più semplice da implementare in Excel'], 1),
  mc('D69', 69, 'Assimilazione – RUE e Fotosintesi', "L'unità di misura della Radiation Use Efficiency (RUE) è:", ['g m⁻² d⁻¹', 'g MJ⁻¹', 'MJ m⁻²', 'kg ha⁻¹'], 1),
  mc('D70', 70, 'Assimilazione – RUE e Fotosintesi', 'La formula per la frazione di luce intercettata è:', ['FINT = K × LAI', 'FINT = 1 − K × e^LAI', 'FINT = 1 − e^(−K · LAI)', 'FINT = LAI / K'], 2),
  mc('D72', 72, 'Assimilazione – RUE e Fotosintesi', 'Un valore più alto di K_PAR indica che la chioma:', ['Intercetta la luce più lentamente', 'Intercetta la luce più rapidamente per unità di LAI', 'Ha una maggiore respirazione notturna', 'Ha radici più profonde'], 1),
  mc('D73', 73, 'Assimilazione – RUE e Fotosintesi', "Nell'approccio basato sulla TEMPERATURA per il LAI si assume che:", ['Gli assimilati siano sempre il fattore limitante', "Lo sviluppo fogliare dipenda solo dall'acqua", 'Ci siano sempre abbastanza assimilati e lo sviluppo dipenda dai gradi giorno', 'Il LAI non cambi durante la stagione'], 2),
  mc('D74', 74, 'Assimilazione – RUE e Fotosintesi', "Rispetto all'approccio RUE, un modello meccanicistico calcola esplicitamente:", ['Solo la temperatura del suolo', 'La fotosintesi lorda, la respirazione e il pool di assimilati', 'Solo i parametri genetici della cultivar', 'Solo il bilancio idrico del suolo'], 1),
  mc('D75', 75, 'Assimilazione – RUE e Fotosintesi', "Nell'equazione expolineare, il parametro 'cm' rappresenta:", ['La biomassa iniziale alla semina', 'Il tasso massimo di crescita lineare (g m⁻² d⁻¹)', 'Il coefficiente di estinzione della luce', 'La temperatura base di crescita'], 1),
  mc('D76', 76, 'Assimilazione – RUE e Fotosintesi', "Il tasso giornaliero di aumento del LAI (dL/dt) nell'approccio basato sul carbonio è proporzionale a:", ['Solo al fillocrono', 'Alla quantità totale di acqua nel suolo', 'Al tasso di accumulo della materia secca (dw/dt)', "All'inverso dell'età della pianta"], 2),
  mc('D77', 77, 'Traspirazione e ETP', 'La variabile meteorologica NON necessaria per calcolare l\'ETP con Penman-Monteith è:', ["Temperatura dell'aria", 'Concentrazione di CO₂ atmosferico', 'Umidità relativa', 'Velocità del vento'], 1),
  mc('D78', 78, 'Traspirazione e ETP', 'La partizione ETP tra traspirazione della coltura ed evaporazione del suolo dipende principalmente da:', ['La temperatura del suolo', 'Il contenuto di azoto del suolo', 'Il Leaf Area Index (LAI)', 'La profondità delle radici'], 2),
  mc('D79', 79, 'Traspirazione e ETP', 'Nel modello Daisy, lo stress idrico riduce la fotosintesi principalmente attraverso:', ['Riduzione della clorofilla', 'Aumento della respirazione notturna', "Chiusura stomatica che riduce l'assimilazione di CO₂", 'Caduta precoce delle foglie'], 2),
  mc('D80', 80, 'Traspirazione e ETP', 'La Water Use Efficiency (WUE) si calcola come:', ['Rapporto tra ETP e precipitazione', 'Rapporto tra biomassa (o resa) e acqua evapotraspirata', 'Differenza tra precipitazione e deflusso', 'Prodotto tra LAI e traspirazione giornaliera'], 1),
  mc('D81', 81, 'Traspirazione e ETP', 'La resistenza aerodinamica nella formula di Penman-Monteith dipende principalmente da:', ['Il contenuto idrico del suolo', "La velocità del vento e l'altezza della coltura", 'Il LAI e la temperatura', 'La concentrazione di CO₂'], 1),
  mc('D82', 82, 'Acqua nel Suolo', 'DUL (Drained Upper Limit) corrisponde al concetto agronomico di:', ['Punto di appassimento permanente', 'Capacità di campo', 'Porosità totale', 'Acqua gravitazionale libera'], 1),
  mc('D83', 83, 'Acqua nel Suolo', 'La formula corretta per il Lower Limit (LL) è:', ['LL = SAT − PO', 'LL = DUL − EXTR', 'LL = DULg × BD', 'LL = PO − e'], 1),
  mc('D84', 84, 'Acqua nel Suolo', 'Quale delle seguenti è un INPUT di acqua nel bilancio idrico del suolo?', ['Traspirazione della coltura', 'Evaporazione dal suolo', 'Precipitazione', 'Drenaggio profondo'], 2),
  mc('D85', 85, 'Acqua nel Suolo', "L'acqua disponibile per la pianta (AWC) si calcola come:", ['AWC = SAT − DUL', 'AWC = DUL − LL', 'AWC = SAT − LL', 'AWC = DUL + LL'], 1),
  mc('D86', 86, 'Acqua nel Suolo', 'Il drenaggio profondo nel bilancio idrico avviene quando il contenuto idrico del suolo supera:', ['Il punto di appassimento (LL)', 'La capacità di campo (DUL)', 'La metà di AWC', 'Il valore di SAT diviso 2'], 1),
  mc('D87', 87, 'Acqua nel Suolo', 'SAT (saturazione) nel modello idrico del suolo si calcola come:', ['SAT = DUL + EXTR', 'SAT = PO − e  (porosità totale meno aria intrappolata)', 'SAT = DUL × BD', 'SAT = LL + AWC'], 1),
  mc('D88', 88, 'Azoto nel Suolo', 'La denitrificazione nel suolo avviene principalmente quando:', ['La temperatura è sotto 0 °C', "Il suolo è saturo d'acqua (condizioni anaerobiche)", "C'è eccesso di radiazione solare", 'Il pH del suolo è molto acido'], 1),
  mc('D91', 91, 'Azoto nel Suolo', 'Una carenza di azoto in una coltura influenza principalmente:', ['Lo sviluppo fenologico (fioritura anticipata)', 'La crescita della biomassa e il tasso fotosintetico', "L'assorbimento di acqua dalle radici", 'La temperatura del suolo'], 1),
  mc('D92', 92, 'Azoto nel Suolo', "Il processo di mineralizzazione dell'azoto organico è favorito da:", ['Suolo freddo e secco', 'Temperatura elevata e suolo umido', 'Alte concentrazioni di N minerale', 'Condizioni di anaerobiosi'], 1),
  mc('D93', 93, 'Azoto nel Suolo', 'Il principale gas serra prodotto dalla denitrificazione nel suolo agricolo è:', ['CO₂', 'CH₄', 'N₂O', 'NH₃'], 2),
  mc('D94', 94, 'Ripartizione dei Fotosintetati e Senescenza', "L'Harvest Index (HI) è definito come:", ['Rapporto tra produzione lorda e netta', 'Rapporto tra resa della granella e biomassa totale della coltura', 'Rapporto tra N nella granella e N totale', 'Rapporto tra LAI massimo e LAI alla raccolta'], 1),
  mc('D95', 95, 'Ripartizione dei Fotosintetati e Senescenza', 'La senescenza fogliare da ombreggiamento si attiva quando:', ['La temperatura scende sotto 0 °C', 'Il LAI supera il valore critico LAICR', "L'acqua nel suolo scende sotto il LL", 'Il contenuto di N fogliare è nullo'], 1),
  mc('D96', 96, 'Ripartizione dei Fotosintetati e Senescenza', 'La perdita di LAI per danno da gelo nei modelli dipende principalmente da:', ['Il LAI attuale e la radiazione solare', 'La temperatura minima giornaliera (TMIN)', 'Il contenuto idrico del suolo', 'La quantità di azoto disponibile'], 1),
  mc('D97', 97, 'Ripartizione dei Fotosintetati e Senescenza', 'Nelle prime fasi di crescita di una coltura, lo sviluppo del LAI è principalmente:', ['Lineare nel tempo', 'Esponenziale, proporzionale alla biomassa esistente', 'Costante finché non si raggiunge il LAI massimo', 'Inversamente proporzionale alla temperatura'], 1),
  mc('D98', 98, 'Simulazione degli Stress e SOM', 'I fattori di stress nei Modelli colturali agiscono tipicamente come:', ['Costanti addizionali al tasso di crescita', 'Moltiplicatori compresi tra 0 e 1 che riducono il tasso potenziale', 'Offset negativi sulla temperatura base', 'Parametri genotipici fissi'], 1),
  mc('D99', 99, 'Simulazione degli Stress e SOM', 'Nel modello ECOSSE per la dinamica della SOM, i pool organici includono generalmente:', ['Solo humus stabile e lettiera fresca', 'Pool labile, recalcitrante, biomassa microbica e humus stabile', 'Solo carbonio inorganico e organico totale', 'Unicamente pool di N ammoniacale e nitrico'], 1),
  mc('D100', 100, 'Simulazione degli Stress e SOM', 'Simulare la sostanza organica del suolo (SOM) in un Modello colturale è importante perché:', ['Determina direttamente la temperatura del suolo', "Influenza la mineralizzazione dell'N, la struttura del suolo e le emissioni di GHG", 'Sostituisce il calcolo del bilancio idrico', 'È necessaria solo per le colture perenni'], 1),
];
