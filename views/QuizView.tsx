import React from 'react';
import { Card } from '../components/UI';
import { HelpCircle } from 'lucide-react';

export const QuizView: React.FC = () => {
  const totalQuestions = 0;

  return (
    <div className="space-y-6">
      <Card title="Quiz e Autovalutazione">
        <p className="text-gray-700 mb-4">
          Questa sezione è pronta per ospitare quiz a scelta multipla e domande aperte.
          Al momento non sono presenti domande.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <div className="text-2xl font-bold text-indigo-700">{totalQuestions}</div>
            <div className="text-sm text-indigo-700">Domande disponibili</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-sm text-slate-700">
              <strong>Stato:</strong> bozza iniziale
            </div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-center gap-2">
            <HelpCircle size={16} className="text-amber-700" />
            <span className="text-sm text-amber-800">Aggiungi le domande quando vuoi.</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
