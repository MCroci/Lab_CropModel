import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { CheckCircle, Lightbulb, Target, ArrowRight, GraduationCap } from 'lucide-react';

interface Exercise {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  difficulty: 'base' | 'intermedio' | 'avanzato';
  module: string;
  deliverable: string;
  objectives: string[];
  steps: {
    description: string;
    hint?: string;
    solution?: string;
  }[];
  solution: string;
  completed: boolean;
}

export const CourseExercisesView: React.FC = () => {
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, Record<number, string>>>({});

  const exercises: Exercise[] = [
    {
      id: 'course_ex1',
      title: 'Fenologia Base: durata del ciclo',
      description: 'Confronta la durata del ciclo in due scenari termici semplici.',
      durationMin: 25,
      difficulty: 'base',
      module: 'Fenologia',
      deliverable: 'Tabella con i due giorni di maturita e una conclusione di 2 righe.',
      objectives: [
        'Leggere il grafico NDS nel tempo',
        'Confrontare due scenari termici',
        'Capire come la temperatura influenza DTU'
      ],
      steps: [
        {
          description: 'Imposta Mais. Nel Generatore Meteo usa tmean=14°C e genera meteo. In Fenologia annota il giorno in cui NDS raggiunge 1.',
          hint: 'NDS=1 indica fine ciclo fenologico'
        },
        {
          description: 'Ripeti con tmean=22°C mantenendo gli altri parametri uguali.',
          hint: 'Confronta il giorno di maturità tra i due scenari'
        },
        {
          description: 'Quale scenario conclude prima il ciclo? Spiega in una frase.',
          solution: 'Con tmean più alta il ciclo si conclude prima, perché l\'accumulo termico giornaliero (DTU) è maggiore.'
        }
      ],
      solution: 'All\'aumentare della temperatura media, il modello accumula DTU più rapidamente e NDS raggiunge 1 in meno giorni solari.',
      completed: false
    },
    {
      id: 'course_ex2',
      title: 'LAI e saturazione della luce',
      description: 'Osserva quando la radiazione intercettata si avvicina al massimo.',
      durationMin: 25,
      difficulty: 'base',
      module: 'LAI & Radiazione',
      deliverable: 'Stima del LAI di saturazione e breve spiegazione fisica.',
      objectives: [
        'Leggere LAI e FINT dai grafici',
        'Riconoscere la saturazione della Beer-Lambert',
        'Interpretare perché oltre un certo LAI i guadagni sono ridotti'
      ],
      steps: [
        {
          description: 'Vai in LAI & Radiazione e osserva l\'andamento di FINT durante il ciclo.',
          hint: 'FINT cresce velocemente all\'inizio e poi rallenta'
        },
        {
          description: 'Individua il valore di LAI (approssimativo) per cui FINT supera 0.9.',
          solution: 'Con KPAR~0.6, FINT supera 0.9 intorno a LAI 3.5-4.5.'
        },
        {
          description: 'Spiega perché aumentare ancora LAI oltre quel valore ha effetto limitato su FINT.',
          solution: 'La funzione è saturante: gran parte della luce è già intercettata, quindi i guadagni aggiuntivi diventano piccoli.'
        }
      ],
      solution: 'La relazione FINT-LAI segue una curva di saturazione: dopo LAI medio-alti, l\'intercettazione è quasi massima.',
      completed: false
    },
    {
      id: 'course_ex3',
      title: 'Stress idrico: impatto su FTSW e biomassa',
      description: 'Valuta l\'effetto di una riduzione della pioggia su acqua disponibile e crescita.',
      durationMin: 30,
      difficulty: 'intermedio',
      module: 'Bilancio Idrico',
      deliverable: 'Confronto scenario A/B con 3 indicatori: FTSW, ARID, biomassa finale.',
      objectives: [
        'Confrontare due scenari di pioggia',
        'Interpretare FTSW e ARID',
        'Collegare stress idrico a biomassa finale'
      ],
      steps: [
        {
          description: 'Scenario A: rain_mean=2 mm/d. Genera meteo e registra FTSW medio e biomassa finale.',
          hint: 'Usa Bilancio Idrico + Biomassa'
        },
        {
          description: 'Scenario B: rain_mean=0.5 mm/d. Rigenera meteo e confronta FTSW, ARID e biomassa.',
          hint: 'Con meno pioggia, aspettati più stress'
        },
        {
          description: 'Descrivi cosa accade quando FTSW scende sotto la soglia WSSG.',
          solution: 'WSFG scende sotto 1 e la crescita giornaliera (dB) viene ridotta, con biomassa finale inferiore.'
        }
      ],
      solution: 'La riduzione della pioggia abbassa FTSW, aumenta ARID e riduce la biomassa finale via fattore di stress idrico.',
      completed: false
    },
    {
      id: 'course_ex4',
      title: 'Calibrazione guidata di RUE',
      description: 'Esegui una calibrazione semplice e interpreta il minimo RMSE.',
      durationMin: 30,
      difficulty: 'intermedio',
      module: 'Calibrazione e Validazione',
      deliverable: 'RUE calibrato, RMSE minimo e commento su effetto del rumore.',
      objectives: [
        'Eseguire la procedura 1-2 della vista Calibrazione',
        'Identificare il parametro ottimale',
        'Comprendere l\'effetto del rumore sulla stima'
      ],
      steps: [
        {
          description: 'In Calibrazione imposta σ=120 e parametro RUE. Genera dati osservati e avvia la grid search.',
          hint: 'Segui gli step guidati nella vista'
        },
        {
          description: 'Annota RUE calibrato e RMSE minimo. Confronta con il valore vero mostrato nella card.',
          hint: 'Lo scostamento dovrebbe essere piccolo con rumore moderato'
        },
        {
          description: 'Aumenta il rumore a σ=300 e ripeti. Cosa osservi nel minimo RMSE?',
          solution: 'Con più rumore la curva è meno netta e la stima del parametro è meno precisa.'
        }
      ],
      solution: 'La calibrazione recupera bene RUE con rumore basso/moderato; con rumore alto aumenta l\'incertezza e peggiora la precisione della stima.',
      completed: false
    }
  ];
  const exercisesTotalMin = exercises.reduce((sum, ex) => sum + ex.durationMin, 0);
  const sessionTotalMin = exercisesTotalMin + 10 + 20; // 10' briefing + 20' debrief

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
      <Card title="Corso modellistica delle colture erbacee">
        <p className="text-gray-700 mb-4">
          Percorso con 4 esercizi a complessita crescente. Gli esercizi sono pensati per accompagnare
          lo studente da concetti base (fenologia, LAI) a analisi piu integrate (stress idrico e calibrazione).
        </p>
        <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="font-semibold text-indigo-900 mb-2">Pianificazione esercitazione (2 ore)</h4>
          <ul className="text-sm text-indigo-800 space-y-1">
            <li>10 min - briefing iniziale (obiettivi e set-up)</li>
            <li>{exercisesTotalMin} min - lavoro sui 4 esercizi ({exercises.map(e => `${e.durationMin}'`).join(' + ')})</li>
            <li>20 min - debrief finale e confronto risultati</li>
            <li><strong>Totale: {sessionTotalMin} minuti</strong></li>
          </ul>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {exercises.filter(e => e.difficulty === 'base').length}
            </div>
            <div className="text-sm text-green-700">Esercizi Base</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">
              {exercises.filter(e => e.difficulty === 'intermedio').length}
            </div>
            <div className="text-sm text-yellow-700">Esercizi Intermedi</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{exercises.length}</div>
            <div className="text-sm text-blue-700">Totale Corso</div>
          </div>
        </div>
      </Card>

      {exercises.map((exercise, idx) => (
        <Card
          key={exercise.id}
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-semibold border ${getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty.toUpperCase()}
                </span>
                <span className="px-2 py-1 rounded text-xs font-semibold border bg-slate-100 text-slate-700 border-slate-300">
                  {exercise.durationMin} min
                </span>
                <span>{exercise.title}</span>
              </div>
              {exercise.completed && <CheckCircle className="text-green-600" size={20} />}
            </div>
          }
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-700">
              <p className="mb-2">{exercise.description}</p>
              <p><strong>Modulo:</strong> {exercise.module}</p>
              <p><strong>Consegna minima:</strong> {exercise.deliverable}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Target size={16} className="text-blue-600" />
                <h4 className="font-semibold text-blue-900">Obiettivi</h4>
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
              <h4 className="font-semibold text-gray-900">Procedura</h4>
              {exercise.steps.map((step, index) => (
                <div key={index} className="border-l-4 border-brand-500 pl-4 py-2 bg-gray-50 rounded-r">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="font-bold text-brand-700">Step {index + 1}:</span>
                    <span className="text-gray-700 flex-1">{step.description}</span>
                  </div>

                  <textarea
                    value={userAnswers[exercise.id]?.[index] || ''}
                    onChange={(e) => handleAnswerChange(exercise.id, index, e.target.value)}
                    placeholder="Scrivi qui la tua risposta..."
                    className="w-full p-2 border border-gray-300 rounded text-sm mb-2 resize-none"
                    rows={2}
                  />

                  {step.hint && (
                    <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                      <Lightbulb size={12} className="mt-0.5 flex-shrink-0" />
                      <span><strong>Suggerimento:</strong> {step.hint}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t">
              <Button
                onClick={() => toggleSolution(exercise.id)}
                variant={showSolution[exercise.id] ? 'secondary' : 'outline'}
                className="w-full md:w-auto"
              >
                {showSolution[exercise.id] ? 'Nascondi Soluzione' : 'Mostra Soluzione'}
              </Button>

              {showSolution[exercise.id] && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap size={16} className="text-green-600" />
                    <h5 className="font-semibold text-green-900">Soluzione Guidata</h5>
                  </div>
                  <p className="text-sm text-green-800">{exercise.solution}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
