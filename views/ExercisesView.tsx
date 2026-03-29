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
          hint: 'Vai alla vista Calibrazione (menu Analisi e Validazione), clicca "Genera Osservazioni Sintetiche"'
        },
        {
          description: 'Esegui calibrazione variando RUE (grid search). Seleziona RUE come parametro da calibrare.',
          hint: 'Nella vista Calibrazione, scegli RUE dal menu, poi clicca "Esegui Calibrazione"'
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
          hint: 'Vista Bilancio Idrico: ARID e FTSW. Vista Biomassa: biomassa finale. Genera meteo prima.'
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
          hint: 'FINT = 1 - exp(-KPAR × LAI). Vista LAI & Radiazione mostra LAI e FINT nel grafico'
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
          hint: 'La forma trapezoidale è 1 tra TP1 e TP2'
        },
        {
          description: 'Passa alla forma triangolare. Come cambia la curva rispetto alla trapezoidale?',
          solution: 'La triangolare ha un singolo picco (Topt); non c\'è plateau, la curva scende subito dopo il massimo'
        },
        {
          description: 'Con la forma beta, a T=5°C (sotto TBD) qual è il valore di f(T)?',
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
          hint: 'Leggi il valore dal grafico interattivo'
        },
        {
          description: 'Aumenta CN a 90. Come cambia il runoff per la stessa pioggia?',
          solution: 'CN più alto = più runoff, meno infiltrazione (suolo meno permeabile o meno copertura)'
        },
        {
          description: 'Nella vista Bilancio Idrico, varia il Curve Number. Come influisce su W (contenuto idrico) e su ARID?',
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
          hint: 'Vista Fenologia: osserva quando NDS raggiunge 1'
        },
        {
          description: 'Ripeti con semina al giorno 120 (fine aprile). La durata in giorni è la stessa?',
          solution: 'No: con semina tardiva le temperature sono più alte, quindi DTU/giorno è maggiore e il ciclo si completa in meno giorni solari'
        },
        {
          description: 'Quale dei due scenari produce più biomassa finale? Perché?',
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
          hint: 'FINT = 1 - exp(-k·LAI). Per FINT=0.9: 0.9 = 1 - exp(-0.6·LAI) => LAI ≈ 3.8'
        },
        {
          description: 'In quale fase fenologica (NDS) il LAI è massimo?',
          solution: 'Subito prima dell\'inizio della senescenza (frBLS), tipicamente NDS tra 0.6 e 0.7'
        },
        {
          description: 'Perché la biomassa giornaliera (dB) è massima quando FINT è alta ma LAI non ha ancora iniziato a senescere?',
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
          hint: 'Grafico Biomassa_Standard'
        },
        {
          description: 'Imposta 40% ombreggiamento. Di quanto si riduce la biomassa? E come cambia lo stress (ARID)?',
          solution: 'Biomassa si riduce ~30-50%; ARID spesso diminuisce (meno traspirazione, acqua dura di più)'
        },
        {
          description: 'Spiega perché sotto pannelli la coltura può avere meno stress idrico ma minore produttività.',
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
          hint: 'Senza rumore, simulato = osservato'
        },
        {
          description: 'Aumenta il rumore a σ=300. Come cambiano RMSE e R²?',
          solution: 'RMSE aumenta (~300 kg/ha); R² diminuisce (maggiore scatter tra oss e sim)'
        },
        {
          description: 'Cosa indica un bias positivo? E uno negativo?',
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
          solution: 'WSFG = 0.20/0.25 = 0.8 (crescita ridotta al 80%)'
        },
        {
          description: 'Se WSSG=0.40 (soglia più alta), con FTSW=0.20 qual è WSFG?',
          solution: 'WSFG = 0.20/0.40 = 0.5 (crescita al 50%)'
        },
        {
          description: 'Colture con WSSG alto sono più o meno sensibili allo stress idrico?',
          solution: 'Più sensibili: iniziano a ridurre la crescita prima (a FTSW più alto)'
        }
      ],
      solution: 'WSSG basso (0.2): coltura tollerante, riduce crescita solo con FTSW molto bassa. WSSG alto (0.4): coltura sensibile, riduce crescita prima.',
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

