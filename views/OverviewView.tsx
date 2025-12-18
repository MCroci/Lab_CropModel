import React from 'react';
import { Card, Select } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { CropParams } from '../types';

// Preset Data
const CROP_PRESETS: Record<string, Partial<CropParams>> = {
  'generica': {
    Tbase: 8, tuHAR: 1400, LAI0: 0.02, LAIMX: 5, ALPHA: 0.02, 
    SENRATE: 0.02, frEMR: 0.05, frBLS: 0.65, KPAR: 0.6, RUE: 2.5
  },
  'mais': {
    Tbase: 10, tuHAR: 1600, LAI0: 0.015, LAIMX: 6, ALPHA: 0.025, 
    SENRATE: 0.03, frEMR: 0.05, frBLS: 0.7, KPAR: 0.65, RUE: 3.8
  },
  'frumento': {
    Tbase: 0, tuHAR: 1900, LAI0: 0.02, LAIMX: 7, ALPHA: 0.015, 
    SENRATE: 0.01, frEMR: 0.05, frBLS: 0.6, KPAR: 0.5, RUE: 2.2
  },
  'pomodoro': {
    Tbase: 12, tuHAR: 1800, LAI0: 0.01, LAIMX: 4, ALPHA: 0.03, 
    SENRATE: 0.02, frEMR: 0.05, frBLS: 0.8, KPAR: 0.7, RUE: 2.0
  }
};

export const OverviewView: React.FC = () => {
  const { setCropParams } = useSimulation();

  const handlePresetChange = (value: string) => {
    const preset = CROP_PRESETS[value];
    if (preset) {
      setCropParams(prev => ({
        ...prev,
        ...preset
      }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card title="Obiettivi di Apprendimento" className="h-full">
          <p className="text-gray-600 mb-4">
            Questa applicazione è progettata per esercizi didattici sulla modellazione delle colture erbacee.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Distinguere tra <span className="font-semibold text-brand-600">variabili di stato</span>, <span className="font-semibold text-brand-600">variabili di flusso</span>, parametri e variabili forzanti.</li>
            <li>Comprendere il ciclo giornaliero: Meteo → Fenologia → LAI → Intercettazione → Biomassa.</li>
            <li>Introduzione all'accoppiamento con il bilancio idrico del suolo e gli indici di stress.</li>
            <li>Visualizzare l'impatto dei parametri fisiologici (es. RUE, KPAR) sulla produttività.</li>
          </ul>
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Il modello implementato qui è semplificato a scopi didattici. Si concentra sui principi fisici fondamentali (Radiazione, Temperatura, Acqua) tralasciando aspetti complessi come i nutrienti o i parassiti.
            </p>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card title="Configurazione Rapida" className="h-full bg-blue-50 border-blue-100">
          <div className="mb-6">
            <Select 
              label="Seleziona Coltura (Preset)"
              value="generica"
              options={[
                { value: 'generica', label: 'Coltura Generica' },
                { value: 'mais', label: 'Mais (C4)' },
                { value: 'frumento', label: 'Frumento (C3)' },
                { value: 'pomodoro', label: 'Pomodoro' },
              ]}
              onChange={handlePresetChange}
              description="Carica automaticamente un set di parametri fisiologici tipici per la coltura selezionata."
            />
          </div>
          <div className="pt-4 border-t border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Guida Rapida</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Scegli un preset qui sopra.</li>
              <li>Vai su <strong>Generatore Meteo</strong> per definire il clima.</li>
              <li>Analizza la <strong>Biomassa</strong> per vedere l'accumulo.</li>
              <li>Controlla <strong>Bilancio Idrico</strong> per lo stress (ARID).</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
};