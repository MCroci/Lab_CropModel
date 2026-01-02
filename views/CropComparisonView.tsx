import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { Card, Button } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { simulateCrop } from '../services/cropModel';
import { CropParams } from '../types';
import { CheckSquare, Square, TrendingUp, BarChart3, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

// Preset Data - Completi con tutti i parametri necessari
const CROP_PRESETS: Record<string, { label: string; params: Partial<CropParams>; color: string }> = {
  'generica': {
    label: 'Coltura Generica',
    params: {
      Tbase: 8, tuHAR: 1400, LAI0: 0.02, LAIMX: 5, ALPHA: 0.02, 
      SENRATE: 0.02, frEMR: 0.05, frBLS: 0.65, KPAR: 0.6, RUE: 2.5,
      TBRUE: 8, TP1RUE: 18, TP2RUE: 28, TCRUE: 40, B0: 0
    },
    color: '#6b7280'
  },
  'mais': {
    label: 'Mais (C4)',
    params: {
      Tbase: 10, tuHAR: 1600, LAI0: 0.015, LAIMX: 6, ALPHA: 0.025, 
      SENRATE: 0.03, frEMR: 0.05, frBLS: 0.7, KPAR: 0.65, RUE: 3.8,
      TBRUE: 10, TP1RUE: 22, TP2RUE: 32, TCRUE: 45, B0: 0
    },
    color: '#22c55e'
  },
  'frumento': {
    label: 'Frumento (C3)',
    params: {
      Tbase: 0, tuHAR: 1900, LAI0: 0.02, LAIMX: 7, ALPHA: 0.015, 
      SENRATE: 0.01, frEMR: 0.05, frBLS: 0.6, KPAR: 0.5, RUE: 2.2,
      TBRUE: 0, TP1RUE: 15, TP2RUE: 25, TCRUE: 35, B0: 0
    },
    color: '#3b82f6'
  },
  'pomodoro': {
    label: 'Pomodoro',
    params: {
      Tbase: 12, tuHAR: 1800, LAI0: 0.01, LAIMX: 4, ALPHA: 0.03, 
      SENRATE: 0.02, frEMR: 0.05, frBLS: 0.8, KPAR: 0.7, RUE: 2.0,
      TBRUE: 12, TP1RUE: 20, TP2RUE: 30, TCRUE: 42, B0: 0
    },
    color: '#ef4444'
  }
};

interface ComparisonResult {
  cropId: string;
  label: string;
  color: string;
  results: Array<{
    day: number;
    CTU: number;
    NDS: number;
    LAI: number;
    B: number;
    dB: number;
  }>;
  finalBiomass: number;
  maturityDay: number;
  maxLAI: number;
}

export const CropComparisonView: React.FC = () => {
  const { dailyWeather, cropParams: baseCropParams, sowingDays } = useSimulation();
  const { t } = useI18n();
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['mais', 'frumento']);

  // Esegui simulazioni per tutte le colture selezionate
  const comparisonResults = useMemo<ComparisonResult[]>(() => {
    if (dailyWeather.length === 0) return [];

    return selectedCrops.map(cropId => {
      const preset = CROP_PRESETS[cropId];
      if (!preset) return null;

      // Completa i parametri con i valori di default
      const fullParams: CropParams = {
        ...baseCropParams,
        ...preset.params,
        Tmean: baseCropParams.Tmean || 18
      };

      // Ottieni la data di semina per questa coltura specifica
      const cropSowingDay = sowingDays[cropId] || sowingDays['generica'] || 1;
      
      // Filter weather data starting from sowing day
      const weatherFromSowing = dailyWeather.filter(w => w.day >= cropSowingDay);
      if (weatherFromSowing.length === 0) {
        return null;
      }

      // Adjust day numbers to start from 1 for the simulation
      const adjustedWeather = weatherFromSowing.map((w, idx) => ({
        ...w,
        day: idx + 1
      }));
      const results = simulateCrop(adjustedWeather, fullParams);
      
      // Restore original day numbers for display
      const resultsWithOriginalDays = results.map((r, idx) => ({
        ...r,
        day: weatherFromSowing[idx].day
      }));

      return {
        cropId,
        label: preset.label,
        color: preset.color,
        results: resultsWithOriginalDays.map(r => ({
          day: r.day,
          CTU: r.CTU,
          NDS: r.NDS,
          LAI: r.LAI,
          B: r.B,
          dB: r.dB
        })),
        finalBiomass: resultsWithOriginalDays[resultsWithOriginalDays.length - 1]?.B || 0,
        maturityDay: resultsWithOriginalDays.length,
        maxLAI: Math.max(...resultsWithOriginalDays.map(r => r.LAI), 0)
      };
    }).filter((r): r is ComparisonResult => r !== null);
  }, [dailyWeather, selectedCrops, baseCropParams, sowingDays]);

  // Prepara dati per grafici comparativi
  const chartData = useMemo(() => {
    if (comparisonResults.length === 0) return [];

    // Trova la lunghezza massima
    const maxLength = Math.max(...comparisonResults.map(r => r.results.length));
    
    return Array.from({ length: maxLength }, (_, i) => {
      const dataPoint: any = { day: i + 1 };
      
      comparisonResults.forEach(result => {
        const step = result.results[i];
        if (step) {
          dataPoint[`${result.cropId}_B`] = step.B;
          dataPoint[`${result.cropId}_LAI`] = step.LAI;
          dataPoint[`${result.cropId}_NDS`] = step.NDS;
          dataPoint[`${result.cropId}_CTU`] = step.CTU;
        }
      });
      
      return dataPoint;
    });
  }, [comparisonResults]);

  const toggleCrop = (cropId: string) => {
    setSelectedCrops(prev => 
      prev.includes(cropId)
        ? prev.filter(id => id !== cropId)
        : [...prev, cropId]
    );
  };

  const selectAll = () => {
    setSelectedCrops(Object.keys(CROP_PRESETS));
  };

  const deselectAll = () => {
    setSelectedCrops([]);
  };

  if (dailyWeather.length === 0) {
    return (
      <Card title={t.cropComparison.title}>
        <div className="text-center py-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-yellow-800 font-medium mb-2">⚠️ {t.common.noData}</p>
            <p className="text-sm text-yellow-700 mb-4">
              {t.cropComparison.noWeatherData || 'Per eseguire simulazioni parallele, devi prima generare i dati meteorologici.'}
            </p>
            <p className="text-sm text-yellow-700">
              {t.cropComparison.goToWeatherGenerator || 'Vai alla sezione Generatore Meteo nel menu laterale e genera i dati meteo. Poi torna qui per confrontare le colture!'}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title={t.cropComparison.title}>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-blue-900 mb-2">{t.cropComparison.howItWorks || 'Come funziona:'}</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li><strong>{t.cropComparison.selectCrops}</strong> {t.cropComparison.selectCropsDesc || 'che vuoi confrontare usando le checkbox qui sotto'}</li>
            <li>{t.cropComparison.parallelSimulations || 'Le simulazioni vengono eseguite automaticamente in parallelo per tutte le colture selezionate'}</li>
            <li>{t.cropComparison.sameWeather || 'Ogni coltura usa le stesse condizioni meteorologiche (dalla sezione Generatore Meteo)'}</li>
            <li>{t.cropComparison.overlappedResults || 'I risultati vengono mostrati sovrapposti nei grafici per un confronto diretto'}</li>
          </ol>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>{t.overview.sowingDate}:</strong> {t.overview.sowingDateNote}
            {selectedCrops.length > 0 && (
              <ul className="list-disc list-inside mt-2 text-xs">
                {selectedCrops.map(cropId => {
                  const preset = CROP_PRESETS[cropId];
                  const sowingDay = sowingDays[cropId] || sowingDays['generica'] || 1;
                  return preset ? (
                    <li key={cropId}>{preset.label}: giorno {sowingDay}</li>
                  ) : null;
                })}
              </ul>
            )}
          </p>
        </div>
        <p className="text-gray-700 mb-4">
          Questa funzionalità permette di <strong>confrontare simultaneamente</strong> più colture sotto identiche condizioni ambientali.
          Le simulazioni vengono eseguite in parallelo, permettendo di vedere immediatamente le differenze in:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
          <li>Velocità di sviluppo fenologico (tempo a maturità)</li>
          <li>Accumulo di biomassa nel tempo</li>
          <li>Sviluppo dell'area fogliare (LAI)</li>
          <li>Efficienza d'uso della radiazione (RUE)</li>
        </ul>

        {/* Selezione Colture */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{t.cropComparison.selectCrops}</h3>
            <div className="flex gap-2">
              <Button onClick={selectAll} variant="outline" className="text-sm">
                {t.cropComparison.selectAll}
              </Button>
              <Button onClick={deselectAll} variant="outline" className="text-sm">
                {t.cropComparison.deselectAll}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(CROP_PRESETS).map(([cropId, preset]) => {
              const isSelected = selectedCrops.includes(cropId);
              return (
                <button
                  key={cropId}
                  onClick={() => toggleCrop(cropId)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-left
                    ${isSelected 
                      ? 'border-brand-600 bg-brand-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {isSelected ? (
                      <CheckSquare size={20} className="text-brand-600" />
                    ) : (
                      <Square size={20} className="text-gray-400" />
                    )}
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="font-semibold text-gray-900">{preset.label}</span>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>RUE: {preset.params.RUE} g/MJ</div>
                    <div>Tbase: {preset.params.Tbase}°C</div>
                    <div>tuHAR: {preset.params.tuHAR}°C·d</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedCrops.length === 0 && (
          <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium mb-2">{t.cropComparison.noCropsSelected}</p>
            <p className="text-sm text-yellow-700">{t.cropComparison.selectCropsDesc || 'Clicca sulle card qui sopra per selezionare le colture da confrontare'}</p>
          </div>
        )}

        {selectedCrops.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>✓ {selectedCrops.length} coltura{selectedCrops.length > 1 ? 'e' : ''} selezionata{selectedCrops.length > 1 ? 'e' : ''}:</strong>{' '}
              {selectedCrops.map(id => CROP_PRESETS[id]?.label).join(', ')}
            </p>
            <p className="text-xs text-green-700 mt-1">
              Le simulazioni sono state eseguite automaticamente. Scorri in basso per vedere i risultati comparativi.
            </p>
          </div>
        )}
      </Card>

      {comparisonResults.length > 0 && (
        <>
          {/* Info Box Simulazioni */}
          <Card title={t.cropComparison.simulationsCompleted} className="bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <div className="flex-1">
                <p className="text-sm text-green-800 mb-2">
                  <strong>Simulazioni parallele completate!</strong> Sono state eseguite {comparisonResults.length} simulazioni 
                  simultanee utilizzando le stesse condizioni meteorologiche ({dailyWeather.length} giorni).
                </p>
                <p className="text-xs text-green-700">
                  Ogni coltura ha i propri parametri fisiologici (RUE, Tbase, tuHAR, ecc.) ma tutte condividono 
                  lo stesso clima. Questo permette di isolare l'effetto delle caratteristiche genetiche/fisiologiche.
                </p>
              </div>
            </div>
          </Card>

          {/* Tabella Comparativa Parametri */}
          <Card title={t.cropComparison.comparativeParams}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-2 font-semibold">Coltura</th>
                    <th className="text-right p-2 font-semibold">RUE (g/MJ)</th>
                    <th className="text-right p-2 font-semibold">KPAR</th>
                    <th className="text-right p-2 font-semibold">Tbase (°C)</th>
                    <th className="text-right p-2 font-semibold">tuHAR (°C·d)</th>
                    <th className="text-right p-2 font-semibold">LAIMX</th>
                    <th className="text-right p-2 font-semibold">TP1RUE (°C)</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonResults.map(result => {
                    const preset = CROP_PRESETS[result.cropId];
                    return (
                      <tr key={result.cropId} className="border-b border-gray-100">
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: result.color }}
                            />
                            <span className="font-medium">{result.label}</span>
                          </div>
                        </td>
                        <td className="text-right p-2">{preset.params.RUE}</td>
                        <td className="text-right p-2">{preset.params.KPAR}</td>
                        <td className="text-right p-2">{preset.params.Tbase}</td>
                        <td className="text-right p-2">{preset.params.tuHAR}</td>
                        <td className="text-right p-2">{preset.params.LAIMX}</td>
                        <td className="text-right p-2">{preset.params.TP1RUE}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Risultati Finali Comparativi */}
          <Card title={t.cropComparison.finalResults}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {comparisonResults.map(result => (
                <div
                  key={result.cropId}
                  className="p-4 rounded-lg border-2"
                  style={{ borderColor: result.color, backgroundColor: `${result.color}10` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: result.color }}
                    />
                    <h4 className="font-semibold text-gray-900">{result.label}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Biomassa Finale:</span>
                      <span className="font-bold">{result.finalBiomass.toFixed(0)} kg/ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giorni a Maturità:</span>
                      <span className="font-bold">{result.maturityDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">LAI Massimo:</span>
                      <span className="font-bold">{result.maxLAI.toFixed(2)} m²/m²</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Grafico Comparativo Biomassa */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp size={18} />
                Accumulo di Biomassa
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Biomassa (kg/ha)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {comparisonResults.map(result => (
                    <Line
                      key={result.cropId}
                      type="monotone"
                      dataKey={`${result.cropId}_B`}
                      stroke={result.color}
                      strokeWidth={2}
                      name={result.label}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Grafico Comparativo LAI */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 size={18} />
                Sviluppo Area Fogliare (LAI)
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'LAI (m²/m²)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {comparisonResults.map(result => (
                    <Line
                      key={result.cropId}
                      type="monotone"
                      dataKey={`${result.cropId}_LAI`}
                      stroke={result.color}
                      strokeWidth={2}
                      name={result.label}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Grafico Comparativo Fenologia */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Sviluppo Fenologico (NDS)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'NDS (0-1)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {comparisonResults.map(result => (
                    <Line
                      key={result.cropId}
                      type="monotone"
                      dataKey={`${result.cropId}_NDS`}
                      stroke={result.color}
                      strokeWidth={2}
                      name={result.label}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Grafico a Barre Comparativo Finale */}
          <Card title="Confronto Finale - Biomassa e Durata Ciclo">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Biomassa Finale (kg/ha)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonResults}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="finalBiomass" fill="#3b82f6" name="Biomassa Finale" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Durata Ciclo (giorni)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={comparisonResults}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="maturityDay" fill="#22c55e" name="Giorni a Maturità" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

