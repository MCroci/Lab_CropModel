import React, { useState } from 'react';
import { Card, Button, Slider } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { CheckCircle, Lightbulb, Target, ArrowRight, MapPin } from 'lucide-react';

/** Percorsi fissi (allineati alle voci del menu laterale) */
const WHERE = {
  panoramicaCrop:
    'Menu laterale → Panoramica: selettore «Seleziona Coltura (Preset)» (Mais, Frumento, …) e, sotto, «Data di Semina/Trapianto» con cursore sul giorno dell’anno (1–365).',
  meteo:
    'Menu → Generatore Meteo: card «Generatore Stocastico» — imposta Piovosità Media (mm/d), Temperatura Media, poi pulsante «Genera Meteo Sintetico» (la simulazione colturale si aggiorna da sola).',
  fenologia:
    'Menu → Fenologia: card «Parametri Fenologici» (slider Tbase, tuHAR); nella stessa pagina leggi i grafici NDS e CTU.',
  biomassa:
    'Menu → Biomassa: card «Parametri Biomassa» (slider RUE) e grafici di biomassa.',
  bilancioIdrico:
    'Menu → Bilancio Idrico: parametri suolo (es. Curve Number), grafici FTSW/ARID e tabella giornaliera.',
  laiRad:
    'Menu → LAI & Radiazione: slider «Coeff. Estinzione (K)» (= KPAR) e grafici LAI / FINT.',
  funzioniRisposta:
    'Menu → Funzioni di Risposta: scorri le card numerate (inclusa la sezione Runoff SCS).',
  calibrazione:
    'Menu → Analisi e Validazione → Calibrazione.',
  validazione:
    'Menu → Validazione.',
  riduzioneRad:
    'Menu → Riduzione Radiazione (ombreggiamento / scenari di luce ridotta).',
  concetti:
    'Menu → Concetti Base.',
} as const;

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'base' | 'intermedio' | 'avanzato';
  module: string;
  objectives: string[];
  steps: {
    description: string;
    /** Dove cliccare nel menu / quale vista usare */
    where?: string;
    hint?: string;
    solution?: string;
  }[];
  solution: string;
  completed: boolean;
}

export const ExercisesView: React.FC = () => {
  const { cropParams, setCropParams, simulationResults } = useSimulation();
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, Record<number, string>>>({});

  const exercises: Exercise[] = [
    {
      id: 'ex1',
      title: 'Calibrazione del Parametro RUE',
      description: 'Calibra il parametro RUE (Radiation Use Efficiency) per una coltura di mais utilizzando dati sintetici.',
      difficulty: 'base',
      module: 'Accumulo di Biomassa',
      objectives: [
        'Comprendere il processo di calibrazione',
        'Identificare il valore ottimale di RUE',
        'Valutare la bontà di adattamento (RMSE)'
      ],
      steps: [
        {
          description: 'Genera dati osservati sintetici: esegui una simulazione con RUE=3.5 e aggiungi rumore gaussiano (σ≈150-200 kg/ha)',
          where: `${WHERE.calibrazione} Regola RUE dagli slider se richiesto (Menu → Panoramica preset o Biomassa); nella stessa vista Calibrazione usa il pulsante «1. Genera Dati Osservati».`,
          hint: 'Vai alla vista Calibrazione (menu Analisi e Validazione), clicca "Genera Osservazioni Sintetiche"'
        },
        {
          description: 'Esegui calibrazione variando RUE (grid search). Seleziona RUE come parametro da calibrare.',
          where: WHERE.calibrazione,
          hint: 'Nella vista Calibrazione, scegli RUE dal menu, poi clicca "Esegui Calibrazione"'
        },
        {
          description: 'Identifica il valore di RUE che minimizza il RMSE',
          where: WHERE.calibrazione,
          hint: 'Cerca il punto più basso nel grafico RMSE vs RUE'
        },
        {
          description: 'Quale valore di RUE hai trovato? (approssima a 1 decimale)',
          where: 'Risultato letto nei grafici della stessa vista Calibrazione.',
          solution: 'Il valore ottimale dovrebbe essere vicino a 3.5 (il valore "vero" usato per generare i dati)'
        }
      ],
      solution: 'Il valore ottimale di RUE dovrebbe essere circa 3.5 g/MJ, che corrisponde al valore utilizzato per generare i dati sintetici. Il RMSE minimo dovrebbe essere circa 200 kg/ha (il rumore aggiunto).',
      completed: false
    },
    {
      id: 'ex2',
      title: 'Analisi di Sensibilità: Parametri Fenologici',
      description: 'Analizza come i parametri fenologici (Tbase, tuHAR) influenzano la durata del ciclo colturale.',
      difficulty: 'intermedio',
      module: 'Fenologia e Tempo Termico',
      objectives: [
        'Comprendere l\'effetto di Tbase sulla durata del ciclo',
        'Analizzare l\'impatto di tuHAR sulla maturazione',
        'Interpretare risultati di analisi di sensibilità'
      ],
      steps: [
        {
          description: 'Simula con Tbase=8°C e tuHAR=1400°C·d. Quanti giorni impiega la coltura a raggiungere la maturazione?',
          where: WHERE.fenologia,
          hint: 'Controlla il grafico NDS nella vista Fenologia'
        },
        {
          description: 'Ripeti la simulazione con Tbase=10°C (mantenendo tuHAR=1400). Come cambia la durata?',
          where: WHERE.fenologia,
          hint: 'Una Tbase più alta riduce l\'accumulo di gradi giorno'
        },
        {
          description: 'Ripeti con tuHAR=1600°C·d (mantenendo Tbase=8). Come cambia la durata?',
          where: WHERE.fenologia,
          hint: 'Un tuHAR più alto richiede più gradi giorno per maturare'
        },
        {
          description: 'Quale parametro ha maggiore impatto sulla durata del ciclo?',
          where: 'Stessa vista Fenologia: rifletti sui tre scenari appena impostati con gli slider.',
          solution: 'tuHAR ha generalmente un impatto maggiore, poiché determina direttamente il numero totale di gradi giorno necessari'
        }
      ],
      solution: 'tuHAR ha un impatto maggiore sulla durata del ciclo rispetto a Tbase. Un aumento di 200°C·d in tuHAR può prolungare il ciclo di 20-30 giorni, mentre un aumento di 2°C in Tbase può accorciarlo di 10-15 giorni, a seconda delle condizioni meteorologiche.',
      completed: false
    },
    {
      id: 'ex3',
      title: 'Effetto dello Stress Idrico sulla Produttività',
      description: 'Analizza come lo stress idrico (FTSW, WSFG, ARID) influisce sulla produzione di biomassa.',
      difficulty: 'intermedio',
      module: 'Bilancio Idrico del Suolo',
      objectives: [
        'Comprendere la relazione tra stress idrico e crescita',
        'Identificare le fasi critiche del ciclo',
        'Valutare l\'impatto sulla biomassa finale'
      ],
      steps: [
        {
          description: 'Simula uno scenario con precipitazioni normali (rain_mean=2 mm/d). Registra la biomassa finale.',
          where: `${WHERE.meteo} Poi ${WHERE.bilancioIdrico} per ARID/FTSW e ${WHERE.biomassa} per la biomassa finale.`,
          hint: 'Vista Bilancio Idrico: ARID e FTSW. Vista Biomassa: biomassa finale. Genera meteo prima.'
        },
        {
          description: 'Ripeti con precipitazioni ridotte (rain_mean=0.5 mm/d). Confronta ARID e biomassa finale.',
          where: `${WHERE.meteo} Quindi ${WHERE.bilancioIdrico} e ${WHERE.biomassa}.`,
          hint: 'Lo stress idrico aumenta quando le precipitazioni sono scarse'
        },
        {
          description: 'In quale fase fenologica lo stress idrico ha maggiore impatto? (emergenza, crescita, fioritura, maturazione)',
          where: 'Leggi NDS e LAI in Fenologia / LAI & Radiazione e collega alle curve FTSW in Bilancio Idrico.',
          solution: 'Generalmente la fase di crescita attiva (quando LAI è massimo) è più sensibile allo stress idrico'
        },
        {
          description: 'Calcola la riduzione percentuale della biomassa finale tra i due scenari.',
          where: 'Valore biomassa da Menu → Biomassa (ultimo punto o tabella esportazione se usi Esportazione Dati).',
          hint: 'Formula: ((Biomassa_normale - Biomassa_siccita) / Biomassa_normale) × 100'
        }
      ],
      solution: 'Lo stress idrico durante la fase di crescita attiva (quando LAI è massimo) ha il maggiore impatto sulla produttività. Una riduzione del 75% delle precipitazioni può causare una riduzione del 30-50% della biomassa finale, a seconda delle caratteristiche del suolo e della coltura.',
      completed: false
    },
    {
      id: 'ex4',
      title: 'Ottimizzazione del Coefficiente di Estinzione (KPAR)',
      description: 'Determina il valore ottimale di KPAR per massimizzare l\'intercettazione radiativa in una coltura di frumento.',
      difficulty: 'avanzato',
      module: 'Area Fogliare e Intercettazione Radiativa',
      objectives: [
        'Comprendere la legge di Beer-Lambert',
        'Analizzare l\'effetto di KPAR su FINT',
        'Ottimizzare KPAR per massimizzare l\'intercettazione'
      ],
      steps: [
        {
          description: 'Simula con KPAR=0.5 (tipico per frumento). Calcola FINT media durante la fase di crescita.',
          where: `${WHERE.panoramicaCrop} Scegli preset «Frumento (C3)». Poi ${WHERE.laiRad} Imposta KPAR=0,50.`,
          hint: 'FINT = 1 - exp(-KPAR × LAI). Vista LAI & Radiazione mostra LAI e FINT nel grafico'
        },
        {
          description: 'Varia KPAR tra 0.3 e 0.7 con step 0.05. Per ogni valore, calcola FINT media.',
          where: WHERE.laiRad,
          hint: 'KPAR più alto aumenta FINT ma può ridurre l\'efficienza per unità di LAI'
        },
        {
          description: 'Identifica il valore di KPAR che massimizza FINT media. È sempre il valore più alto?',
          where: 'Dati sempre dalla vista LAI & Radiazione (grafico FINT vs tempo o tabella se esporti).',
          solution: 'No, perché FINT è limitato a 1. Valori molto alti di KPAR possono portare a saturazione precoce'
        },
        {
          description: 'Considera anche l\'efficienza: quale KPAR massimizza FINT/LAI?',
          where: 'Usa i valori LAI e FINT dalla stessa vista al variare di KPAR (calcolo a mano o foglio).',
          hint: 'Questo rappresenta l\'efficienza di intercettazione per unità di area fogliare'
        }
      ],
      solution: 'Per il frumento, KPAR ottimale è tipicamente tra 0.5 e 0.6. Valori più alti aumentano FINT ma con rendimenti decrescenti. L\'efficienza FINT/LAI è massima per KPAR più bassi (0.4-0.5), ma FINT assoluta è massima per KPAR più alti (0.6-0.7). La scelta dipende dagli obiettivi: massimizzare intercettazione totale vs efficienza.',
      completed: false
    },
    {
      id: 'ex5a',
      title: 'Bilancio di Massa: Stato = Precedente + Ingressi - Uscite',
      description: 'Applica l\'equazione di bilancio di massa a diversi processi (acqua, biomassa, CTU).',
      difficulty: 'base',
      module: 'Concetti Fondamentali',
      objectives: [
        'Scrivere l\'equazione di bilancio per diversi serbatoi',
        'Identificare ingressi e uscite',
        'Applicare la logica al ciclo di simulazione'
      ],
      steps: [
        {
          description: 'Per il bilancio idrico: W(t+1) = W(t) + ? - ? - ? - ?. Completa con i termini mancanti.',
          where: 'Esercizio scritto; oppure confronta con Menu → Logica & Codice o Manuale Teoria.',
          solution: 'Pioggia, Ruscellamento, ET_reale, Drenaggio (o analoghi)'
        },
        {
          description: 'Per la biomassa: B(t+1) = B(t) + ?. Qual è il termine di flusso?',
          where: 'Esercizio scritto.',
          solution: 'Delta B (produzione giornaliera di biomassa)'
        },
        {
          description: 'Per CTU: CTU(t) = CTU(t-1) + ?. Quale flusso giornaliero?',
          where: 'Esercizio scritto.',
          solution: 'DTU (unità termiche giornaliere)'
        },
        {
          description: 'Nella vista Concetti Base, avvia il simulatore. Verifica che CTU[N] = CTU[N-1] + DTU[N] per un giorno a scelta.',
          where: `${WHERE.concetti} Card «Simulatore Interattivo» (confronto stato vs flusso).`,
          hint: 'Usa il confronto Stato vs Flusso nel simulatore'
        }
      ],
      solution: 'L\'equazione di bilancio Stato = Precedente + Ingressi - Uscite è universale. Per l\'acqua: ingressi = pioggia+irrigazione, uscite = ET+drenaggio+ruscellamento. Per biomassa: ingresso = produzione fotosintetica. Per CTU: ingresso = DTU.',
      completed: false
    },
    {
      id: 'ex5b',
      title: 'Funzione Expolinear: Parametri e Curve',
      description: 'Esplora come i parametri r_m, C_m e t_b influenzano la curva di crescita expolinear.',
      difficulty: 'base',
      module: 'Concetti Fondamentali',
      objectives: [
        'Comprendere il passaggio da fase esponenziale a lineare',
        'Identificare l\'effetto di r_m, C_m e t_b sulla curva',
        'Collegare i parametri alla fisiologia della coltura'
      ],
      steps: [
        {
          description: 'Nella vista Concetti Base, usa la demo Expolinear. Con r_m=0.1, C_m=20, t_b=20: a che giorno la curva inizia a diventare lineare?',
          where: `${WHERE.concetti} Card «Funzione Expolinear (Goudriaan e Monteith, 1990)» con slider r_m, C_m, t_b.`,
          hint: 'Osserva quando la pendenza (dW/dt) smette di aumentare e diventa costante'
        },
        {
          description: 'Raddoppia r_m (0.2). Come cambia la forma della curva?',
          where: WHERE.concetti,
          hint: 'r_m più alto accelera la transizione alla fase lineare'
        },
        {
          description: 'Aumenta t_b a 40. Cosa succede alla fase esponenziale?',
          where: WHERE.concetti,
          solution: 'La fase esponenziale si prolunga; la transizione alla fase lineare avviene più tardi'
        },
        {
          description: 'Quale parametro determina la pendenza della fase lineare?',
          where: 'Risposta concettuale (stessa demo Expolinear).',
          solution: 'C_m (tasso di crescita massimo) determina la pendenza della fase lineare'
        }
      ],
      solution: 'r_m controlla la velocità della transizione; C_m determina la pendenza della fase lineare (g/m² al giorno); t_b ritarda l\'inizio della fase lineare. In campo, C_m dipende dalla radiazione intercettata, r_m dalle caratteristiche della cultivar.',
      completed: false
    },
    {
      id: 'ex5c',
      title: 'Fillocrono e Sviluppo dei Nodi',
      description: 'Analizza come il Fillocrono (PHYL) influenza lo sviluppo del numero di nodi in modelli basati sull\'architettura.',
      difficulty: 'base',
      module: 'Fenologia',
      objectives: [
        'Comprendere l\'equazione INODE = INODE + DTU/PHYL',
        'Valutare l\'effetto di PHYL sul numero di nodi',
        'Collegare nodi e sviluppo fogliare'
      ],
      steps: [
        {
          description: 'Vai alla vista Fenologia. Genera meteo e osserva la demo Fillocrono. Con PHYL=50°C·d, quanti nodi ha la pianta al giorno 100?',
          where: `${WHERE.meteo} Poi ${WHERE.fenologia} Scheda demo Fillocrono con slider PHYL.`,
          hint: 'Usa la demo interattiva con lo slider PHYL'
        },
        {
          description: 'Riduci PHYL a 30. Come cambia il numero di nodi?',
          where: WHERE.fenologia,
          hint: 'PHYL più basso = più nodi per unità di tempo termico'
        },
        {
          description: 'Perché colture con fillocrono basso sviluppano più nodi a parità di gradi giorno?',
          where: 'Domanda teorica (stesso contesto Fenologia / fillocrono).',
          solution: 'PHYL rappresenta i °C·d necessari per ogni nuovo nodo; valori bassi significano che la pianta \"consuma\" meno gradi giorno per nodo'
        }
      ],
      solution: 'Il fillocrono (PHYL) è l\'intervallo termico tra nodi successivi. Piante con PHYL basso (es. leguminose) sviluppano nodi più rapidamente. La relazione PLA = PLACON·MSNN^PLAPOW lega i nodi all\'area fogliare.',
      completed: false
    },
    {
      id: 'ex5d',
      title: 'FTSW e Stress Idrico',
      description: 'Interpreta la Frazione di Acqua Traspirabile (FTSW) e il suo legame con l\'indice ARID.',
      difficulty: 'intermedio',
      module: 'Bilancio Idrico',
      objectives: [
        'Calcolare FTSW da W, W_wp, W_fc',
        'Interpretare soglie critiche di FTSW',
        'Collegare FTSW e ARID'
      ],
      steps: [
        {
          description: 'FTSW = (W - W_wp)/(W_fc - W_wp). Se W=120 mm, W_wp=80, W_fc=200: qual è FTSW?',
          where: 'Calcolo a mano; in app i valori W sono in Bilancio Idrico (grafici/tabella).',
          solution: 'FTSW = (120-80)/(200-80) = 40/120 = 0.33'
        },
        {
          description: 'A quale valore di FTSW si considera critico lo stress idrico per molte colture?',
          where: `Concetto teorico; le curve simulate sono in ${WHERE.bilancioIdrico}`,
          hint: 'Soglie tipiche: 0.2-0.3'
        },
        {
          description: 'Come si relaziona ARID con FTSW?',
          where: `Associazione tipica osservabile nei grafici di ${WHERE.bilancioIdrico}`,
          solution: 'ARID = 1 - T_act/ET0 riflette lo stress; quando FTSW è basso, T_act diminuisce e ARID aumenta'
        }
      ],
      solution: 'FTSW < 0.2-0.3 indica stress idrico significativo. ARID elevato coincide con FTSW bassa perché la pianta non riesce a soddisfare la domanda evapotraspirativa quando l\'acqua transpirabile è scarsa.',
      completed: false
    },
    {
      id: 'ex6',
      title: 'Funzioni di Risposta: tempfun e Forme',
      description: 'Esplora la vista Funzioni di Risposta e le diverse forme della risposta alla temperatura.',
      difficulty: 'base',
      module: 'Funzioni di Risposta',
      objectives: [
        'Conoscere la forma trapezoidale (default)',
        'Confrontare trapezoidale, triangolare e beta',
        'Interpretare le temperature cardinali'
      ],
      steps: [
        {
          description: 'Vai alla vista Funzioni di Risposta. Con TBD=8, TP1=18, TP2=28, TCD=40: a quale temperatura f(T) raggiunge 1?',
          where: `${WHERE.funzioniRisposta} Prima card sulla risposta alla temperatura: regola TBD, TP1, TP2, TCD e leggi il grafico f(T).`,
          hint: 'La forma trapezoidale è 1 tra TP1 e TP2'
        },
        {
          description: 'Passa alla forma triangolare. Come cambia la curva rispetto alla trapezoidale?',
          where: WHERE.funzioniRisposta,
          solution: 'La triangolare ha un singolo picco (Topt); non c\'è plateau, la curva scende subito dopo il massimo'
        },
        {
          description: 'Con la forma beta, a T=5°C (sotto TBD) qual è il valore di f(T)?',
          where: WHERE.funzioniRisposta,
          solution: 'f(T) = 0 per T ≤ TBD (nessuno sviluppo)'
        }
      ],
      solution: 'Le tre forme modellano diversamente la risposta alle temperature estreme. La trapezoidale è usata nel modello; la beta dà transizioni più morbide.',
      completed: false
    },
    {
      id: 'ex7',
      title: 'Runoff e Curve Number SCS',
      description: 'Analizza come il Curve Number influisce sul ruscellamento usando la vista Funzioni di Risposta e Bilancio Idrico.',
      difficulty: 'intermedio',
      module: 'Bilancio Idrico',
      objectives: [
        'Comprendere la formula SCS',
        'Relazionare CN con infiltrazione',
        'Interpretare l\'effetto della copertura vegetale'
      ],
      steps: [
        {
          description: 'Nella vista Funzioni di Risposta, sezione Runoff SCS: con CN=70 e pioggia 50 mm, quanto runoff si genera?',
          where: `${WHERE.funzioniRisposta} Card «Runoff – Metodo SCS Curve Number»: slider CN, lettura sul grafico Pioggia–Runoff.`,
          hint: 'Leggi il valore dal grafico interattivo'
        },
        {
          description: 'Aumenta CN a 90. Come cambia il runoff per la stessa pioggia?',
          where: WHERE.funzioniRisposta,
          solution: 'CN più alto = più runoff, meno infiltrazione (suolo meno permeabile o meno copertura)'
        },
        {
          description: 'Nella vista Bilancio Idrico, varia il Curve Number. Come influisce su W (contenuto idrico) e su ARID?',
          where: `${WHERE.bilancioIdrico} Slider «Curve Number (CN) SCS».`,
          hint: 'Più runoff = meno acqua che entra nel suolo = W più basso, ARID più alto'
        }
      ],
      solution: 'CN basso (50-60): suolo permeabile, buona copertura. CN alto (85-95): suolo nudo, argilloso. La formula S = 254(100/CN - 1) definisce la ritenzione massima.',
      completed: false
    },
    {
      id: 'ex8',
      title: 'Data di Semina e Durata del Ciclo',
      description: 'Analizza come la data di semina influisce sulla durata del ciclo colturale e sulla biomassa finale.',
      difficulty: 'base',
      module: 'Fenologia',
      objectives: [
        'Comprendere l\'effetto della stagione sulla fenologia',
        'Collegare semina precoce/tardiva con maturità',
        'Interpretare i gradi giorno accumulati'
      ],
      steps: [
        {
          description: 'Con preset Mais, imposta semina al giorno 1. Quanti giorni circa impiega a raggiungere NDS=1?',
          where: `${WHERE.panoramicaCrop} Seleziona «Mais (C4)» e imposta il giorno di semina a 1. Poi ${WHERE.fenologia} Leggi il giorno in cui il grafico NDS arriva a 1.`,
          hint: 'Vista Fenologia: osserva quando NDS raggiunge 1'
        },
        {
          description: 'Ripeti con semina al giorno 120 (fine aprile). La durata in giorni è la stessa?',
          where: `${WHERE.panoramicaCrop} Sposta solo «Data di Semina/Trapianto» a 120. Controlla di nuovo ${WHERE.fenologia}.`,
          solution: 'No: con semina tardiva le temperature sono più alte, quindi DTU/giorno è maggiore e il ciclo si completa in meno giorni solari'
        },
        {
          description: 'Quale dei due scenari produce più biomassa finale? Perché?',
          where: `${WHERE.biomassa} Confronta la biomassa finale tra le due configurazioni (stesso meteo).`,
          hint: 'Considera la radiazione disponibile durante il ciclo'
        }
      ],
      solution: 'La semina precoce espone a temperature più basse (DTU/giorno minore) ma ciclo più lungo. Semina tardiva: temperature alte, ciclo più corto. La biomassa dipende da LAI, radiazione intercettata e durata effettiva.',
      completed: false
    },
    {
      id: 'ex9',
      title: 'Interpretazione LAI e FINT',
      description: 'Collega la dinamica del LAI alla frazione di radiazione intercettata e alla produzione di biomassa.',
      difficulty: 'intermedio',
      module: 'LAI & Radiazione',
      objectives: [
        'Leggere LAI e FINT dai grafici',
        'Calcolare FINT da LAI e KPAR',
        'Identificare la fase di massima intercettazione'
      ],
      steps: [
        {
          description: 'Nella vista LAI & Radiazione: a che valore di LAI (approssimativo) FINT supera 0.9 con KPAR=0.6?',
          where: `${WHERE.laiRad} Imposta KPAR=0,60 e leggi LAI e FINT dai grafici (o valori prossimi al picco).`,
          hint: 'FINT = 1 - exp(-k·LAI). Per FINT=0.9: 0.9 = 1 - exp(-0.6·LAI) => LAI ≈ 3.8'
        },
        {
          description: 'In quale fase fenologica (NDS) il LAI è massimo?',
          where: `${WHERE.laiRad} Grafico LAI vs tempo; incrocia con NDS aprendo ${WHERE.fenologia} se serve.`,
          solution: 'Subito prima dell\'inizio della senescenza (frBLS), tipicamente NDS tra 0.6 e 0.7'
        },
        {
          description: 'Perché la biomassa giornaliera (dB) è massima quando FINT è alta ma LAI non ha ancora iniziato a senescere?',
          where: `Osservazione da ${WHERE.laiRad} e ${WHERE.biomassa} (andamento dB).`,
          solution: 'dB = PAR·FINT·RUE·... : FINT alta significa massima intercettazione; LAI ancora verde significa nessuna perdita di area fotosintetica'
        }
      ],
      solution: 'FINT segue una curva di saturazione: a LAI ~4-5 con k=0.6, FINT è vicina a 1. La produzione di biomassa è massima nella fase di LAI elevato e stabile.',
      completed: false
    },
    {
      id: 'ex10',
      title: 'Riduzione Radiazione (Agrivoltaico)',
      description: 'Simula l\'effetto dell\'ombreggiamento da pannelli fotovoltaici sulla produttività.',
      difficulty: 'intermedio',
      module: 'Riduzione Radiazione',
      objectives: [
        'Quantificare la riduzione di biomassa',
        'Confrontare stress idrico con/senza ombreggiamento',
        'Interpretare il trade-off radiazione-acqua'
      ],
      steps: [
        {
          description: 'Vai alla vista Riduzione Radiazione. Con 0% ombreggiamento, registra la biomassa finale.',
          where: `${WHERE.riduzioneRad} Card «Configurazione Impianto Agrivoltaico»: slider «Ombreggiamento (%)» a 0. Grafici Biomassa_Standard vs Biomassa_Agri nella stessa pagina.`,
          hint: 'Grafico Biomassa_Standard'
        },
        {
          description: 'Imposta 40% ombreggiamento. Di quanto si riduce la biomassa? E come cambia lo stress (ARID)?',
          where: `Sempre ${WHERE.riduzioneRad} Confronta i grafici; per ARID apri anche ${WHERE.bilancioIdrico}.`,
          solution: 'Biomassa si riduce ~30-50%; ARID spesso diminuisce (meno traspirazione, acqua dura di più)'
        },
        {
          description: 'Spiega perché sotto pannelli la coltura può avere meno stress idrico ma minore produttività.',
          where: 'Risposta argomentativa; dati numerici da Riduzione Radiazione + Bilancio Idrico.',
          solution: 'Meno radiazione = meno fotosintesi e crescita, ma anche meno calore e traspirazione. L\'acqua nel suolo si esaurisce più lentamente.'
        }
      ],
      solution: 'L\'agrivoltaico crea un disaccoppiamento sviluppo-crescita: la fenologia procede quasi normalmente (temperatura simile) ma la crescita è limitata dalla PAR ridotta. Lo stress idrico può diminuire.',
      completed: false
    },
    {
      id: 'ex11',
      title: 'Validazione: RMSE e R²',
      description: 'Interpreta le metriche di validazione nella vista Validazione.',
      difficulty: 'base',
      module: 'Calibrazione e Validazione',
      objectives: [
        'Comprendere RMSE e R²',
        'Interpretare nRMSE e bias',
        'Valutare la bontà di adattamento'
      ],
      steps: [
        {
          description: 'Vai alla vista Validazione. Con rumore σ=0, quali valori di R² e RMSE ottieni?',
          where: `${WHERE.validazione} Slider «Rumore Osservazioni» / «Livello di Rumore (σ)»: leggi RMSE e R² nelle card della pagina.`,
          hint: 'Senza rumore, simulato = osservato'
        },
        {
          description: 'Aumenta il rumore a σ=300. Come cambiano RMSE e R²?',
          where: WHERE.validazione,
          solution: 'RMSE aumenta (~300 kg/ha); R² diminuisce (maggiore scatter tra oss e sim)'
        },
        {
          description: 'Cosa indica un bias positivo? E uno negativo?',
          where: WHERE.validazione,
          solution: 'Bias > 0: il modello sovrastima sistematicamente. Bias < 0: sottostima.'
        }
      ],
      solution: 'R² vicino a 1 = ottimo adattamento. RMSE in unità della variabile (kg/ha). nRMSE < 10% = eccellente. Bias indica errore sistematico.',
      completed: false
    },
    {
      id: 'ex12',
      title: 'Soglia WSSG e Stress sulla Crescita',
      description: 'Analizza come la soglia FTSW (WSSG) influenza la riduzione di crescita sotto stress idrico.',
      difficulty: 'intermedio',
      module: 'Biomassa',
      objectives: [
        'Comprendere WSFG = FTSW/WSSG sotto soglia',
        'Valutare l\'effetto di WSSG su DDMP',
        'Interpretare la vista Funzioni di Risposta'
      ],
      steps: [
        {
          description: 'Nella vista Funzioni di Risposta, sezione FTSW→WSFG: con WSSG=0.25 e FTSW=0.20, qual è WSFG?',
          where: `${WHERE.funzioniRisposta} Card sulla relazione FTSW–WSFG: regola lo slider WSSG e leggi WSFG sul grafico o tabella.`,
          solution: 'WSFG = 0.20/0.25 = 0.8 (crescita ridotta al 80%)'
        },
        {
          description: 'Se WSSG=0.40 (soglia più alta), con FTSW=0.20 qual è WSFG?',
          where: WHERE.funzioniRisposta,
          solution: 'WSFG = 0.20/0.40 = 0.5 (crescita al 50%)'
        },
        {
          description: 'Colture con WSSG alto sono più o meno sensibili allo stress idrico?',
          where: `Risposta argomentativa; per cambiare WSSG nella simulazione: ${WHERE.biomassa} Slider «Soglia FTSW (WSSG)».`,
          solution: 'Più sensibili: iniziano a ridurre la crescita prima (a FTSW più alto)'
        }
      ],
      solution: 'WSSG basso (0.2): coltura tollerante, riduce crescita solo con FTSW molto bassa. WSSG alto (0.4): coltura sensibile, riduce crescita prima.',
      completed: false
    },
    {
      id: 'ex13',
      title: 'Fenologia Base: durata del ciclo',
      description: 'Confronta la durata del ciclo in due scenari termici semplici.',
      difficulty: 'base',
      module: 'Fenologia',
      objectives: [
        'Leggere il grafico NDS nel tempo',
        'Confrontare due scenari termici',
        'Capire come la temperatura influenza DTU'
      ],
      steps: [
        {
          description: 'Imposta Mais. Nel Generatore Meteo usa tmean=14°C e genera meteo. In Fenologia annota il giorno in cui NDS raggiunge 1.',
          where: `${WHERE.panoramicaCrop} Preset «Mais (C4)». Poi ${WHERE.meteo} Imposta Temperatura Media 14 °C e «Genera Meteo Sintetico». Infine ${WHERE.fenologia} Leggi il giorno con NDS=1.`,
          hint: 'NDS=1 indica fine ciclo fenologico'
        },
        {
          description: 'Ripeti con tmean=22°C mantenendo gli altri parametri uguali.',
          where: `${WHERE.meteo} Solo Temperatura Media → 22 °C, poi «Genera Meteo Sintetico»; ${WHERE.fenologia}.`,
          hint: 'Confronta il giorno di maturità tra i due scenari'
        },
        {
          description: 'Quale scenario conclude prima il ciclo? Spiega in una frase.',
          where: 'Confronto tra i due esperimenti usando i grafici in Fenologia.',
          solution: 'Con tmean più alta il ciclo si conclude prima, perché l\'accumulo termico giornaliero (DTU) è maggiore.'
        }
      ],
      solution: 'All\'aumentare della temperatura media, il modello accumula DTU più rapidamente e NDS raggiunge 1 in meno giorni solari.',
      completed: false
    },
    {
      id: 'ex14',
      title: 'LAI e saturazione della luce',
      description: 'Osserva quando la radiazione intercettata si avvicina al massimo.',
      difficulty: 'base',
      module: 'LAI & Radiazione',
      objectives: [
        'Leggere LAI e FINT dai grafici',
        'Riconoscere la saturazione della Beer-Lambert',
        'Interpretare perché oltre un certo LAI i guadagni sono ridotti'
      ],
      steps: [
        {
          description: 'Vai in LAI & Radiazione e osserva l\'andamento di FINT durante il ciclo.',
          where: WHERE.laiRad,
          hint: 'FINT cresce velocemente all\'inizio e poi rallenta'
        },
        {
          description: 'Individua il valore di LAI (approssimativo) per cui FINT supera 0.9.',
          where: WHERE.laiRad,
          solution: 'Con KPAR~0.6, FINT supera 0.9 intorno a LAI 3.5-4.5.'
        },
        {
          description: 'Spiega perché aumentare ancora LAI oltre quel valore ha effetto limitato su FINT.',
          where: 'Argomentazione teorica coerente con i grafici in LAI & Radiazione.',
          solution: 'La funzione è saturante: gran parte della luce è già intercettata, quindi i guadagni aggiuntivi diventano piccoli.'
        }
      ],
      solution: 'La relazione FINT-LAI segue una curva di saturazione: dopo LAI medio-alti, l\'intercettazione è quasi massima.',
      completed: false
    },
    {
      id: 'ex15',
      title: 'Stress idrico: impatto su FTSW e biomassa',
      description: 'Valuta l\'effetto di una riduzione della pioggia su acqua disponibile e crescita.',
      difficulty: 'intermedio',
      module: 'Bilancio Idrico',
      objectives: [
        'Confrontare due scenari di pioggia',
        'Interpretare FTSW e ARID',
        'Collegare stress idrico a biomassa finale'
      ],
      steps: [
        {
          description: 'Scenario A: rain_mean=2 mm/d. Genera meteo e registra FTSW medio e biomassa finale.',
          where: `${WHERE.meteo} Piovosità Media 2 mm/d → «Genera Meteo Sintetico». Poi ${WHERE.bilancioIdrico} e ${WHERE.biomassa}.`,
          hint: 'Usa Bilancio Idrico + Biomassa'
        },
        {
          description: 'Scenario B: rain_mean=0.5 mm/d. Rigenera meteo e confronta FTSW, ARID e biomassa.',
          where: `${WHERE.meteo} Piovosità 0,5 mm/d → «Genera Meteo Sintetico»; stesse viste ${WHERE.bilancioIdrico} e ${WHERE.biomassa}.`,
          hint: 'Con meno pioggia, aspettati più stress'
        },
        {
          description: 'Descrivi cosa accade quando FTSW scende sotto la soglia WSSG.',
          where: `Collega ai grafici ${WHERE.bilancioIdrico} e alla soglia WSSG in ${WHERE.biomassa}.`,
          solution: 'WSFG scende sotto 1 e la crescita giornaliera (dB) viene ridotta, con biomassa finale inferiore.'
        }
      ],
      solution: 'La riduzione della pioggia abbassa FTSW, aumenta ARID e riduce la biomassa finale via fattore di stress idrico.',
      completed: false
    },
    {
      id: 'ex16',
      title: 'Calibrazione guidata di RUE',
      description: 'Esegui una calibrazione semplice e interpreta il minimo RMSE.',
      difficulty: 'intermedio',
      module: 'Calibrazione e Validazione',
      objectives: [
        'Eseguire la procedura 1-2 della vista Calibrazione',
        'Identificare il parametro ottimale',
        'Comprendere l\'effetto del rumore sulla stima'
      ],
      steps: [
        {
          description: 'In Calibrazione imposta σ=120 e parametro RUE. Genera dati osservati e avvia la grid search.',
          where: `${WHERE.calibrazione} Seleziona RUE, rumore σ=120, pulsante «1. Genera Dati Osservati», poi avvio calibrazione come da istruzioni nella pagina.`,
          hint: 'Segui gli step guidati nella vista'
        },
        {
          description: 'Annota RUE calibrato e RMSE minimo. Confronta con il valore vero mostrato nella card.',
          where: WHERE.calibrazione,
          hint: 'Lo scostamento dovrebbe essere piccolo con rumore moderato'
        },
        {
          description: 'Aumenta il rumore a σ=300 e ripeti. Cosa osservi nel minimo RMSE?',
          where: WHERE.calibrazione,
          solution: 'Con più rumore la curva è meno netta e la stima del parametro è meno precisa.'
        }
      ],
      solution: 'La calibrazione recupera bene RUE con rumore basso/moderato; con rumore alto aumenta l\'incertezza e peggiora la precisione della stima.',
      completed: false
    },
    {
      id: 'ex17',
      title: 'Runoff SCS e produttività stagionale',
      description: 'Collega il Curve Number al ruscellamento e agli impatti sulla biomassa.',
      difficulty: 'intermedio',
      module: 'Bilancio Idrico',
      objectives: [
        'Interpretare l\'effetto del CN sul runoff',
        'Collegare infiltrazione e disponibilità idrica',
        'Valutare l\'impatto finale su biomassa'
      ],
      steps: [
        {
          description: 'Con meteo invariato, confronta due simulazioni con CN=65 e CN=90.',
          where: `${WHERE.bilancioIdrico} Slider Curve Number: esegui una volta CN=65, annota; poi CN=90 (non cambiare meteo).`,
          hint: 'CN alto implica maggiore runoff e minore infiltrazione'
        },
        {
          description: 'Annota differenze nel runoff giornaliero (RO) in alcuni giorni piovosi, in FTSW e in biomassa finale.',
          where: `${WHERE.bilancioIdrico} Tabella/giorni con pioggia; ${WHERE.biomassa} per biomassa finale.`,
          hint: 'Usa la tabella in Bilancio Idrico per RO e FTSW, e la vista Biomassa per il valore finale'
        },
        {
          description: 'Spiega il legame causa-effetto in massimo 4 righe.',
          where: 'Sintesi scritta; i dati numerici vengono dalle viste indicate sopra.',
          solution: 'CN elevato aumenta RO, riduce l\'acqua infiltrata nel profilo, abbassa FTSW e penalizza la crescita.'
        }
      ],
      solution: 'A parità di pioggia, CN più alto tende a ridurre la produttività perché limita il ricarico del suolo.',
      completed: false
    },
    {
      id: 'ex18',
      title: 'Data di semina: confronto multi-indicatore',
      description: 'Valuta l\'effetto della semina precoce vs tardiva su fenologia, acqua e biomassa.',
      difficulty: 'intermedio',
      module: 'Analisi Integrata',
      objectives: [
        'Confrontare due date di semina',
        'Integrare indicatori fenologici e idrici',
        'Argomentare una scelta gestionale'
      ],
      steps: [
        {
          description: 'Simula semina giorno 1 e giorno 120, mantenendo stesso meteo e cultivar.',
          where: `${WHERE.panoramicaCrop} Stesso preset coltura; modifica solo «Data di Semina/Trapianto» (1 poi 120). Meteo: ${WHERE.meteo}`,
          hint: 'Usa il selettore data di semina della coltura'
        },
        {
          description: 'Confronta: durata ciclo (giorni), ARID medio, biomassa finale.',
          where: `${WHERE.fenologia} per durata/NDS; ${WHERE.bilancioIdrico} per ARID; ${WHERE.biomassa} per biomassa.`,
          hint: 'Raccogli i risultati in una piccola tabella'
        },
        {
          description: 'Quale data sceglieresti e perché?',
          where: 'Valutazione personale basata sui numeri raccolti.',
          solution: 'Dipende dal compromesso: semina tardiva accelera il ciclo ma può ridurre biomassa; la scelta migliore minimizza stress e massimizza resa.'
        }
      ],
      solution: 'La data di semina modifica sincronizzazione con clima stagionale e quindi il bilancio sviluppo-crescita.',
      completed: false
    },
    {
      id: 'ex19',
      title: 'Agrivoltaico: trade-off radiazione-acqua',
      description: 'Analizza l\'effetto dell\'ombreggiamento su crescita e stress idrico.',
      difficulty: 'avanzato',
      module: 'Riduzione Radiazione',
      objectives: [
        'Valutare il trade-off produttività/stress',
        'Confrontare scenari di ombreggiamento',
        'Interpretare risultati in chiave gestionale'
      ],
      steps: [
        {
          description: 'Confronta 0%, 20% e 40% di ombreggiamento.',
          where: WHERE.riduzioneRad,
          hint: 'Vista Riduzione Radiazione'
        },
        {
          description: 'Per ogni scenario annota biomassa finale e un indicatore di stress idrico (ARID o FTSW medio).',
          where: `${WHERE.riduzioneRad} per biomassa; ${WHERE.bilancioIdrico} per ARID/FTSW.`,
          hint: 'Compila una tabella con 3 righe'
        },
        {
          description: 'Individua il livello di ombreggiamento più equilibrato per resa/stress.',
          where: 'Interpretazione dei tre scenari impostati in Riduzione Radiazione.',
          solution: 'Spesso un livello intermedio riduce lo stress senza penalizzare eccessivamente la biomassa.'
        }
      ],
      solution: 'L\'ombreggiamento riduce energia disponibile (meno crescita) ma può mitigare domanda evaporativa (meno stress).',
      completed: false
    },
    {
      id: 'ex20',
      title: 'Mini-progetto finale: calibra e valida',
      description: 'Esegui un flusso completo calibrazione-validazione e valuta l\'affidabilità del modello.',
      difficulty: 'avanzato',
      module: 'Calibrazione e Validazione',
      objectives: [
        'Applicare workflow completo (calibra -> valida)',
        'Interpretare RMSE, R², nRMSE e bias',
        'Scrivere una conclusione tecnico-scientifica'
      ],
      steps: [
        {
          description: 'In Calibrazione: genera osservazioni sintetiche e calibra RUE.',
          where: `${WHERE.calibrazione} Workflow completo come nelle card «Esercizio di Calibrazione».`,
          hint: 'Usa rumore moderato (σ=120-180)'
        },
        {
          description: 'In Validazione: usa stesso scenario e interpreta RMSE, R², nRMSE e bias.',
          where: WHERE.validazione,
          hint: 'Valuta anche la qualità (buono/scarso)'
        },
        {
          description: 'Ripeti aumentando il rumore e confronta le metriche.',
          where: `${WHERE.calibrazione} → poi ${WHERE.validazione} con σ più alto.`,
          hint: 'Con più rumore il fit peggiora'
        },
        {
          description: 'Scrivi una conclusione di 6-8 righe su robustezza e limiti del modello.',
          where: 'Elaborato scritto fuori dall\'app (quaderno o documento).',
          solution: 'Un modello può essere utile anche con errore non nullo, ma va interpretato con metriche e limiti del dataset.'
        }
      ],
      solution: 'La qualità del modello dipende da rumore dati, scelta parametri e coerenza del setup. Validazione e interpretazione critica sono indispensabili.',
      completed: false
    },
    {
      id: 'ex5',
      title: 'Confronto Varietà: Mais vs Frumento',
      description: 'Confronta le performance di mais (C4) e frumento (C3) in termini di produttività e uso dell\'acqua.',
      difficulty: 'avanzato',
      module: 'Analisi di Scenario',
      objectives: [
        'Confrontare fisiologia C3 vs C4',
        'Analizzare risposta allo stress idrico',
        'Valutare adattamento a condizioni diverse'
      ],
      steps: [
        {
          description: 'Simula mais (preset) con condizioni normali. Registra biomassa finale e ARID medio.',
          where: `${WHERE.panoramicaCrop} «Mais (C4)». Meteo predefinito o ${WHERE.meteo} con pioggia «normale». Poi ${WHERE.biomassa} e ${WHERE.bilancioIdrico}.`,
          hint: 'Usa i preset nella vista Panoramica e confronta i risultati'
        },
        {
          description: 'Ripeti per frumento nelle stesse condizioni. Confronta biomassa finale.',
          where: `${WHERE.panoramicaCrop} Passa a «Frumento (C3)» senza cambiare meteo; ${WHERE.biomassa}.`,
          hint: 'Il mais (C4) ha generalmente RUE più alta'
        },
        {
          description: 'Confronta i valori di ARID tra le due colture: quale mostra meno stress a parità di scenario?',
          where: WHERE.bilancioIdrico,
          hint: 'ARID più basso indica minore stress idrico'
        },
        {
          description: 'Ripeti in condizioni di stress idrico (rain_mean=0.5). Quale coltura è più resiliente?',
          where: `${WHERE.meteo} Piovosità 0,5 mm/d → «Genera Meteo Sintetico». Poi ${WHERE.panoramicaCrop} per selezionare mais o frumento e ${WHERE.biomassa}.`,
          solution: 'Il mais (C4) ha generalmente maggiore efficienza idrica e resilienza allo stress, grazie alla fotosintesi C4 che riduce la traspirazione'
        }
      ],
      solution: 'Il mais (C4) mostra generalmente: 1) Biomassa finale più alta (RUE ~3.8 vs ~2.2 per frumento), 2) ARID mediamente più basso a parità di condizioni, 3) maggiore resilienza allo stress idrico. Il frumento (C3) è spesso più sensibile in scenari siccitosi.',
      completed: false
    }
  ];

  const recommendedPath = [
    'ex13', 'ex14', 'ex15', 'ex16', // blocco 2 ore
    'ex17', 'ex18', 'ex19', 'ex20', // estensione progressiva
    'ex1', 'ex2', 'ex3', 'ex8', 'ex9', 'ex12',
    'ex7', 'ex10', 'ex11', 'ex4', 'ex5a', 'ex5b', 'ex5c', 'ex5d', 'ex5', 'ex6'
  ];

  const pathOrder = new Map(recommendedPath.map((id, idx) => [id, idx]));
  const orderedExercises = [...exercises].sort((a, b) => {
    const ai = pathOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bi = pathOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'base': return 'bg-green-100 text-green-800 border-green-300';
      case 'intermedio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'avanzato': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getObjectiveSummary = (exercise: Exercise): string => {
    if (exercise.objectives.length === 0) return 'Consolidare la comprensione del modulo attraverso applicazioni pratiche.';
    if (exercise.objectives.length === 1) return exercise.objectives[0];
    return `${exercise.objectives[0]}; ${exercise.objectives[1].charAt(0).toLowerCase()}${exercise.objectives[1].slice(1)}.`;
  };

  const getImplicationsAndUtility = (exercise: Exercise): string => {
    const module = exercise.module.toLowerCase();

    if (module.includes('fenologia')) {
      return 'Permette di capire come temperatura e data di semina modificano il calendario colturale, utile per pianificare semina, gestione e raccolta.';
    }
    if (module.includes('lai') || module.includes('radiazione')) {
      return 'Chiarisce come l\'architettura fogliare controlla l\'intercettazione della luce e quindi la crescita, utile per leggere differenze tra cultivar e pratiche agronomiche.';
    }
    if (module.includes('idrico') || module.includes('acqua')) {
      return 'Mostra come disponibilita idrica, runoff e stress si trasformano in perdita di crescita, utile per decisioni su suolo, irrigazione e rischio siccita.';
    }
    if (module.includes('calibrazione') || module.includes('validazione')) {
      return 'Allena alla stima dei parametri e alla lettura critica delle metriche, utile per valutare l\'affidabilita del modello prima di usarlo in scenari reali.';
    }
    if (module.includes('biomassa')) {
      return 'Evidenzia i fattori che limitano l\'accumulo produttivo, utile per interpretare differenze di resa e sensibilita agli stress.';
    }
    if (module.includes('scenario') || module.includes('integrata')) {
      return 'Allena al confronto multi-scenario e multi-indicatore, utile per scegliere strategie gestionali motivate da dati simulati.';
    }
    if (module.includes('concetti fondamentali')) {
      return 'Rinforza la logica modello-variabili-flussi, utile per evitare errori di interpretazione nelle fasi avanzate del corso.';
    }
    if (module.includes('funzioni di risposta')) {
      return 'Aiuta a leggere le funzioni che trasformano input in fattori di crescita/stress, utile per capire perche il modello risponde in modo non lineare.';
    }
    if (module.includes('riduzione radiazione')) {
      return 'Quantifica il trade-off tra minore luce e minore stress evaporativo, utile per valutare soluzioni agrivoltaiche.';
    }

    return 'Rende operativi i concetti teorici del modulo con evidenze numeriche, utile per sviluppare capacita di analisi e decisione basata su simulazioni.';
  };

  const getWhyImportant = (exercise: Exercise): string => {
    const module = exercise.module.toLowerCase();
    if (module.includes('fenologia')) {
      return 'Perche la tempistica del ciclo condiziona tutte le scelte agronomiche (epoca di semina, gestione e raccolta).';
    }
    if (module.includes('idrico') || module.includes('acqua')) {
      return 'Perche lo stress idrico e una delle principali cause di perdita di resa e deve essere anticipato con indicatori leggibili.';
    }
    if (module.includes('calibrazione') || module.includes('validazione')) {
      return 'Perche un modello non calibrato/validato puo portare a decisioni non affidabili.';
    }
    if (module.includes('lai') || module.includes('radiazione')) {
      return 'Perche l\'intercettazione della luce governa gran parte del potenziale produttivo della coltura.';
    }
    return 'Perche collega teoria e pratica, trasformando concetti in decisioni supportate dai risultati di simulazione.';
  };

  const getWhereUsed = (exercise: Exercise): string => {
    const module = exercise.module.toLowerCase();
    if (module.includes('fenologia')) {
      return 'Nella pianificazione del calendario colturale e nella scelta della data di semina.';
    }
    if (module.includes('idrico') || module.includes('acqua')) {
      return 'Nella gestione irrigua, nella valutazione del rischio siccita e nella scelta di pratiche conservative.';
    }
    if (module.includes('calibrazione') || module.includes('validazione')) {
      return 'Nella taratura di parametri di cultivar/sito e nella verifica della qualita del modello.';
    }
    if (module.includes('scenario') || module.includes('riduzione radiazione')) {
      return 'Nelle analisi di scenario per confrontare alternative gestionali e climatiche.';
    }
    return 'Nelle attivita di analisi dati e supporto alle decisioni agronomiche basate su simulazione.';
  };

  const handleAnswerChange = (exerciseId: string, stepIndex: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [stepIndex]: answer
      }
    }));
  };

  const toggleSolution = (exerciseId: string) => {
    setShowSolution(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  return (
    <div className="space-y-6">
      <Card title="Esercizi Pratici - Modellistica delle Colture Erbacee">
        <p className="text-gray-700 mb-4">
          Questa sezione contiene esercizi pratici organizzati per difficoltà e modulo didattico.
          Completa gli esercizi per consolidare la comprensione dei concetti teorici.
        </p>
        <p className="text-sm text-gray-600 mb-4 p-3 bg-slate-100 rounded-lg border border-slate-200">
          <strong>Come orientarsi:</strong> ogni passo che richiede l&apos;app include la riga «Dove nell&apos;app»
          (icona puntina): indica la voce del menu laterale e il controllo da usare (preset coltura, slider, pulsanti).
          La <em>coltura</em> (es. Mais) si imposta sempre in <strong>Panoramica</strong> con «Seleziona Coltura (Preset)»;
          la <em>data di semina</em> è il cursore «Data di Semina/Trapianto» nella stessa pagina.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">
              {exercises.filter(e => e.difficulty === 'base').length}
            </div>
            <div className="text-sm text-blue-600">Esercizi Base</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">
              {exercises.filter(e => e.difficulty === 'intermedio').length}
            </div>
            <div className="text-sm text-yellow-600">Esercizi Intermedi</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">
              {exercises.filter(e => e.difficulty === 'avanzato').length}
            </div>
            <div className="text-sm text-red-600">Esercizi Avanzati</div>
          </div>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-2">Percorso Logico Ottimizzato</h4>
          <p className="text-sm text-indigo-800 mb-2">
            Segui l'ordine consigliato mostrato in questa pagina. I primi 4 esercizi (`ex13`-`ex16`) sono il blocco base da 2 ore.
          </p>
          <div className="text-xs text-indigo-700 space-y-1">
              <div><strong>Fase 1 - Fondamenti:</strong> ex13 -&gt; ex14 -&gt; ex15 -&gt; ex16</div>
              <div><strong>Fase 2 - Integrazione:</strong> ex17 -&gt; ex18 -&gt; ex19 -&gt; ex20</div>
            <div><strong>Fase 3 - Approfondimenti:</strong> esercizi rimanenti in ordine crescente di complessita</div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {orderedExercises.map((exercise, idx) => (
          <Card 
            key={exercise.id}
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded text-xs font-semibold border bg-indigo-100 text-indigo-800 border-indigo-300">
                    Step {idx + 1}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold border ${getDifficultyColor(exercise.difficulty)}`}>
                    {exercise.difficulty.toUpperCase()}
                  </span>
                  <span>{exercise.title}</span>
                </div>
                {exercise.completed && (
                  <CheckCircle className="text-green-600" size={20} />
                )}
              </div>
            }
          >
            <div className="space-y-4">
              <div>
                <p className="text-gray-700 mb-2">{exercise.description}</p>
                <div className="text-sm text-gray-600">
                  <strong>Modulo:</strong> {exercise.module}
                </div>
              </div>

              <div className="bg-violet-50 p-4 rounded-lg border border-violet-200">
                <h4 className="font-semibold text-violet-900 mb-2">Contesto Didattico</h4>
                <div className="space-y-2 text-sm text-violet-800">
                  <p>
                    <strong>Cosa impari:</strong> {getObjectiveSummary(exercise)}
                  </p>
                  <p>
                    <strong>Perche e importante:</strong> {getWhyImportant(exercise)}
                  </p>
                  <p>
                    <strong>Dove lo usi in pratica:</strong> {getWhereUsed(exercise)}
                  </p>
                  <p>
                    <strong>Implicazioni operative:</strong> {getImplicationsAndUtility(exercise)}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Obiettivi di Apprendimento</h4>
                </div>
                <ul className="space-y-1">
                  {exercise.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                      <ArrowRight size={12} className="mt-1 flex-shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Procedura Step-by-Step</h4>
                {exercise.steps.map((step, index) => (
                  <div key={index} className="border-l-4 border-brand-500 pl-4 py-2 bg-gray-50 rounded-r">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="font-bold text-brand-700">Step {index + 1}:</span>
                      <span className="text-gray-700 flex-1">{step.description}</span>
                    </div>
                    {step.where && (
                      <div className="mt-2 flex items-start gap-2 text-sm bg-slate-100 border border-slate-200 p-2 rounded-md">
                        <MapPin size={16} className="mt-0.5 flex-shrink-0 text-slate-600" aria-hidden />
                        <span className="text-slate-800">
                          <span className="font-semibold text-slate-900">Dove nell&apos;app: </span>
                          {step.where}
                        </span>
                      </div>
                    )}
                    {step.hint && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                        <Lightbulb size={14} className="mt-0.5 flex-shrink-0 text-yellow-600" />
                        <span><strong>Suggerimento:</strong> {step.hint}</span>
                      </div>
                    )}
                    {step.solution && (
                      <div className="mt-2">
                        <textarea
                          placeholder="Inserisci la tua risposta qui..."
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          rows={2}
                          value={userAnswers[exercise.id]?.[index] || ''}
                          onChange={(e) => handleAnswerChange(exercise.id, index, e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  onClick={() => toggleSolution(exercise.id)}
                  variant="outline"
                  className="text-sm"
                >
                  {showSolution[exercise.id] ? 'Nascondi' : 'Mostra'} Soluzione
                </Button>
                <Button
                  onClick={() => {
                    // Mark as completed
                    console.log(`Exercise ${exercise.id} completed`);
                  }}
                  variant="primary"
                  className="text-sm"
                >
                  <CheckCircle size={16} />
                  Segna come Completato
                </Button>
              </div>

              {showSolution[exercise.id] && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={18} />
                    <h5 className="font-semibold text-green-900">Soluzione</h5>
                  </div>
                  <p className="text-green-800 text-sm">{exercise.solution}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

