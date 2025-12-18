import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, Slider, DownloadAction } from '../components/UI';
import { generateCO2Response, generateLightResponse } from '../services/farquharModel';
import { Microscope, BookOpen } from 'lucide-react';

export const FarquharView: React.FC = () => {
  // Parameters (Defaults from R script)
  const [vMax, setVMax] = useState(50);
  const [jMax, setJMax] = useState(100);
  const [temp, setTemp] = useState(25);

  const co2Data = useMemo(() => generateCO2Response(vMax, jMax, temp), [vMax, jMax, temp]);
  const lightData = useMemo(() => generateLightResponse(vMax, jMax, temp), [vMax, jMax, temp]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Parametri Fisiologici" className="border-t-4 border-t-emerald-600">
             <div className="space-y-6">
                <Slider 
                  label="Vmax (Rubisco)" 
                  value={vMax} min={10} max={150} step={5} 
                  onChange={setVMax} 
                  unit="µmol/m²/s"
                  description="Capacità massima di carbossilazione (limitata da Rubisco)."
                />
                
                <Slider 
                  label="Jmax (Trasporto Elettroni)" 
                  value={jMax} min={20} max={300} step={10} 
                  onChange={setJMax} 
                  unit="µmol/m²/s"
                  description="Tasso massimo di trasporto elettronico (limitato da luce/tilacoidi)."
                />
                
                <Slider 
                  label="Temperatura Fogliare" 
                  value={temp} min={5} max={45} step={1} 
                  onChange={setTemp} 
                  unit="°C"
                  description="Temperatura cinetica fogliare."
                />
             </div>
          </Card>

          <Card title="Dettagli Modello">
             <ul className="text-xs text-gray-500 space-y-2 list-disc list-inside">
               <li><strong>Modello:</strong> Farquhar-von Caemmerer-Berry (C3).</li>
               <li><strong>Limitazioni:</strong> Il tasso di fotosintesi è il minimo tra limitazione Rubisco (w_c), Luce (w_j) e Sink (w_s).</li>
               <li><strong>Respirazione:</strong> R_d è stimato come funzione della temperatura e V_max.</li>
             </ul>
          </Card>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card title="Risposta alla CO₂ (Curva A/Ci)" headerAction={<DownloadAction data={co2Data} filename="farquhar_co2.csv" />}>
            <div className="h-[250px] w-full">
              <ResponsiveContainer>
                <LineChart data={co2Data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="x" label={{ value: 'Intercellular CO₂ (ppm)', position: 'insideBottom', offset: -10 }} />
                  <YAxis label={{ value: 'An (µmol/m²/s)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip labelFormatter={(v) => `${v} ppm`} formatter={(v: number) => [v.toFixed(2), 'An']} />
                  <Line type="monotone" dataKey="y" stroke="#10b981" strokeWidth={3} dot={false} name="A_net" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Risposta alla Luce (Curva A/PAR)" headerAction={<DownloadAction data={lightData} filename="farquhar_light.csv" />}>
            <div className="h-[250px] w-full">
              <ResponsiveContainer>
                <LineChart data={lightData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="x" label={{ value: 'PPFD (µmol fotoni/m²/s)', position: 'insideBottom', offset: -10 }} />
                  <YAxis label={{ value: 'An (µmol/m²/s)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip labelFormatter={(v) => `${v} PPFD`} formatter={(v: number) => [v.toFixed(2), 'An']} />
                  <Line type="monotone" dataKey="y" stroke="#059669" strokeWidth={3} dot={false} name="A_net" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>
      </div>

      <Card title="Teoria: Modello Farquhar" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400"/>}>
        <div className="prose prose-sm max-w-none text-slate-700">
          <p>
            Il modello biochimico (Farquhar et al., 1980) calcola la fotosintesi netta (A_n) come il minimo di tre tassi limitanti, meno la respirazione mitocondriale (R_d).
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className="bg-white p-3 rounded border border-gray-200 text-center">
              <div className="font-bold text-xs text-gray-500 mb-1">Rubisco Limited (w_c)</div>
              <div className="font-mono text-sm">
                 {'$w_c = \\frac{V_{max}(c_i - \\Gamma^*)}{c_i + K_c(1 + O_i/K_o)}$'}
              </div>
              <div className="text-xs text-gray-400 mt-1">Limitata da bassa CO₂</div>
            </div>

            <div className="bg-white p-3 rounded border border-gray-200 text-center">
               <div className="font-bold text-xs text-gray-500 mb-1">Light Limited (w_j)</div>
               <div className="font-mono text-sm">
                 {'$w_j = \\frac{J(c_i - \\Gamma^*)}{4(c_i + 2\\Gamma^*)}$'}
               </div>
               <div className="text-xs text-gray-400 mt-1">Limitata da bassa Luce</div>
            </div>

            <div className="bg-white p-3 rounded border border-gray-200 text-center">
               <div className="font-bold text-xs text-gray-500 mb-1">Sink Limited (w_s)</div>
               <div className="font-mono text-sm">
                 {'$w_s = \\frac{V_{max}}{2}$'}
               </div>
               <div className="text-xs text-gray-400 mt-1">Utilizzo Triosi Fosfati (TPU)</div>
            </div>
          </div>

          <p className="text-xs">
            Dove c_i è la pressione parziale di CO₂ intercellulare, Gamma* il punto di compensazione, e J il tasso di trasporto elettronico dipendente dalla luce.
          </p>
        </div>
      </Card>
    </div>
  );
};