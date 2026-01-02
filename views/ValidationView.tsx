import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter } from 'recharts';
import { Card, Button, Slider } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { Download, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface ValidationMetrics {
  rmse: number;
  r2: number;
  nrmse: number;
  mae: number;
  bias: number;
}

export const ValidationView: React.FC = () => {
  const { simulationResults, cropParams, weatherParams, getCurrentCropSowingDay } = useSimulation();
  const { t } = useI18n();
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
      if (value >= 0.9) return { color: 'text-green-600', label: t.validation.excellent };
      if (value >= 0.7) return { color: 'text-yellow-600', label: t.validation.good };
      if (value >= 0.5) return { color: 'text-orange-600', label: t.validation.acceptable };
      return { color: 'text-red-600', label: t.validation.poor };
    }
    if (metric === 'nrmse') {
      if (value <= 10) return { color: 'text-green-600', label: t.validation.excellent };
      if (value <= 20) return { color: 'text-yellow-600', label: t.validation.good };
      if (value <= 30) return { color: 'text-orange-600', label: t.validation.acceptable };
      return { color: 'text-red-600', label: t.validation.poor };
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
      <Card title={t.validation.title}>
        <p className="text-gray-700 mb-4">
          {t.validation.description}
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-yellow-600 mt-0.5" size={18} />
            <p className="text-sm text-yellow-800">
              <strong>{t.common.warning}:</strong> {t.validation.note}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controlli */}
        <Card title={t.validation.title}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.validation.variableToValidate}
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as 'biomass' | 'lai')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="biomass">{t.validation.biomass} (kg/ha)</option>
                <option value="lai">LAI (m²/m²)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.validation.noiseLevel}
              </label>
              <Slider
                label={t.validation.noiseLevel}
                value={noiseLevel}
                min={0}
                max={500}
                step={10}
                onChange={setNoiseLevel}
                unit="kg/ha"
                description={t.validation.noiseLevel}
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-900 mb-3">{t.validation.metrics}</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.validation.rmse}</span>
                  <span className="font-semibold">
                    {selectedMetric === 'biomass' 
                      ? `${metrics.rmse.toFixed(1)} kg/ha`
                      : `${metrics.rmse.toFixed(3)} m²/m²`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.validation.r2}</span>
                  <span className={`font-semibold ${getMetricQuality('r2', metrics.r2).color}`}>
                    {metrics.r2.toFixed(3)} 
                    <span className="text-xs ml-1">({getMetricQuality('r2', metrics.r2).label})</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.validation.nrmse}</span>
                  <span className={`font-semibold ${getMetricQuality('nrmse', metrics.nrmse).color}`}>
                    {metrics.nrmse.toFixed(1)}%
                    <span className="text-xs ml-1">({getMetricQuality('nrmse', metrics.nrmse).label})</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.validation.mae}</span>
                  <span className="font-semibold">
                    {selectedMetric === 'biomass' 
                      ? `${metrics.mae.toFixed(1)} kg/ha`
                      : `${metrics.mae.toFixed(3)} m²/m²`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t.validation.bias}</span>
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
          <Card title={`${t.validation.temporalComparison} ${selectedMetric === 'biomass' ? t.validation.biomass : 'LAI'}`}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="day" 
                  label={{ value: `${t.validation.sowingDay} ${sowingDay})`, position: 'insideBottom', offset: -5 }} 
                />
                <YAxis label={{ value: selectedMetric === 'biomass' ? `${t.validation.biomass} (kg/ha)` : 'LAI (m²/m²)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={t.validation.observed} stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey={t.validation.simulated} stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card title={t.validation.scatterPlot}>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="osservato" 
                  name={t.validation.observed}
                  label={{ value: selectedMetric === 'biomass' ? `${t.validation.observed} ${t.validation.biomass} (kg/ha)` : `${t.validation.observed} LAI (m²/m²)`, position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="simulato" 
                  name={t.validation.simulated}
                  label={{ value: selectedMetric === 'biomass' ? `${t.validation.simulated} ${t.validation.biomass} (kg/ha)` : `${t.validation.simulated} LAI (m²/m²)`, angle: -90, position: 'insideLeft' }}
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
              {t.validation.scatterPlotDesc}
            </p>
          </Card>
        </div>
      </div>

      {/* Interpretazione Metriche */}
      <Card title={t.validation.interpretation} className="bg-blue-50 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">RMSE (Root Mean Square Error)</h4>
            <p className="text-blue-800">
              {t.validation.rmseDesc}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">R² (Coefficiente di Determinazione)</h4>
            <p className="text-blue-800">
              {t.validation.r2Desc}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">nRMSE (Normalized RMSE)</h4>
            <p className="text-blue-800">
              {t.validation.nrmseDesc}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">Bias</h4>
            <p className="text-blue-800">
              {t.validation.biasDesc}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

