import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { CheckCircle, XCircle, Lightbulb, Target, ArrowRight } from 'lucide-react';
import { makeWeather, simulateCrop } from '../services/cropModel';
import { useI18n } from '../i18n/I18nContext';

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
  const { weatherParams, cropParams, setCropParams, simulationResults, getCurrentCropSowingDay } = useSimulation();
  const { t } = useI18n();
  const sowingDay = getCurrentCropSowingDay();
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
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
      <Card title={t.exercises.title}>
        <p className="text-gray-700 mb-4">
          {t.exercises.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">
              {exercises.filter(e => e.difficulty === 'base').length}
            </div>
            <div className="text-sm text-blue-600">{t.exercises.base}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">
              {exercises.filter(e => e.difficulty === 'intermedio').length}
            </div>
            <div className="text-sm text-yellow-600">{t.exercises.intermediate}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">
              {exercises.filter(e => e.difficulty === 'avanzato').length}
            </div>
            <div className="text-sm text-red-600">{t.exercises.advanced}</div>
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
                  <strong>{t.exercises.module}</strong> {exercise.module}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-blue-600" />
                  <h4 className="font-semibold text-blue-900">{t.learningPath.objectives}</h4>
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
                <h4 className="font-semibold text-gray-900">{t.exercises.step === 'Step' ? 'Step by Step Procedure' : 'Procedura Step-by-Step'}</h4>
                {exercise.steps.map((step, index) => (
                  <div key={index} className="border-l-4 border-brand-500 pl-4 py-2 bg-gray-50 rounded-r">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="font-bold text-brand-700">{t.exercises.step} {index + 1}:</span>
                      <span className="text-gray-700 flex-1">{step.description}</span>
                    </div>
                    {step.hint && (
                      <div className="mt-2 flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                        <Lightbulb size={14} className="mt-0.5 flex-shrink-0 text-yellow-600" />
                        <span><strong>{t.exercises.hint}</strong> {step.hint}</span>
                      </div>
                    )}
                    {step.solution && (
                      <div className="mt-2">
                        <textarea
                          placeholder={t.exercises.answer}
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
                  {showSolution[exercise.id] ? t.exercises.hideSolution : t.exercises.showSolution}
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
                  {t.exercises.markComplete}
                </Button>
              </div>

              {showSolution[exercise.id] && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={18} />
                    <h5 className="font-semibold text-green-900">{t.exercises.solution}</h5>
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

