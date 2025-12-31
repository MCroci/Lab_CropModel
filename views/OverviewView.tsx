import React, { useState, useEffect } from 'react';
import { Card, Select, Button } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { CropParams } from '../types';
import { GitCompare } from 'lucide-react';

// Preset Data - Completi con tutti i parametri necessari
const CROP_PRESETS: Record<string, Partial<CropParams>> = {
  'generica': {
    Tbase: 8, tuHAR: 1400, LAI0: 0.02, LAIMX: 5, ALPHA: 0.02, 
    SENRATE: 0.02, frEMR: 0.05, frBLS: 0.65, KPAR: 0.6, RUE: 2.5,
    TBRUE: 8, TP1RUE: 18, TP2RUE: 28, TCRUE: 40, B0: 0
  },
  'mais': {
    Tbase: 10, tuHAR: 1600, LAI0: 0.015, LAIMX: 6, ALPHA: 0.025, 
    SENRATE: 0.03, frEMR: 0.05, frBLS: 0.7, KPAR: 0.65, RUE: 3.8,
    // Mais (C4): ottimo termico più alto, range più ampio
    TBRUE: 10, TP1RUE: 22, TP2RUE: 32, TCRUE: 45, B0: 0
  },
  'frumento': {
    Tbase: 0, tuHAR: 1900, LAI0: 0.02, LAIMX: 7, ALPHA: 0.015, 
    SENRATE: 0.01, frEMR: 0.05, frBLS: 0.6, KPAR: 0.5, RUE: 2.2,
    // Frumento (C3): ottimo termico più basso, range più stretto
    TBRUE: 0, TP1RUE: 15, TP2RUE: 25, TCRUE: 35, B0: 0
  },
  'pomodoro': {
    Tbase: 12, tuHAR: 1800, LAI0: 0.01, LAIMX: 4, ALPHA: 0.03, 
    SENRATE: 0.02, frEMR: 0.05, frBLS: 0.8, KPAR: 0.7, RUE: 2.0,
    // Pomodoro: pianta termofila, ottimo termico intermedio
    TBRUE: 12, TP1RUE: 20, TP2RUE: 30, TCRUE: 42, B0: 0
  }
};

export const OverviewView: React.FC = () => {
  const { cropParams, setCropParams, sowingDays, setSowingDays, weatherParams } = useSimulation();
  const [selectedPreset, setSelectedPreset] = useState<string>('generica');

  // Rileva quale preset corrisponde ai parametri attuali (per mostrarlo nel Select)
  useEffect(() => {
    const currentPreset = Object.entries(CROP_PRESETS).find(([_, preset]) => {
      return preset.Tbase === cropParams.Tbase && 
             preset.RUE === cropParams.RUE &&
             preset.KPAR === cropParams.KPAR;
    });
    if (currentPreset) {
      setSelectedPreset(currentPreset[0]);
    }
  }, [cropParams]);

  const handlePresetChange = (value: string) => {
    const preset = CROP_PRESETS[value];
    if (preset) {
      setSelectedPreset(value);
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
              value={selectedPreset}
              options={[
                { value: 'generica', label: 'Coltura Generica' },
                { value: 'mais', label: 'Mais (C4)' },
                { value: 'frumento', label: 'Frumento (C3)' },
                { value: 'pomodoro', label: 'Pomodoro' },
              ]}
              onChange={handlePresetChange}
              description="Carica automaticamente un set di parametri fisiologici tipici per la coltura selezionata. I parametri includono fenologia, LAI, RUE e risposta alla temperatura."
            />

            {/* Data di Semina/Trapianto per la coltura selezionata */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data di Semina/Trapianto - {CROP_PRESETS[selectedPreset] ? ['Coltura Generica', 'Mais (C4)', 'Frumento (C3)', 'Pomodoro'][['generica', 'mais', 'frumento', 'pomodoro'].indexOf(selectedPreset)] : 'Coltura Selezionata'}
              </label>
              <input
                type="number"
                min="1"
                max={weatherParams.n_days}
                value={sowingDays[selectedPreset] || 1}
                onChange={(e) => {
                  const day = parseInt(e.target.value) || 1;
                  setSowingDays(prev => ({
                    ...prev,
                    [selectedPreset]: Math.max(1, Math.min(day, weatherParams.n_days))
                  }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Giorno {sowingDays[selectedPreset] || 1} di {weatherParams.n_days} disponibili. La simulazione inizierà da questo giorno.
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setSowingDays(prev => ({ ...prev, [selectedPreset]: 1 }))}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  Giorno 1
                </button>
                <button
                  onClick={() => setSowingDays(prev => ({ ...prev, [selectedPreset]: Math.floor(weatherParams.n_days * 0.1) }))}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  10% stagione
                </button>
                <button
                  onClick={() => setSowingDays(prev => ({ ...prev, [selectedPreset]: Math.floor(weatherParams.n_days * 0.3) }))}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  30% stagione
                </button>
              </div>
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <strong>Nota:</strong> Ogni coltura può avere una data di semina diversa. La data impostata qui si applica solo alla coltura selezionata.
              </div>
            </div>
            
            {/* Riepilogo Parametri Chiave */}
            {selectedPreset && CROP_PRESETS[selectedPreset] && (
              <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3 text-xs">
                <div className="font-semibold text-gray-900 mb-2">Parametri Chiave Attivi:</div>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="font-medium">RUE:</span> {CROP_PRESETS[selectedPreset].RUE} g/MJ
                  </div>
                  <div>
                    <span className="font-medium">KPAR:</span> {CROP_PRESETS[selectedPreset].KPAR}
                  </div>
                  <div>
                    <span className="font-medium">Tbase:</span> {CROP_PRESETS[selectedPreset].Tbase}°C
                  </div>
                  <div>
                    <span className="font-medium">tuHAR:</span> {CROP_PRESETS[selectedPreset].tuHAR}°C·d
                  </div>
                  <div>
                    <span className="font-medium">LAIMX:</span> {CROP_PRESETS[selectedPreset].LAIMX}
                  </div>
                  <div>
                    <span className="font-medium">TP1RUE:</span> {CROP_PRESETS[selectedPreset].TP1RUE}°C
                  </div>
                </div>
                {selectedPreset === 'mais' && (
                  <div className="mt-2 text-green-700 font-medium">
                    ✓ Mais (C4): Alta RUE, ottimo termico elevato
                  </div>
                )}
                {selectedPreset === 'frumento' && (
                  <div className="mt-2 text-blue-700 font-medium">
                    ✓ Frumento (C3): RUE moderata, ottimo termico basso
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Guida Rapida</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Scegli un preset qui sopra.</li>
              <li>Vai su <strong>Generatore Meteo</strong> per definire il clima.</li>
              <li>Analizza la <strong>Biomassa</strong> per vedere l'accumulo.</li>
              <li>Controlla <strong>Bilancio Idrico</strong> per lo stress (ARID).</li>
            </ol>
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs font-semibold text-purple-900 mb-1">💡 Confronta più colture</p>
              <p className="text-xs text-purple-700">
                Vuoi confrontare più colture contemporaneamente? Vai su <strong>Confronto Colture</strong> nel menu per eseguire simulazioni parallele!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};