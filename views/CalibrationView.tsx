import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, Legend } from 'recharts';
import { Card, Button, Slider } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { CalibrationResult, SensitivityResult, CropParams } from '../types';
import { makeWeather, simulateCrop } from '../services/cropModel';

export const CalibrationView: React.FC = () => {
  const { weatherParams, cropParams } = useSimulation();

  // --- Calibration State ---
  const [obsSigma, setObsSigma] = useState(150);
  const [calParam, setCalParam] = useState<string>('RUE');
  const [syntheticObs, setSyntheticObs] = useState<{ day: number, B_obs: number }[] | null>(null);
  const [calResults, setCalResults] = useState<CalibrationResult[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);

  // --- Sensitivity State ---
  const [sensSpan, setSensSpan] = useState(20);
  const [sensResults, setSensResults] = useState<SensitivityResult[]>([]);

  // 1. Generate Observations
  const handleMakeObs = () => {
    // Generate a 'true' run
    const w = makeWeather(weatherParams);
    const res = simulateCrop(w, cropParams);
    
    // Add noise
    const obs = res.map(r => {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const noise = z * obsSigma;
      return { day: r.day, B_obs: r.B + noise };
    });
    setSyntheticObs(obs);
    setCalResults([]); // clear old results
  };

  // 2. Run Calibration (Grid Search)
  const handleRunCal = () => {
    if (!syntheticObs) return;
    setIsCalibrating(true);
    
    // Defer to allow UI update
    setTimeout(() => {
      const w = makeWeather(weatherParams);
      let grid: number[] = [];
      const base = { ...cropParams };
      
      switch (calParam) {
        case 'RUE': grid = Array.from({length: 38}, (_, i) => 0.8 + i * 0.1); break;
        case 'KPAR': grid = Array.from({length: 20}, (_, i) => 0.25 + i * 0.05); break;
        case 'LAIMX': grid = Array.from({length: 25}, (_, i) => 2 + i * 0.25); break;
        case 'tuHAR': grid = Array.from({length: 25}, (_, i) => 900 + i * 50); break;
        default: grid = [];
      }

      const results: CalibrationResult[] = grid.map(val => {
        const p = { ...base, [calParam]: val } as CropParams;
        const sim = simulateCrop(w, p);
        
        // Calculate RMSE
        let sse = 0;
        let count = 0;
        
        sim.forEach((s, idx) => {
          if (idx < syntheticObs.length) {
             const obs = syntheticObs[idx].B_obs;
             sse += Math.pow(s.B - obs, 2);
             count++;
          }
        });
        
        const rmse = Math.sqrt(sse / count);
        return { param: calParam, value: val, RMSE: rmse, B_final: sim[sim.length-1].B };
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
    
    // Base run
    const baseRun = simulateCrop(w, base);
    const baseB = baseRun[baseRun.length-1].B;
    
    const results: SensitivityResult[] = [];

    pars.forEach(pname => {
      const v0 = base[pname] as number;
      const vLow = v0 * (1 - span);
      const vHigh = v0 * (1 + span);

      // Low
      const runLow = simulateCrop(w, { ...base, [pname]: vLow } as CropParams);
      results.push({ param: pname, scenario: 'low', value: vLow, B_final: runLow[runLow.length-1].B });

      // Base
      results.push({ param: pname, scenario: 'base', value: v0, B_final: baseB });

      // High
      const runHigh = simulateCrop(w, { ...base, [pname]: vHigh } as CropParams);
      results.push({ param: pname, scenario: 'high', value: vHigh, B_final: runHigh[runHigh.length-1].B });
    });

    setSensResults(results);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Esercizio di Calibrazione">
          <p className="text-sm text-gray-600 mb-4">Genera delle "osservazioni" sintetiche (modello vero + rumore), poi usa una Grid Search per trovare il parametro che minimizza l'errore (RMSE).</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Rumore Sigma (g/m²)</label>
               <input type="number" value={obsSigma} onChange={e => setObsSigma(Number(e.target.value))} className="w-full border rounded p-2" />
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Parametro da Calibrare</label>
               <select value={calParam} onChange={e => setCalParam(e.target.value)} className="w-full border rounded p-2 bg-white">
                 <option value="RUE">RUE (Efficienza Radiazione)</option>
                 <option value="KPAR">KPAR (Coeff. Estinzione)</option>
                 <option value="LAIMX">LAIMX (LAI Massimo)</option>
                 <option value="tuHAR">tuHAR (Somma Termica)</option>
               </select>
             </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleMakeObs} variant="secondary">1. Genera Dati Osservati</Button>
            <Button onClick={handleRunCal} disabled={!syntheticObs || isCalibrating}>
              {isCalibrating ? 'Esecuzione...' : '2. Calibra (Trova Minimo)'}
            </Button>
          </div>
        </Card>

        <Card title="Risultati Calibrazione">
          {calResults.length > 0 ? (
             <div className="h-[250px] w-full">
               <ResponsiveContainer>
                 <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                   <CartesianGrid />
                   <XAxis type="number" dataKey="value" name={calParam} label={{ value: calParam, position: 'insideBottom', offset: -10 }} />
                   <YAxis type="number" dataKey="RMSE" name="RMSE" label={{ value: 'RMSE', angle: -90, position: 'insideLeft' }} />
                   <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                   <Scatter name="Grid Search" data={calResults} fill="#0ea5e9" line />
                 </ScatterChart>
               </ResponsiveContainer>
             </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              Nessun risultato
            </div>
          )}
        </Card>
      </div>

      <Card title="Analisi di Sensibilità (One-at-a-time)">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 max-w-xs">
            <Slider label="Variazione (%)" value={sensSpan} min={5} max={60} step={5} onChange={setSensSpan} />
          </div>
          <Button onClick={handleRunSens} variant="outline" className="mt-2">Esegui Analisi</Button>
        </div>

        {sensResults.length > 0 && (
          <div className="h-[400px] w-full">
             <ResponsiveContainer>
                <BarChart data={sensResults} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Biomassa Finale (g/m²)', position: 'insideBottom', offset: -5 }} domain={['auto', 'auto']} />
                  <YAxis dataKey="param" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="B_final" name="Biomassa Finale">
                    {sensResults.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.scenario === 'low' ? '#93c5fd' : 
                        entry.scenario === 'high' ? '#1e3a8a' : '#2563eb'
                      } />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
             <p className="text-center text-xs text-gray-500 mt-2">
               Azzurro: Basso (-{sensSpan}%), Blu Scuro: Alto (+{sensSpan}%), Blu Medio: Base.
             </p>
          </div>
        )}
      </Card>
    </div>
  );
};