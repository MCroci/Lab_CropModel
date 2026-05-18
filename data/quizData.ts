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
  { id: 'D9', number: 9, section: 'Fenologia e Sviluppo', text: 'Con DTU = 15 °C e PHYL = 90 °C (assumendo DTU costante nel periodo), quanti giorni occorrono per emettere un nuovo nodo? Mostrare il calcolo.' },
  { id: 'D10', number: 10, section: 'Fenologia e Sviluppo', text: 'Scrivere la formula per la somma cumulata dei nodi fogliari (MSNN) giorno per giorno.' },
  { id: 'D11', number: 11, section: 'Fenologia e Sviluppo', text: 'Qual è la temperatura base (TBD) del mais? E quella del frumento? E quella della barbabietola?' },
  { id: 'D12', number: 12, section: 'Fenologia e Sviluppo', text: 'Descrivere brevemente i due metodi di calcolo GDD quando Tmin è inferiore a Tbase. Qual è la differenza nei risultati?' },
  { id: 'D13', number: 13, section: 'Fenologia e Sviluppo', text: 'Con Tmin = 5 °C, Tmax = 28 °C e Tbase = 8 °C (mais), calcolare i GDD giornalieri con entrambi i metodi.' },
  { id: 'D14', number: 14, section: 'Fenologia e Sviluppo', text: "Cos'è la vernalizzazione? Cosa indica il parametro VDSAT nel modello?" },
  { id: 'D15', number: 15, section: 'Fenologia e Sviluppo', text: 'Qual è la differenza tra risposta quantitativa e qualitativa alla vernalizzazione?' },
  { id: 'D16', number: 16, section: 'Fenologia e Sviluppo', text: 'Quali sono i cinque parametri della funzione Tempfun? Qual è il valore della funzione quando TMP < TBD?' },
  { id: 'D17', number: 17, section: 'Fenologia e Sviluppo', text: "Cos'è la funzione beta per la risposta alla temperatura? Quali vantaggi offre rispetto alla funzione lineare a tratti?" },
  { id: 'D18', number: 18, section: 'Fenologia e Sviluppo', text: 'Descrivere le tre fasi di sviluppo del modello fenologico per la canapa: BVP, PIP e FDP.' },
  { id: 'D19', number: 19, section: 'Assimilazione – RUE e Fotosintesi', text: 'Definire la Radiation Use Efficiency (RUE) e scrivere la formula per calcolare la biomassa giornaliera.' },
  { id: 'D20', number: 20, section: 'Assimilazione – RUE e Fotosintesi', text: "Qual è l'unità di misura della RUE? Spiegarne il significato fisico." },
  { id: 'D21', number: 21, section: 'Assimilazione – RUE e Fotosintesi', text: 'Scrivere la formula FINT e spiegare a cosa serve il coefficiente K_PAR.' },
  { id: 'D22', number: 22, section: 'Assimilazione – RUE e Fotosintesi', text: 'Se LAI = 3 e K_PAR = 0.5, calcolare la frazione di luce intercettata FINT.' },
  { id: 'D23', number: 23, section: 'Assimilazione – RUE e Fotosintesi', text: "Qual è la differenza principale tra l'approccio RUE e un modello meccanicistico come Gecros o Daisy?" },
  { id: 'D24', number: 24, section: 'Assimilazione – RUE e Fotosintesi', text: "Cosa si intende per approccio 'basato sul carbonio' per lo sviluppo del LAI? E per approccio 'basato sulla temperatura'?" },
  { id: 'D25', number: 25, section: 'Assimilazione – RUE e Fotosintesi', text: 'Descrivere la crescita esponenziale di una coltura nelle prime fasi. Qual è il valore tipico di rm e a cosa dipende?' },
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
  { id: 'D41', number: 41, section: 'Azoto nel Suolo', text: 'Qual è il valore limite di N solubile (NCON) usato nel calcolo della denitrificazione e perché viene imposto?' },
  { id: 'D42', number: 42, section: 'Azoto nel Suolo', text: 'Qual è il valore tipico di accumulo stagionale massimo di azoto per una coltura non leguminosa come il mais?' },
  { id: 'D43', number: 43, section: 'Azoto nel Suolo', text: 'Come influisce una carenza di azoto sulla crescita della biomassa rispetto allo sviluppo fenologico?' },
  { id: 'D44', number: 44, section: 'Azoto nel Suolo', text: "Cos'è la Nitrogen Use Efficiency (NUE)? Come si calcola a partire dagli output di un modello?" },
  { id: 'D45', number: 45, section: 'Ripartizione dei Fotosintetati e Senescenza', text: "Cos'è l'Harvest Index (HI)? Scrivere la formula e indicare valori tipici per mais e frumento." },
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

export const CLOSED_QUESTIONS: ClosedQuestion[] = [
  mc('D51', 51, 'Introduzione alla Modellistica', 'Quale delle seguenti è una variabile di STATO in un Modello colturale?', ['Temperatura massima giornaliera', 'Biomassa totale della coltura (g m⁻²)', 'Quantità di fertilizzante applicata', 'Radiazione solare incidente'], 1),
  mc('D52', 52, 'Introduzione alla Modellistica', "Un 'parametro' in un modello di simulazione è:", ['Una variabile che cambia ogni giorno', 'Un valore misurato direttamente in campo ogni stagione', 'Un coefficiente fisso che descrive proprietà della coltura o del suolo', 'Il risultato finale della simulazione'], 2),
  mc('D53', 53, 'Introduzione alla Modellistica', 'Quale delle seguenti NON è un input tipico di un Modello colturale?', ['Dati meteorologici giornalieri', 'Profilo del suolo', "Resa della coltura dell'anno precedente", 'Data di semina'], 2),
  mc('D54', 54, 'Introduzione alla Modellistica', "Nella situazione produttiva 'potenziale' (Rabbinge, 1993) la crescita è limitata solo da:", ['Disponibilità di acqua e azoto', 'Radiazione solare e temperatura', 'Infestanti e parassiti', 'Disponibilità di fosforo'], 1),
  mc('D55', 55, 'Introduzione alla Modellistica', 'La calibrazione di un modello consiste nel:', ['Testare il modello su dati indipendenti non usati per la messa a punto', 'Regolare i parametri del modello per riprodurre dati osservati', 'Calcolare la biomassa potenziale massima', 'Convertire le unità di misura dei dati di input'], 1),
  mc('D56', 56, 'Introduzione alla Modellistica', 'Secondo Goudriaan & Van Laar (1994), un tipico valore del tasso di crescita relativo (rm) nella fase esponenziale è:', ['0.01 g g⁻¹ d⁻¹', '0.1 g g⁻¹ d⁻¹', '1.0 g g⁻¹ d⁻¹', '10.0 g g⁻¹ d⁻¹'], 1),
  mc('D57', 57, 'Fenologia e Sviluppo', 'La formula per calcolare la DTU (Daily Temperature Unit) è:', ['DTU = TMAX − TMIN', 'DTU = (TMIN + TMAX) / 2 − TBD', 'DTU = TMAX − TBD', 'DTU = TMIN × PHYL'], 1),
  mc('D58', 58, 'Fenologia e Sviluppo', 'Con DTU = 12 °C e PHYL = 60 °C, il valore di INODE è:', ['0.10', '0.20', '0.50', '5.0'], 1),
  mc('D59', 59, 'Fenologia e Sviluppo', 'La temperatura base per lo sviluppo (TBD) del mais vale:', ['0 °C', '5 °C', '8 °C', '15 °C'], 2),
  mc('D60', 60, 'Fenologia e Sviluppo', 'Le temperature cardinali (TBD / TP1D / TP2D / TCD) del frumento sono:', ['0 – 25 – 28 – 40 °C', '8 – 30 – 37 – 45 °C', '5 – 20 – 30 – 42 °C', '0 – 15 – 25 – 38 °C'], 0),
  mc('D61', 61, 'Fenologia e Sviluppo', 'Le temperature cardinali (TBD / TP1D / TP2D / TCD) del mais sono:', ['0 – 25 – 28 – 40 °C', '8 – 30 – 37 – 45 °C', '5 – 20 – 30 – 42 °C', '0 – 15 – 25 – 38 °C'], 1),
  mc('D62', 62, 'Fenologia e Sviluppo', 'Nel Metodo 2 di calcolo dei GDD (quando Tmin < Tbase, Tmin viene sostituita con Tbase per evitare GDD negativi): se Tmin osservata = 3 °C e Tbase = 8 °C (mais), quale valore di Tmin si usa nel calcolo?', ['3 °C (valore osservato)', '5.5 °C (media tra 3 e 8)', '8 °C (sostituito con Tbase)', '0 °C'], 2),
  mc('D63', 63, 'Fenologia e Sviluppo', 'Il valore tipico del fillocrono (PHYL) per la maggior parte delle colture è tra:', ['5 – 20 °C', '40 – 120 °C', '200 – 400 °C', '500 – 1000 °C'], 1),
  mc('D64', 64, 'Fenologia e Sviluppo', 'Il parametro VDSAT nella vernalizzazione indica:', ['La temperatura minima soglia per la vernalizzazione', 'I giorni di vernalizzazione necessari per saturare la risposta', 'Il tasso giornaliero di sviluppo al freddo', 'La durata totale del ciclo colturale'], 1),
  mc('D65', 65, 'Fenologia e Sviluppo', 'In una risposta QUALITATIVA alla vernalizzazione, la pianta:', ['Fiorisce comunque, ma più lentamente senza freddo', 'Non fiorisce affatto senza il necessario periodo di freddo', 'Aumenta la RUE in assenza di freddo', 'Sviluppa foglie più grandi in assenza di freddo'], 1),
  mc('D66', 66, 'Fenologia e Sviluppo', 'Nella funzione Tempfun, se TMP < TBD il valore della funzione è:', ['1', '0.5', '0', 'Dipende da TP1D'], 2),
  mc('D67', 67, 'Fenologia e Sviluppo', 'Nella funzione Tempfun, se TP1D < TMP < TP2D il valore della funzione è:', ['0', '0.5', 'Dipende da TBD', '1'], 3),
  mc('D68', 68, 'Fenologia e Sviluppo', 'La funzione beta per la risposta alla temperatura è preferita rispetto alla funzione lineare perché:', ['Richiede meno parametri', 'Produce curve lisce e realistiche', 'Non dipende dalla temperatura ottimale', 'È più semplice da implementare in Excel'], 1),
  mc('D69', 69, 'Assimilazione – RUE e Fotosintesi', "L'unità di misura della Radiation Use Efficiency (RUE) è:", ['g m⁻² d⁻¹', 'g MJ⁻¹', 'MJ m⁻²', 'kg ha⁻¹'], 1),
  mc('D70', 70, 'Assimilazione – RUE e Fotosintesi', 'La formula per la frazione di luce intercettata è:', ['FINT = K × LAI', 'FINT = 1 − K × e^LAI', 'FINT = 1 − e^(−K · LAI)', 'FINT = LAI / K'], 2),
  mc('D71', 71, 'Assimilazione – RUE e Fotosintesi', 'Se LAI = 0 in una coltura appena emersa, il valore di FINT è:', ['1', '0.5', '0', 'Uguale a K_PAR'], 2),
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
  mc('D89', 89, 'Azoto nel Suolo', 'Il valore massimo di N solubile (NCON) usato nel calcolo della denitrificazione è circa:', ['4 g N / litro', '400 mg N / litro (0.0004 g/g acqua)', '40 mg N / litro', '4 mg N / litro'], 1),
  mc('D90', 90, 'Azoto nel Suolo', 'Il tipico accumulo stagionale massimo di N per una coltura non leguminosa è circa:', ['100 g m⁻²', '2.5 g m⁻²', '25 g m⁻²', '250 g m⁻²'], 2),
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
