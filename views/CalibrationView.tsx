import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, Legend, LineChart, Line, ReferenceLine } from 'recharts';
import { Card, Button, Slider } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { CalibrationResult, SensitivityResult, CropParams } from '../types';
import { makeWeather, simulateCrop } from '../services/cropModel';
import { DailyWeather } from '../types';
import { MathFormula } from '../components/MathFormula';
import { CHART_MARGIN } from '../utils/chartMargins';
import { CheckCircle2, ArrowRight, BookOpen, Lightbulb } from 'lucide-react';

interface CalibrationViewProps {
  onNavigate?: (tab: string) => void;
}

const PARAM_LABELS: Record<string, string> = {
  RUE: 'RUE (g/MJ)',
  KPAR: 'KPAR (adim.)',
  LAIMX: 'LAIMX (m²/m²)',
  tuHAR: 'tuHAR (°C giorno)'
};

export const CalibrationView: React.FC<CalibrationViewProps> = ({ onNavigate }) => {
  const { weatherParams, cropParams } = useSimulation();

  // --- Calibration State ---
  const [obsSigma, setObsSigma] = useState(150);
  const [calParam, setCalParam] = useState<string>('RUE');
  const [syntheticObs, setSyntheticObs] = useState<{ day: number, B_obs: number }[] | null>(null);
  const [syntheticWeather, setSyntheticWeather] = useState<DailyWeather[] | null>(null);
  const [trueParamValue, setTrueParamValue] = useState<number | null>(null);
  const [calResults, setCalResults] = useState<CalibrationResult[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // --- Sensitivity State ---
  const [sensSpan, setSensSpan] = useState(20);
  const [sensResults, setSensResults] = useState<SensitivityResult[]>([]);
  const [sensIndices, setSensIndices] = useState<{ param: string; index: number }[]>([]);

  // Workflow step tracking
  const step1Done = !!syntheticObs;
  const step2Done = calResults.length > 0;

  // 1. Generate Observations (usa stessa weather per calibrazione)
  const handleMakeObs = () => {
    const w = makeWeather(weatherParams);
    setSyntheticWeather(w);
    const res = simulateCrop(w, cropParams);
    const trueVal = cropParams[calParam as keyof CropParams] as number;
    setTrueParamValue(trueVal);

    const obs = res.map(r => {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const noise = z * obsSigma;
      return { day: r.day, B_obs: Math.max(0, r.B + noise) };
    });
    setSyntheticObs(obs);
    setCalResults([]);
  };

  // 2. Run Calibration (Grid Search) - usa stessa weather delle osservazioni
  const handleRunCal = () => {
    if (!syntheticObs) return;
    const w = syntheticWeather ?? makeWeather(weatherParams);
    setIsCalibrating(true);
    setTimeout(() => {
      let grid: number[] = [];
      const base = { ...cropParams };

      switch (calParam) {
        case 'RUE': grid = Array.from({ length: 38 }, (_, i) => 0.8 + i * 0.1); break;
        case 'KPAR': grid = Array.from({ length: 20 }, (_, i) => 0.25 + i * 0.05); break;
        case 'LAIMX': grid = Array.from({ length: 25 }, (_, i) => 2 + i * 0.25); break;
        case 'tuHAR': grid = Array.from({ length: 25 }, (_, i) => 900 + i * 50); break;
        default: grid = [];
      }

      const results: CalibrationResult[] = grid.map(val => {
        const p = { ...base, [calParam]: val } as CropParams;
        const sim = simulateCrop(w, p);
        let sse = 0;
        let count = 0;
        sim.forEach((s, idx) => {
          if (idx < syntheticObs.length) {
            const obsVal = syntheticObs[idx].B_obs;
            sse += Math.pow(s.B - obsVal, 2);
            count++;
          }
        });
        const rmse = Math.sqrt(sse / count);
        return { param: calParam, value: val, RMSE: rmse, B_final: sim[sim.length - 1].B };
      });

      setCalResults(results);
      setIsCalibrating(false);
    }, 100);
  };

  // 3. Sensitivity Analysis
  const handleRunSens = () => {
    const w = makeWeather(weatherParams);
    const base = { ...cropParams };
    const span = sensSpan / 100;
    const pars: (keyof CropParams)[] = ["RUE", "KPAR", "LAIMX", "tuHAR", "Tbase", "ALPHA"];

    const baseRun = simulateCrop(w, base);
    const baseB = baseRun[baseRun.length - 1].B;

    const results: SensitivityResult[] = [];
    const indices: { param: string; index: number }[] = [];

    pars.forEach(pname => {
      const v0 = base[pname] as number;
      const vLow = v0 * (1 - span);
      const vHigh = v0 * (1 + span);

      const runLow = simulateCrop(w, { ...base, [pname]: vLow } as CropParams);
      const runHigh = simulateCrop(w, { ...base, [pname]: vHigh } as CropParams);
      const B_low = runLow[runLow.length - 1].B;
      const B_high = runHigh[runHigh.length - 1].B;

      results.push({ param: pname, scenario: 'low', value: vLow, B_final: B_low });
      results.push({ param: pname, scenario: 'base', value: v0, B_final: baseB });
      results.push({ param: pname, scenario: 'high', value: vHigh, B_final: B_high });

      const deltaB = Math.max(Math.abs(B_high - baseB), Math.abs(baseB - B_low));
      const sensIndex = baseB > 0 ? (deltaB / baseB) / span : 0;
      indices.push({ param: pname, index: sensIndex });
    });

    indices.sort((a, b) => b.index - a.index);
    setSensIndices(indices);
    setSensResults(results);
  };

  const optimalResult = useMemo(() => {
    if (calResults.length === 0) return null;
    return calResults.reduce((a, b) => (a.RMSE < b.RMSE ? a : b));
  }, [calResults]);

  const optimalSimSeries = useMemo(() => {
    if (!optimalResult || !syntheticObs) return null;
    const w = syntheticWeather ?? makeWeather(weatherParams);
    const p = { ...cropParams, [calParam]: optimalResult.value } as CropParams;
    const sim = simulateCrop(w, p);
    return sim.map(s => ({ day: s.day, B: s.B }));
  }, [optimalResult, syntheticObs, syntheticWeather, weatherParams, cropParams, calParam]);

  const biomassChartData = useMemo(() => {
    if (!syntheticObs) return [];
    return syntheticObs.map(obs => {
      const simVal = optimalSimSeries?.find(s => s.day === obs.day)?.B ?? null;
      return {
        day: obs.day,
        Osservato: obs.B_obs,
        Simulato: simVal
      };
    });
  }, [syntheticObs, optimalSimSeries]);

  const showBiomassChart = biomassChartData.some(d => d.Simulato != null);

  return (
    <div className="space-y-6">
      {/* Introduzione e Obiettivi */}
      <Card title="Calibrazione dei Modelli Colturali" className="border-t-4 border-t-sky-600">
        <div className="space-y-4">
          <p className="text-gray-700">
            La <strong>calibrazione</strong> serve a stimare parametri non misurabili direttamente (es. RUE, KPAR) confrontando le uscite del modello con dati osservati. 
            Si differenzia dalla <strong>validazione</strong>, che verifica le prestazioni su dati indipendenti.
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-600">Obiettivi:</span>
            <span className="text-sm bg-sky-50 text-sky-800 px-2 py-1 rounded">Grid search</span>
            <span className="text-sm bg-sky-50 text-sky-800 px-2 py-1 rounded">Metrica RMSE</span>
            <span className="text-sm bg-sky-50 text-sky-800 px-2 py-1 rounded">Analisi di sensibilità</span>
            <span className="text-sm bg-sky-50 text-sky-800 px-2 py-1 rounded">Parametro ottimale</span>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${step1Done ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {step1Done ? <CheckCircle2 size={18} /> : <span className="w-[18px] text-center font-bold">1</span>}
              <span>Genera osservazioni</span>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded ${step2Done ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {step2Done ? <CheckCircle2 size={18} /> : <span className="w-[18px] text-center font-bold">2</span>}
              <span>Calibra (grid search)</span>
            </div>
            <ArrowRight size={16} className="text-gray-400" />
            <button
              type="button"
              onClick={() => onNavigate?.('validation')}
              className="flex items-center gap-2 px-3 py-1.5 rounded bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors"
            >
              <span className="font-medium">3. Valida</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </Card>

      {/* Formula RMSE */}
      <Card title="Metrica RMSE" className="bg-slate-50 border-slate-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm text-gray-600 mb-2">
              Il <strong>Root Mean Square Error</strong> misura l'errore medio tra osservazioni e simulazioni. 
              La calibrazione cerca il parametro che <strong>minimizza</strong> il RMSE.
            </p>
            <div className="text-lg">
              <MathFormula formula="\\text{RMSE} = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(B_{obs,i} - B_{sim,i})^2}" display />
            </div>
            <p className="text-xs text-gray-500 mt-2">RMSE è espresso nelle stesse unità della variabile (g/m² o kg/ha).</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Esercizio di Calibrazione">
          <p className="text-sm text-gray-600 mb-4">
            Genera "osservazioni" sintetiche (modello con parametro "vero" + rumore gaussiano), 
            poi usa una <strong>Grid Search</strong> per trovare il valore del parametro che minimizza il RMSE.
          </p>

          {trueParamValue != null && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-sm font-medium text-amber-800">
                Parametro "vero" usato per le osservazioni: {calParam} = {trueParamValue.toFixed(2)} {calParam === 'RUE' ? 'g/MJ' : calParam === 'tuHAR' ? '°C giorno' : ''}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rumore σ (g/m²)</label>
              <input
                type="number"
                value={obsSigma}
                onChange={e => setObsSigma(Number(e.target.value))}
                className="w-full border rounded p-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Simula incertezza nelle misurazioni</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parametro da Calibrare</label>
              <select
                value={calParam}
                onChange={e => {
                  setCalParam(e.target.value);
                  setSyntheticObs(null);
                  setSyntheticWeather(null);
                  setCalResults([]);
                  setTrueParamValue(null);
                }}
                className="w-full border rounded p-2 bg-white text-sm"
              >
                <option value="RUE">RUE (Efficienza Radiazione)</option>
                <option value="KPAR">KPAR (Coeff. Estinzione)</option>
                <option value="LAIMX">LAIMX (LAI Massimo)</option>
                <option value="tuHAR">tuHAR (Somma Termica)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleMakeObs} variant="secondary">1. Genera Dati Osservati</Button>
            <Button onClick={handleRunCal} disabled={!syntheticObs || isCalibrating}>
              {isCalibrating ? 'Esecuzione...' : '2. Calibra (Trova Minimo)'}
            </Button>
          </div>
        </Card>

        <Card title="Risultati Calibrazione">
          {calResults.length > 0 && optimalResult && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex flex-wrap gap-4 text-sm">
                <span>
                  <strong>Parametro calibrato:</strong> {calParam} = {optimalResult.value.toFixed(2)}
                </span>
                <span>
                  <strong>RMSE minimo:</strong> {optimalResult.RMSE.toFixed(1)} g/m²
                </span>
                {trueParamValue != null && (
                  <span className={Math.abs(optimalResult.value - trueParamValue) < 0.15 ? 'text-green-700' : 'text-amber-700'}>
                    Scostamento dal vero: {(optimalResult.value - trueParamValue).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}
          {calResults.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer>
                <ScatterChart margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="value" name={calParam} label={{ value: PARAM_LABELS[calParam] || calParam, position: 'insideBottom', offset: -10 }} />
                  <YAxis type="number" dataKey="RMSE" name="RMSE" label={{ value: 'RMSE (g/m²)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(val: number) => [val.toFixed(1), 'RMSE']} />
                  <Scatter data={calResults} fill="#0ea5e9" line>
                    {calResults.map((entry, idx) => (
                      <Cell
                        key={idx}
                        fill={optimalResult && entry.value === optimalResult.value ? '#059669' : '#0ea5e9'}
                        stroke={optimalResult && entry.value === optimalResult.value ? '#047857' : 'transparent'}
                        strokeWidth={2}
                      />
                    ))}
                  </Scatter>
                  {trueParamValue != null && (
                    <ReferenceLine x={trueParamValue} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'vero', position: 'top' }} />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Punto verde = valore ottimale. Linea tratteggiata arancione = valore "vero" (se visibile).
              </p>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              Genera osservazioni e avvia la calibrazione
            </div>
          )}
        </Card>
      </div>

      {/* Grafico Biomassa nel tempo: Osservato vs Simulato */}
      {showBiomassChart && (
        <Card title="Confronto Temporale: Osservato vs Simulato (Parametro Ottimale)">
          <p className="text-sm text-gray-600 mb-4">
            Confronto tra le osservazioni "sintetiche" e la simulazione ottenuta con il parametro calibrato.
          </p>
          <div className="h-[280px] w-full">
            <ResponsiveContainer>
              <LineChart data={biomassChartData} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" label={{ value: 'Giorno dall\'inizio anno', position: 'insideBottom', offset: 0 }} />
                <YAxis label={{ value: 'Biomassa (g/m²)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Osservato" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Simulato" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Analisi di Sensibilità */}
      <Card title="Analisi di Sensibilità (One-at-a-time)">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-start">
            <Lightbulb className="text-amber-500 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-gray-700">
                Si varia <strong>un solo parametro alla volta</strong> di ±{sensSpan}% e si osserva l'effetto sulla biomassa finale. 
                I parametri più sensibili sono prioritari per la calibrazione.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Slider label="Variazione (%)" value={sensSpan} min={5} max={60} step={5} onChange={setSensSpan} />
            </div>
            <Button onClick={handleRunSens} variant="outline">Esegui Analisi</Button>
          </div>

          {sensIndices.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Indice di sensibilità (variazione relativa biomassa / variazione relativa parametro)</h4>
              <div className="flex flex-wrap gap-2">
                {sensIndices.map(({ param, index }, i) => (
                  <span
                    key={param}
                    className={`text-sm px-2 py-1 rounded ${i === 0 ? 'bg-amber-100 text-amber-800' : i < 3 ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600'}`}
                    title={`Parametro ${param}: indice ${index.toFixed(2)}`}
                  >
                    {param}: {index.toFixed(2)}{i === 0 ? ' (più sensibile)' : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {sensResults.length > 0 && (
          <>
            <div className="h-[400px] w-full mt-4">
              <ResponsiveContainer>
                <BarChart data={sensResults} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Biomassa Finale (g/m²)', position: 'insideBottom', offset: -5 }} domain={['auto', 'auto']} />
                  <YAxis dataKey="param" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="B_final" name="Biomassa Finale">
                    {sensResults.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.scenario === 'low' ? '#93c5fd' :
                            entry.scenario === 'high' ? '#1e3a8a' : '#2563eb'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              Azzurro: Basso (-{sensSpan}%), Blu Scuro: Alto (+{sensSpan}%), Blu Medio: Base.
            </p>
          </>
        )}
      </Card>

      {/* Link a Validazione e Manuale */}
      <div className="flex flex-wrap gap-4 justify-center text-sm">
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('validation')}
            className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium"
          >
            <CheckCircle2 size={18} />
            Vai alla Validazione
          </button>
        )}
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('manuale')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
          >
            <BookOpen size={18} />
            Manuale (Sez. 12)
          </button>
        )}
      </div>
    </div>
  );
};
