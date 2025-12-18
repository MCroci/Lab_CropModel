import React from 'react';
import { Card } from '../components/UI';

export const ConceptsView: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Glossario Operativo" className="border-l-4 border-l-brand-500">
        <ul className="space-y-4">
          <li className="pb-3 border-b border-gray-100">
            <span className="font-bold text-gray-900 block">Variabili di Stato (State)</span>
            <span className="text-gray-600 text-sm">Descrivono lo stato del sistema in un dato momento (es. CTU, NDS, LAI, Biomassa, Contenuto idrico W).</span>
          </li>
          <li className="pb-3 border-b border-gray-100">
            <span className="font-bold text-gray-900 block">Variabili di Flusso (Rate)</span>
            <span className="text-gray-600 text-sm">Rappresentano la velocità di cambiamento delle variabili di stato (es. DTU, dLAI, dB, Evapotraspirazione).</span>
          </li>
          <li className="pb-3 border-b border-gray-100">
            <span className="font-bold text-gray-900 block">Parametri</span>
            <span className="text-gray-600 text-sm">Proprietà del sistema o della cultivar che generalmente rimangono costanti durante la simulazione (es. Tbase, tuHAR, KPAR, RUE).</span>
          </li>
          <li>
            <span className="font-bold text-gray-900 block">Variabili Forzanti (Forcing)</span>
            <span className="text-gray-600 text-sm">Input esterni che guidano il sistema (es. Meteo, Gestione agronomica).</span>
          </li>
        </ul>
        <p className="mt-4 text-sm bg-gray-100 p-2 rounded text-gray-700">Nel ciclo giornaliero, tipicamente si aggiornano prima le forzanti, poi i flussi, e infine gli stati.</p>
      </Card>

      <Card title="Esercizi Suggeriti" className="border-l-4 border-l-orange-500 bg-orange-50/30">
        <ol className="list-decimal list-inside space-y-4 text-gray-800">
          <li>Dato un set di parametri, identifica quali influenzano la durata del ciclo e quali la produttività giornaliera.</li>
          <li>Prova concettualmente due scelte diverse di Δt (giornaliero vs orario): quali processi cambierebbero formulazione?</li>
          <li>Discuti come cambierebbe il modello se venisse aggiunto un nuovo stato (es. Azoto Minerale nel suolo).</li>
        </ol>
      </Card>
    </div>
  );
};