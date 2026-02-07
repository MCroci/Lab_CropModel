import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter } from 'recharts';
import { CHART_MARGIN } from '../utils/chartMargins';
import { Card, Button, Slider } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { Download, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ValidationMetrics {
  rmse: number;
  r2: number;
  nrmse: number;
  mae: number;
  bias: number;
}

export const ValidationView: React.FC = () => {
  const { simulationResults, cropParams, weatherParams, getCurrentCropSowingDay } = useSimulation();
  const sowingDay = getCurrentCropSowingDay();
  const [selectedMetric, setSelectedMetric] = useState<'biomass' | 'lai'>('biomass');
  const [noiseLevel, setNoiseLevel] = useState(150);

  // Genera dati "osservati" sintetici aggiungendo rumore ai risultati simulati
  const observedData = useMemo(() => {
    if (simulationResults.length === 0) return [];
    
    return simulationResults.map((sim, index) => {
      const noise = (Math.random() - 0.5) * 2 * noiseLevel;
      return {
        day: sim.day,
        biomass_obs: Math.max(0, sim.B + noise),
        lai_obs: Math.max(0, sim.LAI + (noise / 1000)),
        biomass_sim: sim.B,
        lai_sim: sim.LAI
      };
    });
  }, [simulationResults, noiseLevel]);

  // Calcola metriche di validazione
  const metrics: ValidationMetrics = useMemo(() => {
    if (observedData.length === 0) {
      return { rmse: 0, r2: 0, nrmse: 0, mae: 0, bias: 0 };
    }

    const obs = observedData.map(d => selectedMetric === 'biomass' ? d.biomass_obs : d.lai_obs);
    const sim = observedData.map(d => selectedMetric === 'biomass' ? d.biomass_sim : d.lai_sim);

    // Media osservata
    const obsMean = obs.reduce((a, b) => a + b, 0) / obs.length;
    const simMean = sim.reduce((a, b) => a + b, 0) / sim.length;

    // RMSE
    const rmse = Math.sqrt(
      obs.reduce((sum, val, i) => sum + Math.pow(val - sim[i], 2), 0) / obs.length
    );

    // R²
    const ssRes = obs.reduce((sum, val, i) => sum + Math.pow(val - sim[i], 2), 0);
    const ssTot = obs.reduce((sum, val) => sum + Math.pow(val - obsMean, 2), 0);
    const r2 = 1 - (ssRes / ssTot);

    // nRMSE (%)
    const nrmse = (rmse / obsMean) * 100;

    // MAE
    const mae = obs.reduce((sum, val, i) => sum + Math.abs(val - sim[i]), 0) / obs.length;

    // Bias
    const bias = simMean - obsMean;

    return { rmse, r2, nrmse, mae, bias };
  }, [observedData, selectedMetric]);

  const getMetricQuality = (metric: string, value: number): { color: string; label: string } => {
    if (metric === 'r2') {
      if (value >= 0.9) return { color: 'text-green-600', label: 'Eccellente' };
      if (value >= 0.7) return { color: 'text-yellow-600', label: 'Buono' };
      if (value >= 0.5) return { color: 'text-orange-600', label: 'Accettabile' };
      return { color: 'text-red-600', label: 'Scarso' };
    }
    if (metric === 'nrmse') {
      if (value <= 10) return { color: 'text-green-600', label: 'Eccellente' };
      if (value <= 20) return { color: 'text-yellow-600', label: 'Buono' };
      if (value <= 30) return { color: 'text-orange-600', label: 'Accettabile' };
      return { color: 'text-red-600', label: 'Scarso' };
    }
    return { color: 'text-gray-600', label: '-' };
  };

  const chartData = observedData.map(d => ({
    day: d.day,
    Osservato: selectedMetric === 'biomass' ? d.biomass_obs : d.lai_obs,
    Simulato: selectedMetric === 'biomass' ? d.biomass_sim : d.lai_sim
  }));

  const scatterData = observedData.map(d => ({
    osservato: selectedMetric === 'biomass' ? d.biomass_obs : d.lai_obs,
    simulato: selectedMetric === 'biomass' ? d.biomass_sim : d.lai_sim
  }));

  return (
    <div className="space-y-6">
      <Card title="Validazione del Modello">
        <p className="text-gray-700 mb-4">
          Questa sezione permette di validare le simulazioni confrontandole con dati osservati.
          I dati "osservati" sono generati sinteticamente aggiungendo rumore ai risultati simulati.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-yellow-600 mt-0.5" size={18} />
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> In un contesto reale, i dati osservati provengono da esperimenti di campo o letteratura scientifica.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controlli */}
        <Card title="Configurazione Validazione">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variabile da Validare
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as 'biomass' | 'lai')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="biomass">Biomassa (kg/ha)</option>
                <option value="lai">LAI (m²/m²)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Livello di Rumore (σ)
              </label>
              <Slider
                label="Rumore Osservazioni"
                value={noiseLevel}
                min={0}
                max={500}
                step={10}
                onChange={setNoiseLevel}
                unit="kg/ha"
                description="Simula l'incertezza nelle misurazioni sperimentali"
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-3">Metriche di Validazione</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">RMSE:</span>
                  <span className="font-semibold">
                    {selectedMetric === 'biomass' 
                      ? `${metrics.rmse.toFixed(1)} kg/ha`
                      : `${metrics.rmse.toFixed(3)} m²/m²`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">R²:</span>
                  <span className={`font-semibold ${getMetricQuality('r2', metrics.r2).color}`}>
                    {metrics.r2.toFixed(3)} 
                    <span className="text-xs ml-1">({getMetricQuality('r2', metrics.r2).label})</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">nRMSE:</span>
                  <span className={`font-semibold ${getMetricQuality('nrmse', metrics.nrmse).color}`}>
                    {metrics.nrmse.toFixed(1)}%
                    <span className="text-xs ml-1">({getMetricQuality('nrmse', metrics.nrmse).label})</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">MAE:</span>
                  <span className="font-semibold">
                    {selectedMetric === 'biomass' 
                      ? `${metrics.mae.toFixed(1)} kg/ha`
                      : `${metrics.mae.toFixed(3)} m²/m²`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bias:</span>
                  <span className={`font-semibold ${metrics.bias > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedMetric === 'biomass' 
                      ? `${metrics.bias > 0 ? '+' : ''}${metrics.bias.toFixed(1)} kg/ha`
                      : `${metrics.bias > 0 ? '+' : ''}${metrics.bias.toFixed(3)} m²/m²`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Grafici */}
        <div className="lg:col-span-2 space-y-6">
          <Card title={`Confronto Temporale: ${selectedMetric === 'biomass' ? 'Biomassa' : 'LAI'}`}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  label={{ value: `Giorno (Semina: giorno ${sowingDay})`, position: 'insideBottom', offset: 0 }} 
                />
                <YAxis label={{ value: selectedMetric === 'biomass' ? 'Biomassa (kg/ha)' : 'LAI (m²/m²)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Osservato" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Simulato" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Scatter Plot: Osservato vs Simulato">
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="osservato" 
                  name="Osservato"
                  label={{ value: selectedMetric === 'biomass' ? 'Biomassa Osservata (kg/ha)' : 'LAI Osservato (m²/m²)', position: 'insideBottom', offset: 0 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="simulato" 
                  name="Simulato"
                  label={{ value: selectedMetric === 'biomass' ? 'Biomassa Simulata (kg/ha)' : 'LAI Simulato (m²/m²)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={scatterData} fill="#3b82f6" />
                {/* Linea 1:1 */}
                <Line 
                  type="linear" 
                  dataKey="osservato" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-2">
              La linea rossa tratteggiata rappresenta la perfetta corrispondenza (1:1). 
              I punti dovrebbero distribuirsi lungo questa linea per un buon adattamento.
            </p>
          </Card>
        </div>
      </div>

      {/* Interpretazione Metriche */}
      <Card title="Interpretazione delle Metriche" className="bg-blue-50 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">RMSE (Root Mean Square Error)</h4>
            <p className="text-blue-800">
              Misura l'errore medio tra osservazioni e simulazioni. Valori più bassi indicano migliore adattamento.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">R² (Coefficiente di Determinazione)</h4>
            <p className="text-blue-800">
              Indica la proporzione di varianza spiegata dal modello. R² {'>'} 0.7 è generalmente considerato buono.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">nRMSE (Normalized RMSE)</h4>
            <p className="text-blue-800">
              RMSE normalizzato rispetto alla media. nRMSE {'<'} 20% è generalmente accettabile per modelli colturali.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Bias</h4>
            <p className="text-blue-800">
              Differenza sistematica tra simulazioni e osservazioni. Bias positivo = sovrastima, negativo = sottostima.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

