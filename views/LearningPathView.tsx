import React, { useState } from 'react';
import { Card, Button } from '../components/UI';
import { CheckCircle, Circle, BookOpen, Target, ArrowRight, Lock } from 'lucide-react';

interface LearningPathViewProps {
  onNavigate?: (tab: string) => void;
}

interface Module {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  estimatedTime: string;
  prerequisites: string[];
  completed: boolean;
  locked: boolean;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({ onNavigate }) => {
  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Concetti Fondamentali',
      description: 'Introduzione alle variabili di stato, flusso, parametri e forzanti nei modelli dinamici discreti.',
      objectives: [
        'Distinguere variabili di stato da variabili di flusso',
        'Comprendere il ruolo dei parametri nel modello',
        'Identificare le variabili forzanti',
        'Analizzare il ciclo giornaliero di simulazione',
        'Esplorare la funzione Expolinear e il bilancio di massa'
      ],
      estimatedTime: '2 ore',
      prerequisites: [],
      completed: false,
      locked: false
    },
    {
      id: '1b',
      title: 'Funzioni di Risposta',
      description: 'Forme delle equazioni che mappano input (temperatura, acqua, LAI) in fattori moltiplicativi.',
      objectives: [
        'Comprendere tempfun (trapezoidale, triangolare, beta)',
        'Interpretare FTSW → WSFG per stress idrico',
        'Visualizzare Beer-Lambert (FINT), stress termico (fHeat), Runoff SCS'
      ],
      estimatedTime: '1 ora',
      prerequisites: ['1'],
      completed: false,
      locked: false
    },
    {
      id: '2',
      title: 'Fenologia e Tempo Termico',
      description: 'Modellazione dello sviluppo fenologico attraverso l\'accumulo di gradi giorno (GDD) e tempfun.',
      objectives: [
        'Calcolare DTU con tempfun (temperature cardinali)',
        'Comprendere l\'accumulo cumulativo (CTU)',
        'Relazionare CTU con stadio di sviluppo (NDS)',
        'Analizzare Fillocrono (PHYL) e sviluppo nodi (INODE)'
      ],
      estimatedTime: '2 ore',
      prerequisites: ['1b'],
      completed: false,
      locked: false
    },
    {
      id: '3',
      title: 'Area Fogliare e Intercettazione Radiativa',
      description: 'Dinamica del LAI e calcolo della radiazione intercettata mediante legge di Beer-Lambert.',
      objectives: [
        'Modellare la crescita del LAI (fase logistica)',
        'Comprendere la senescenza fogliare',
        'Calcolare la frazione di radiazione intercettata (FINT)',
        'Analizzare l\'effetto del coefficiente di estinzione (KPAR)'
      ],
      estimatedTime: '3 ore',
      prerequisites: ['2'],
      completed: false,
      locked: false
    },
    {
      id: '4',
      title: 'Accumulo di Biomassa',
      description: 'Produzione di biomassa attraverso l\'Efficienza d\'Uso della Radiazione (RUE).',
      objectives: [
        'Comprendere il concetto di RUE',
        'Calcolare la biomassa prodotta giornalmente',
        'Analizzare la risposta della RUE alla temperatura (TCFRUE)',
        'Valutare l\'impatto dello stress idrico (FTSW, WSFG) sulla crescita'
      ],
      estimatedTime: '3 ore',
      prerequisites: ['3'],
      completed: false,
      locked: false
    },
    {
      id: '5',
      title: 'Bilancio Idrico del Suolo',
      description: 'Modellazione del contenuto idrico del suolo e calcolo dell\'evapotraspirazione.',
      objectives: [
        'Comprendere il modello "a secchio" (Bucket)',
        'Calcolare evapotraspirazione potenziale e reale',
        'Modellare drenaggio e ruscellamento (Runoff SCS con Curve Number)',
        'Analizzare FTSW, WSFG e indice di stress idrico (ARID)'
      ],
      estimatedTime: '3 ore',
      prerequisites: ['4'],
      completed: false,
      locked: false
    },
    {
      id: '5b',
      title: 'Suolo e Aggregati',
      description: 'Struttura del suolo, porosità, densità apparente. Box counting per macroporosità e modello a fascio di capillari.',
      objectives: [
        'Comprendere aggregati e classi di pori (macro, meso, micro)',
        'Calcolare porosità φ e contenuto volumetrico θ',
        'Introduzione a box counting e dimensione frattale',
        'Modello a fascio di capillari per ritenzione idrica'
      ],
      estimatedTime: '2 ore',
      prerequisites: ['5'],
      completed: false,
      locked: false
    },
    {
      id: '6',
      title: 'Calibrazione e Validazione',
      description: 'Calibrazione (grid search su RUE, KPAR, ecc.) e validazione con metriche RMSE, R². Viste: Calibrazione e Validazione.',
      objectives: [
        'Eseguire calibrazione mediante grid search',
        'Valutare metriche di bontà di adattamento (RMSE, R²)',
        'Eseguire analisi di sensibilità parametrica',
        'Validare il modello su dataset indipendenti'
      ],
      estimatedTime: '4 ore',
      prerequisites: ['5'],
      completed: false,
      locked: false
    },
    {
      id: '7',
      title: 'Analisi di Scenario',
      description: 'Utilizzo del modello per analizzare scenari climatici e gestionali.',
      objectives: [
        'Simulare scenari climatici diversi',
        'Analizzare l\'impatto di strategie irrigue',
        'Confrontare varietà diverse',
        'Valutare l\'effetto dei cambiamenti climatici'
      ],
      estimatedTime: '3 ore',
      prerequisites: ['6'],
      completed: false,
      locked: false
    }
  ]);

  const toggleModuleComplete = (id: string) => {
    setModules(prev => prev.map(m => 
      m.id === id ? { ...m, completed: !m.completed } : m
    ));
  };

  const getProgress = () => {
    const completed = modules.filter(m => m.completed).length;
    return Math.round((completed / modules.length) * 100);
  };

  // Mapping moduli -> tab IDs
  const moduleToTabMap: Record<string, string> = {
    '1': 'concepts',
    '1b': 'response_functions',
    '2': 'phenology',
    '3': 'lai',
    '4': 'biomass',
    '5': 'water',
    '5b': 'soil',
    '6': 'calibration',    // Calibrazione (grid search) e Validazione
    '7': 'scenario'
  };

  const handleStartModule = (moduleId: string) => {
    const tabId = moduleToTabMap[moduleId];
    if (tabId && onNavigate) {
      onNavigate(tabId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con Progresso */}
      <Card title="Percorso Didattico - Modellistica delle Colture Erbacee">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progresso Complessivo</span>
            <span className="text-sm font-bold text-brand-600">{getProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-brand-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>
        <p className="text-gray-600 text-sm">
          Questo percorso ti guiderà attraverso i concetti fondamentali della modellistica delle colture erbacee.
          Completa i moduli in sequenza per costruire una comprensione solida e progressiva.
        </p>
      </Card>

      {/* Lista Moduli */}
      <div className="space-y-4">
        {modules.map((module, index) => {
          const canAccess = module.prerequisites.every(prereq => 
            modules.find(m => m.id === prereq)?.completed
          );
          const isLocked = !canAccess && index > 0;

          return (
            <Card 
              key={module.id}
              title={
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    module.completed ? 'bg-green-100 text-green-700' : 
                    isLocked ? 'bg-gray-100 text-gray-400' : 
                    'bg-brand-100 text-brand-700'
                  }`}>
                    {isLocked ? (
                      <Lock size={16} />
                    ) : module.completed ? (
                      <CheckCircle size={16} />
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span>{module.title}</span>
                </div>
              }
              className={isLocked ? 'opacity-60' : ''}
            >
              <div className="space-y-4">
                <p className="text-gray-700">{module.description}</p>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={16} className="text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Obiettivi di Apprendimento</h4>
                  </div>
                  <ul className="space-y-2">
                    {module.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-blue-800">
                        <ArrowRight size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span>{module.estimatedTime}</span>
                    </div>
                    {module.prerequisites.length > 0 && (
                      <div className="text-xs">
                        Prerequisiti: Moduli {module.prerequisites.join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isLocked && (
                      <Button
                        onClick={() => toggleModuleComplete(module.id)}
                        variant={module.completed ? 'outline' : 'primary'}
                        className="text-sm"
                      >
                        {module.completed ? (
                          <>
                            <CheckCircle size={16} />
                            Completato
                          </>
                        ) : (
                          <>
                            <Circle size={16} />
                            Segna come Completato
                          </>
                        )}
                      </Button>
                    )}
                    {!isLocked && (
                      <Button
                        onClick={() => handleStartModule(module.id)}
                        variant="secondary"
                        className="text-sm"
                      >
                        Inizia Modulo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Riepilogo Finale */}
      {getProgress() === 100 && (
        <Card title="🎉 Percorso Completato!" className="bg-green-50 border-green-200">
          <p className="text-gray-700 mb-4">
            Complimenti! Hai completato tutti i moduli del percorso didattico.
          </p>
          <p className="text-sm text-gray-600">
            Ora sei pronto per applicare le conoscenze acquisite in esercizi pratici e casi studio avanzati.
          </p>
        </Card>
      )}
    </div>
  );
};

