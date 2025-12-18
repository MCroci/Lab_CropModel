import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { Card, Slider, DownloadAction } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { BookOpen, Clock } from 'lucide-react';

// Visualizzazione del "Secchio" (Bucket) del suolo
const SoilBucket: React.FC<{ currentW: number; maxW: number; wp: number; fc: number; sat: number }> = ({ currentW, maxW, wp, fc, sat }) => {
  const percentage = Math.min((currentW / sat) * 100, 100);
  const fcPerc = (fc / sat) * 100;
  const wpPerc = (wp / sat) * 100;

  return (
    <div className="relative w-full h-64 bg-gray-100 rounded-b-xl border-x-4 border-b-4 border-gray-400 mx-auto max-w-[200px] overflow-hidden">
      {/* Water Level */}
      <div 
        className="absolute bottom-0 w-full transition-all duration-300 ease-out bg-blue-500/80"
        style={{ height: `${percentage}%` }}
      >
        <div className="absolute top-0 w-full h-2 bg-blue-400 animate-pulse"></div>
      </div>

      {/* Markers */}
      <div className="absolute w-full border-t border-dashed border-red-500" style={{ bottom: `${wpPerc}%` }}>
        <span className="absolute right-1 -top-5 text-xs text-red-600 font-bold bg-white/80 px-1 rounded">WP ({wp})</span>
      </div>
      <div className="absolute w-full border-t-2 border-green-600" style={{ bottom: `${fcPerc}%` }}>
         <span className="absolute right-1 -top-5 text-xs text-green-700 font-bold bg-white/80 px-1 rounded">FC ({fc})</span>
      </div>
      <div className="absolute w-full border-t border-blue-800 top-0">
         <span className="absolute left-1 top-1 text-xs text-blue-900 font-bold bg-white/80 px-1 rounded">SAT ({sat})</span>
      </div>

      {/* Current Value */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-white drop-shadow-md">{currentW.toFixed(0)} mm</span>
      </div>
    </div>
  );
};

export const WaterView: React.FC = () => {
  const { soilParams, setSoilParams, waterResults, runSimulation } = useSimulation();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(-1);

  // Re-run on soil param change
  useEffect(() => {
    const timer = setTimeout(() => {
        runSimulation();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soilParams]);

  // Update selection when results change
  useEffect(() => {
    if (waterResults.length > 0 && selectedDayIndex === -1) {
        setSelectedDayIndex(waterResults.length - 1);
    }
  }, [waterResults, selectedDayIndex]);

  // Determina quale step mostrare
  const safeIndex = (selectedDayIndex >= 0 && selectedDayIndex < waterResults.length) 
    ? selectedDayIndex 
    : waterResults.length - 1;
    
  const currentStep = waterResults[safeIndex] || { W: 0, day: 0, ARID: 0 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Visualizzazione Suolo">
             <div className="flex justify-center py-4 bg-gray-50 rounded-lg border border-gray-100 mb-4">
                <SoilBucket 
                  currentW={currentStep.W} 
                  maxW={soilParams.W_sat} 
                  wp={soilParams.W_wp} 
                  fc={soilParams.W_fc} 
                  sat={soilParams.W_sat} 
                />
             </div>
             
             {/* Scrubber Giorno */}
             <div className="bg-white p-3 rounded border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Clock size={16} className="text-brand-600"/>
                        Giorno {currentStep.day}
                    </div>
                    <div className="text-xs text-gray-500">
                        Stress: <span className={currentStep.ARID > 0 ? "text-red-600 font-bold" : "text-green-600"}>{currentStep.ARID.toFixed(2)}</span>
                    </div>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max={Math.max(0, waterResults.length - 1)} 
                    value={safeIndex} 
                    onChange={(e) => setSelectedDayIndex(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <p className="text-center text-xs text-gray-400 mt-1">Trascina per vedere l'evoluzione nel tempo</p>
             </div>
          </Card>

          <Card title="Parametri Idrologici Suolo">
            <Slider 
              label="W Iniziale" value={soilParams.W0} min={0} max={250} step={5} unit="mm"
              onChange={v => setSoilParams(p => ({...p, W0: v}))} 
              description="Contenuto idrico iniziale."
            />
            <Slider 
              label="Punto Appassimento (WP)" value={soilParams.W_wp} min={0} max={150} step={5} unit="mm"
              onChange={v => setSoilParams(p => ({...p, W_wp: v}))} 
              description="Acqua non disponibile alla pianta."
            />
            <Slider 
              label="Capacità di Campo (FC)" value={soilParams.W_fc} min={50} max={250} step={5} unit="mm"
              onChange={v => setSoilParams(p => ({...p, W_fc: v}))} 
              description="Massima acqua trattenuta contro gravità."
            />
            <Slider 
              label="Saturazione (SAT)" value={soilParams.W_sat} min={150} max={350} step={5} unit="mm"
              onChange={v => setSoilParams(p => ({...p, W_sat: v}))} 
              description="Porosità totale."
            />
             <hr className="my-4"/>
            <Slider 
              label="ET0 (Evapotraspirazione)" value={soilParams.ET0} min={1} max={8} step={0.2} unit="mm/d"
              onChange={v => setSoilParams(p => ({...p, ET0: v}))} 
            />
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          
          <Card title="Teoria: Bilancio Idrico a Secchio" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400"/>}>
            <div className="prose prose-sm max-w-none text-slate-700">
              <p>
                Il suolo è modellato come un "serbatoio" (Tipping Bucket). 
                La variazione di acqua (Delta W) dipende dagli ingressi e dalle uscite:
              </p>
              <div className="bg-white p-2 rounded border border-slate-200 font-mono text-center my-2 text-xs text-slate-800">
                 W(t+1) = W(t) + Pioggia - Ruscellamento - ET_reale - Drenaggio
              </div>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li><strong>Capacità di Campo (FC):</strong> Il limite massimo che il suolo trattiene contro la gravità. L'eccesso drena via.</li>
                <li><strong>Punto di Appassimento (WP):</strong> Il limite minimo sotto il quale la pianta non riesce più ad estrarre acqua.</li>
                <li><strong>ARID (Indice di Aridità):</strong> Indice di stress (0-1). Se la pianta non riesce a soddisfare la domanda evapotraspirativa (ET_0), va in stress (ARID &gt; 0).</li>
              </ul>
            </div>
          </Card>

          <Card 
            title="Bilancio Idrico e Stress"
            headerAction={<DownloadAction data={waterResults} filename="bilancio_idrico.csv" />}
          >
            <div className="h-[400px] w-full">
              <ResponsiveContainer>
                <LineChart data={waterResults} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: -5 }} />
                  
                  {/* Asse Sinistro: Acqua (mm) */}
                  <YAxis yAxisId="left" label={{ value: 'Acqua (mm)', angle: -90, position: 'insideLeft' }} />
                  
                  {/* Asse Destro: Stress (0-1) */}
                  <YAxis yAxisId="right" orientation="right" domain={[0, 1]} label={{ value: 'Indice Stress (0-1)', angle: 90, position: 'insideRight' }} />
                  
                  <Tooltip />
                  <Legend />

                  {/* Reference Line for selected day */}
                  <ReferenceLine x={currentStep.day} stroke="orange" strokeDasharray="3 3" label="Selezione" />
                  
                  <Line yAxisId="left" type="monotone" dataKey="W" stroke="#2563eb" strokeWidth={2} name="Acqua nel Suolo (W)" dot={false} />
                  <Line yAxisId="left" type="monotone" dataKey="RAIN" stroke="#60a5fa" strokeWidth={1} dot={false} name="Pioggia" opacity={0.5} />
                  <Line yAxisId="left" type="monotone" dataKey="DRAIN" stroke="#9ca3af" strokeWidth={1} dot={false} name="Drenaggio" strokeDasharray="3 3" />
                  
                  {/* Linea ARID mappata sull'asse destro */}
                  <Line yAxisId="right" type="monotone" dataKey="ARID" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={2} name="Indice Stress (ARID)" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-2 text-center">
              <strong>Asse Sinistro (Blu):</strong> Contenuto idrico e Pioggia. 
              <strong>Asse Destro (Rosso):</strong> Indice ARID (0 = No Stress, 1 = Stress Max).
            </p>
          </Card>
        </div>
      </div>

      <Card title="Tabella Bilancio Idrico">
        <div className="overflow-x-auto max-h-[300px]">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-medium sticky top-0">
              <tr>
                <th className="px-4 py-2">Giorno</th>
                <th className="px-4 py-2">Pioggia</th>
                <th className="px-4 py-2">Ruscell. (RO)</th>
                <th className="px-4 py-2">ET0</th>
                <th className="px-4 py-2">T_act</th>
                <th className="px-4 py-2">E_act</th>
                <th className="px-4 py-2">Drenaggio</th>
                <th className="px-4 py-2">W (mm)</th>
                <th className="px-4 py-2">ARID</th>
              </tr>
            </thead>
            <tbody>
              {waterResults.map((row, idx) => (
                <tr key={row.day} className={`border-b border-gray-100 hover:bg-gray-50 ${idx === safeIndex ? 'bg-orange-50 border-orange-200' : ''}`}>
                  <td className="px-4 py-2">{row.day}</td>
                  <td className="px-4 py-2">{row.RAIN.toFixed(1)}</td>
                  <td className="px-4 py-2">{row.RO.toFixed(1)}</td>
                  <td className="px-4 py-2">{row.ET0.toFixed(1)}</td>
                  <td className="px-4 py-2">{row.Tact.toFixed(2)}</td>
                  <td className="px-4 py-2">{row.Eact.toFixed(2)}</td>
                  <td className="px-4 py-2">{row.DRAIN.toFixed(1)}</td>
                  <td className="px-4 py-2 font-medium text-blue-600">{row.W.toFixed(1)}</td>
                  <td className="px-4 py-2">{row.ARID.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};