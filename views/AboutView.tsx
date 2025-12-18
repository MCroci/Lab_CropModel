
import React from 'react';
import { Card } from '../components/UI';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <Card title="Note Metodologiche & Riferimenti">
        <p className="mb-4 text-gray-700">
          Questa dashboard è costruita per esercizi su modelli dinamici discreti (passo giornaliero).
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li><strong>Modelli Colturali Dinamici:</strong> Riferimento a testi standard di modellistica (es. Wallach et al., Jones et al.).</li>
          <li><strong>Formulazioni:</strong> 
            <ul className="list-disc list-inside ml-6 mt-1 text-sm text-gray-600">
               <li>Fenologia tramite Tempo Termico (GDD).</li>
               <li>LAI & Intercettazione tramite legge di Beer-Lambert.</li>
               <li>Biomassa tramite Efficienza d'Uso della Radiazione (RUE).</li>
               <li>Decomposizione Carbonio tramite modello RothC (Coleman & Jenkinson).</li>
            </ul>
          </li>
          <li><strong>Accoppiamento:</strong> Bilancio idrico "a secchio" (Bucket) e indici di stress (ARID) che riducono la crescita.</li>
        </ul>
        <div className="bg-gray-100 p-4 rounded-lg">
           <p className="text-sm text-gray-600">
             <strong>Suggerimento Didattico:</strong> Prova a implementare una variante (es. stress idrico che colpisce RUE invece di ALPHA) e confronta gli scenari.
           </p>
        </div>
        <div className="mt-8 pt-4 border-t text-xs text-gray-400">
          Autore: Michele Croci
        </div>
      </Card>
    </div>
  );
};
