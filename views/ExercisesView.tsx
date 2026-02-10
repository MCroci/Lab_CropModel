import React, { useState } from 'react';
import { Card, Button, Slider } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { CheckCircle, Lightbulb, Target, ArrowRight } from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'base' | 'intermedio' | 'avanzato';
  module: string;
  objectives: string[];
  steps: {
    description: string;
    hint?: string;
    solution?: string;
  }[];
  solution: string;
  completed: boolean;
}

const RHO_S = 2650; // kg/m³ densità particelle
const RHO_L = 1000; // kg/m³ densità acqua

const PorosityCalculator: React.FC = () => {
  const [rhoB, setRhoB] = useState(1200);
  const [w, setW] = useState(0.20);
  const [hPrism, setHPrism] = useState(2);
  const phi = 1 - rhoB / RHO_S;
  const theta = w * (rhoB / RHO_L);
  const hW = theta * hPrism * 1000; // mm
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-amber-900 mb-3">Calcolatore interattivo: Porosità e Acqua nel Pedon</h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Slider label="ρ_b (kg/m³)" value={rhoB} min={800} max={1800} step={50} onChange={setRhoB} description="Densità apparente" />
        <Slider label="w (gravimetrico)" value={w} min={0.05} max={0.45} step={0.01} onChange={setW} description="0-1" />
        <Slider label="h_prism (m)" value={hPrism} min={0.5} max={3} step={0.1} onChange={setHPrism} description="Profondità prisma" />
      </div>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="bg-white p-2 rounded border border-amber-200">
          <div className="text-amber-700 font-medium">φ (porosità)</div>
          <div className="text-lg font-bold text-amber-900">{(phi * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-white p-2 rounded border border-amber-200">
          <div className="text-amber-700 font-medium">θ (volumetrico)</div>
          <div className="text-lg font-bold text-amber-900">{(theta * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-white p-2 rounded border border-amber-200">
          <div className="text-amber-700 font-medium">h_w (mm)</div>
          <div className="text-lg font-bold text-amber-900">{hW.toFixed(0)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-amber-200 col-span-2 sm:col-span-1">
          <div className="text-amber-700 font-medium">Aria (φ-θ)</div>
          <div className="text-lg font-bold text-amber-900">{((phi - theta) * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

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
          description: 'Genera dati osservati sintetici: esegui una simulazione con RUE=3.5 e aggiungi rumore gaussiano (σ=200 kg/ha)',
          hint: 'Usa la vista Calibrazione per generare osservazioni sintetiche'
        },
        {
          description: 'Esegui calibrazione variando RUE tra 2.0 e 5.0 con step 0.2',
          hint: 'Nella vista Calibrazione, seleziona RUE come parametro da calibrare'
        },
        {
          description: 'Identifica il valore di RUE che minimizza il RMSE',
          hint: 'Cerca il punto più basso nel grafico RMSE vs RUE'
        },
        {
          description: 'Quale valore di RUE hai trovato? (approssima a 1 decimale)',
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
          hint: 'Controlla il grafico NDS nella vista Fenologia'
        },
        {
          description: 'Ripeti la simulazione con Tbase=10°C (mantenendo tuHAR=1400). Come cambia la durata?',
          hint: 'Una Tbase più alta riduce l\'accumulo di gradi giorno'
        },
        {
          description: 'Ripeti con tuHAR=1600°C·d (mantenendo Tbase=8). Come cambia la durata?',
          hint: 'Un tuHAR più alto richiede più gradi giorno per maturare'
        },
        {
          description: 'Quale parametro ha maggiore impatto sulla durata del ciclo?',
          solution: 'tuHAR ha generalmente un impatto maggiore, poiché determina direttamente il numero totale di gradi giorno necessari'
        }
      ],
      solution: 'tuHAR ha un impatto maggiore sulla durata del ciclo rispetto a Tbase. Un aumento di 200°C·d in tuHAR può prolungare il ciclo di 20-30 giorni, mentre un aumento di 2°C in Tbase può accorciarlo di 10-15 giorni, a seconda delle condizioni meteorologiche.',
      completed: false
    },
    {
      id: 'ex3',
      title: 'Effetto dello Stress Idrico sulla Produttività',
      description: 'Analizza come lo stress idrico influisce sulla produzione di biomassa attraverso l\'indice ARID.',
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
          hint: 'Usa la vista Bilancio Idrico per vedere ARID e la vista Biomassa per la biomassa finale'
        },
        {
          description: 'Ripeti con precipitazioni ridotte (rain_mean=0.5 mm/d). Confronta ARID e biomassa finale.',
          hint: 'Lo stress idrico aumenta quando le precipitazioni sono scarse'
        },
        {
          description: 'In quale fase fenologica lo stress idrico ha maggiore impatto? (emergenza, crescita, fioritura, maturazione)',
          solution: 'Generalmente la fase di crescita attiva (quando LAI è massimo) è più sensibile allo stress idrico'
        },
        {
          description: 'Calcola la riduzione percentuale della biomassa finale tra i due scenari.',
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
          hint: 'FINT = 1 - exp(-KPAR × LAI). Usa la vista LAI per vedere FINT'
        },
        {
          description: 'Varia KPAR tra 0.3 e 0.7 con step 0.05. Per ogni valore, calcola FINT media.',
          hint: 'KPAR più alto aumenta FINT ma può ridurre l\'efficienza per unità di LAI'
        },
        {
          description: 'Identifica il valore di KPAR che massimizza FINT media. È sempre il valore più alto?',
          solution: 'No, perché FINT è limitato a 1. Valori molto alti di KPAR possono portare a saturazione precoce'
        },
        {
          description: 'Considera anche l\'efficienza: quale KPAR massimizza FINT/LAI?',
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
          solution: 'Pioggia, Ruscellamento, ET_reale, Drenaggio (o analoghi)'
        },
        {
          description: 'Per la biomassa: B(t+1) = B(t) + ?. Qual è il termine di flusso?',
          solution: 'Delta B (produzione giornaliera di biomassa)'
        },
        {
          description: 'Per CTU: CTU(t) = CTU(t-1) + ?. Quale flusso giornaliero?',
          solution: 'DTU (unità termiche giornaliere)'
        },
        {
          description: 'Nella vista Concetti Base, avvia il simulatore. Verifica che CTU[N] = CTU[N-1] + DTU[N] per un giorno a scelta.',
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
          hint: 'Osserva quando la pendenza (dW/dt) smette di aumentare e diventa costante'
        },
        {
          description: 'Raddoppia r_m (0.2). Come cambia la forma della curva?',
          hint: 'r_m più alto accelera la transizione alla fase lineare'
        },
        {
          description: 'Aumenta t_b a 40. Cosa succede alla fase esponenziale?',
          solution: 'La fase esponenziale si prolunga; la transizione alla fase lineare avviene più tardi'
        },
        {
          description: 'Quale parametro determina la pendenza della fase lineare?',
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
          hint: 'Usa la demo interattiva con lo slider PHYL'
        },
        {
          description: 'Riduci PHYL a 30. Come cambia il numero di nodi?',
          hint: 'PHYL più basso = più nodi per unità di tempo termico'
        },
        {
          description: 'Perché colture con fillocrono basso sviluppano più nodi a parità di gradi giorno?',
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
          solution: 'FTSW = (120-80)/(200-80) = 40/120 = 0.33'
        },
        {
          description: 'A quale valore di FTSW si considera critico lo stress idrico per molte colture?',
          hint: 'Soglie tipiche: 0.2-0.3'
        },
        {
          description: 'Come si relaziona ARID con FTSW?',
          solution: 'ARID = 1 - T_act/ET0 riflette lo stress; quando FTSW è basso, T_act diminuisce e ARID aumenta'
        }
      ],
      solution: 'FTSW < 0.2-0.3 indica stress idrico significativo. ARID elevato coincide con FTSW bassa perché la pianta non riesce a soddisfare la domanda evapotraspirativa quando l\'acqua transpirabile è scarsa.',
      completed: false
    },
    {
      id: 'ex6a',
      title: 'Analisi della Macroporosità negli Aggregati tramite Box Counting',
      description: 'La struttura del suolo e la presenza di macropori sono fondamentali per la crescita delle radici e per il drenaggio. La teoria è spiegata nella sezione Suolo e Aggregati. Questo esercizio modella la geometria dei pori tra gli aggregati (peds) usando la dimensione frattale.',
      difficulty: 'avanzato',
      module: 'Fisica del Suolo',
      objectives: [
        'Utilizzare la tecnica del box counting per determinare la dimensione frattale (D)',
        'Identificare la frazione di superficie occupata dai pori',
        'Collegare la lavorazione del terreno alla porosità'
      ],
      steps: [
        {
          description: 'Caricare un\'immagine di una sezione di suolo (es. soil_image.jpg) e impostare una soglia RGB (es. 128) per distinguere i pori (chiari) dalla matrice solida (scura).',
          hint: 'Vedi sezione Suolo e Aggregati per la teoria. Soglie tipiche: valori > soglia = pori, < soglia = solido'
        },
        {
          description: 'Calcolare come varia il numero di "box" occupati dai pori al diminuire della dimensione del box (L). La relazione N(L) ∝ L^(-D) fornisce la dimensione frattale D.',
          hint: 'D = -log(N2/N1) / log(L2/L1) per due scale L1, L2'
        },
        {
          description: 'Se una lavorazione del terreno (es. aratura) frammenta i macro-aggregati aumentando la dimensione frattale dei pori, come cambierà la percentuale di porosità totale?',
          solution: 'La frammentazione aumenta la complessità della rete di pori (D più alto) e tipicamente aumenta la porosità totale accessibile alle scale di misura, migliorando drenaggio e aerazione ma anche rischio di compattazione successiva.'
        }
      ],
      solution: 'Il box counting stima D dalla pendenza di log(N) vs log(1/L). Un suolo lavorato di fresco ha aggregati più piccoli e una rete di pori più ramificata (D più alto). La porosità totale calcolata aumenta perché si "vedono" più pori alle scale fini.',
      completed: false
    },
    {
      id: 'ex6b',
      title: 'Modellizzazione del "Bundle of Capillaries" (Fascio di Capillari)',
      description: 'Per simulare come l\'acqua viene trattenuta e resa disponibile per le colture, il suolo viene modellato come un insieme di tubi capillari con raggi distribuiti casualmente. Vedi la sezione Suolo e Aggregati per la teoria.',
      difficulty: 'avanzato',
      module: 'Fisica del Suolo',
      objectives: [
        'Generare un modello stocastico di pori capillari',
        'Rappresentare la rete idraulica di un aggregato di suolo',
        'Modificare il modello per suoli compattati'
      ],
      steps: [
        {
          description: 'Generare n=250 capillari con raggi (r) e posizioni (x,z) casuali. Implementare un controllo per evitare sovrapposizioni e mantenere i capillari entro un raggio definito (aggregato cilindrico o prismatico).',
          hint: 'Vedi sezione Suolo e Aggregati per la teoria. Verifica distanza tra centri: sqrt((x1-x2)²+(z1-z2)²) > r1+r2'
        },
        {
          description: 'Visualizzare la distribuzione (es. con VPython: visual.cylinder per ogni poro).',
          hint: 'Ogni capillare è un cilindro con raggio r e altezza dell\'aggregato'
        },
        {
          description: 'In un suolo compattato da macchinari agricoli, i raggi dei pori più grandi vengono ridotti. Come modificare la generazione dei raggi per riflettere una riduzione della macroporosità?',
          solution: 'Usare una distribuzione dei raggi più "stretta" (es. solo raggi piccoli) o una distribuzione troncata: r_max ridotto, oppure una distribuzione log-normale con media più bassa. La macroporosità (pori > 75 μm) diminuisce drasticamente.'
        }
      ],
      solution: 'Nel modello a fascio di capillari, la compattazione si simula riducendo la variabilità e il massimo dei raggi. La legge di Jurin (h ∝ 1/r) mostra che i capillari più piccoli trattengono acqua a tensioni più alte; un suolo compattato ha meno macropori e più ritenzione idrica ma minore drenaggio.',
      completed: false
    },
    {
      id: 'ex6c',
      title: 'Porosità e Indice dei Vuoti in un Prisma di Suolo (Pedon)',
      description: 'La densità apparente (ρ_b) è un indicatore chiave della salute del suolo. Suoli lavorati di fresco hanno densità basse; suoli compattati ostacolano lo sviluppo radicale. Usa il calcolatore nella sezione Suolo e Aggregati per verificare i risultati.',
      difficulty: 'intermedio',
      module: 'Fisica del Suolo',
      objectives: [
        'Calcolare porosità totale, contenuto d\'acqua volumetrico e altezza equivalente',
        'Confrontare suolo tilled vs compattato',
        'Determinare l\'acqua disponibile per l\'irrigazione'
      ],
      steps: [
        {
          description: 'Definire ρ_s = 2650 kg/m³ (densità particelle) e ρ_l = 1000 kg/m³ (acqua). Scrivere computePorosity(ρ_b, w) che calcola: φ = 1 - (ρ_b/ρ_s), θ = w·(ρ_b/ρ_l), h_w = θ·h_prism.',
          hint: 'Usa il calcolatore nella sezione Suolo e Aggregati. φ = porosità totale; θ = contenuto volumetrico; h_prism = profondità del prisma (es. 2 m)'
        },
        {
          description: 'Esempio: suolo tilled ρ_b = 1000 kg/m³, suolo compattato ρ_b = 1600 kg/m³. Calcola la differenza nella porosità totale disponibile per lo scambio gassoso.',
          solution: 'φ_tilled = 1 - 1000/2650 = 0.62; φ_compattato = 1 - 1600/2650 = 0.40. Differenza = 0.22 (22% in meno di spazio per aria/acqua nel suolo compattato).'
        },
        {
          description: 'Per un prisma di 2 m, w = 0.20 (20% gravimetrico) e ρ_b = 1200 kg/m³: qual è l\'altezza equivalente dell\'acqua (h_w)?',
          solution: 'θ = 0.20·(1200/1000) = 0.24; h_w = 0.24·2 = 0.48 m = 480 mm'
        }
      ],
      solution: 'φ = 1 - ρ_b/ρ_s indica lo spazio totale per fluidi. θ = w·(ρ_b/ρ_l) converte il contenuto gravimetrico in volumetrico. h_w (mm) è utile per il bilancio idrico e l\'irrigazione. Suoli compattati hanno φ più bassa e minore aerazione radicale.',
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
        'Analizzare efficienza idrica',
        'Valutare adattamento a condizioni diverse'
      ],
      steps: [
        {
          description: 'Simula mais (preset) con condizioni normali. Registra biomassa finale e ET cumulativa.',
          hint: 'Usa i preset nella vista Panoramica e confronta i risultati'
        },
        {
          description: 'Ripeti per frumento nelle stesse condizioni. Confronta biomassa finale.',
          hint: 'Il mais (C4) ha generalmente RUE più alta'
        },
        {
          description: 'Calcola l\'efficienza idrica (biomassa/ET) per entrambe le colture.',
          hint: 'Efficienza idrica = Biomassa finale (kg/ha) / ET cumulativa (mm)'
        },
        {
          description: 'Ripeti in condizioni di stress idrico (rain_mean=0.5). Quale coltura è più resiliente?',
          solution: 'Il mais (C4) ha generalmente maggiore efficienza idrica e resilienza allo stress, grazie alla fotosintesi C4 che riduce la traspirazione'
        }
      ],
      solution: 'Il mais (C4) mostra generalmente: 1) Biomassa finale più alta (RUE ~3.8 vs ~2.2 per frumento), 2) Efficienza idrica superiore (fotosintesi C4 più efficiente), 3) Maggiore resilienza allo stress idrico. Il frumento (C3) ha ciclo più lungo e può accumulare biomassa in condizioni ottimali, ma è più sensibile allo stress idrico.',
      completed: false
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'base': return 'bg-green-100 text-green-800 border-green-300';
      case 'intermedio': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'avanzato': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      </Card>

      <div className="space-y-4">
        {exercises.map((exercise) => (
          <Card 
            key={exercise.id}
            title={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
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

              {exercise.id === 'ex6c' && <PorosityCalculator />}

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Procedura Step-by-Step</h4>
                {exercise.steps.map((step, index) => (
                  <div key={index} className="border-l-4 border-brand-500 pl-4 py-2 bg-gray-50 rounded-r">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="font-bold text-brand-700">Step {index + 1}:</span>
                      <span className="text-gray-700 flex-1">{step.description}</span>
                    </div>
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

