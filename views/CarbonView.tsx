import React, { useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Card, Slider, DownloadAction } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { Sprout, Tractor, Leaf, RotateCcw, Settings, BookOpen } from 'lucide-react';
import { RotationType } from '../types';

export const CarbonView: React.FC = () => {
  const { 
    soilParams, setSoilParams, 
    carbonParams, setCarbonParams, 
    carbonResults, baselineCarbonResults, 
    runSimulation 
  } = useSimulation();

  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soilParams, carbonParams]);

  const chartData = carbonResults.map((d, i) => ({
    year: d.year + (d.month/12),
    Scenario_SOC: d.TotalSOC,
    Baseline_SOC: baselineCarbonResults[i]?.TotalSOC || 0,
    HUM: d.HUM,
    RPM: d.RPM,
    BIO: d.BIO,
    DPM: d.DPM
  }));

  const finalDiff = carbonResults.length > 0 
    ? carbonResults[carbonResults.length - 1].TotalSOC - baselineCarbonResults[baselineCarbonResults.length - 1].TotalSOC
    : 0;

  const toggleParam = (key: keyof typeof carbonParams) => {
    // @ts-ignore
    setCarbonParams(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Controls Column */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* System & Rotation */}
        <Card title="Sistema & Rotazioni" className="border-t-4 border-t-blue-600">
           <div className="mb-5">
             <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
               <Settings size={16}/> Condizioni Iniziali
             </label>
             <div className="space-y-4">
                <Slider 
                  label="SOC Iniziale (Mg/ha)" 
                  value={soilParams.initial_soc} min={20} max={100} step={1} 
                  onChange={(v) => setSoilParams({...soilParams, initial_soc: v})} 
                  unit="Mg"
                  description="Stock di Carbonio Organico nel suolo all'inizio della simulazione."
                />
                <Slider 
                  label="Argilla (%)" 
                  value={soilParams.clay_percent} min={5} max={60} step={1} 
                  onChange={(v) => setSoilParams({...soilParams, clay_percent: v})} 
                  unit="%"
                  description="Percentuale di argilla. Protegge il carbonio dalla decomposizione."
                />
             </div>
           </div>
           
           <div className="pt-4 border-t border-gray-100">
             <label className="block text-sm font-medium text-gray-700 mb-2">Rotazione Colturale</label>
             <select 
               value={carbonParams.rotation}
               onChange={(e) => setCarbonParams({...carbonParams, rotation: e.target.value as RotationType})}
               className="w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
             >
               <option value="Pomodoro - Frumento granella">Pomodoro - Frumento granella</option>
               <option value="Pomodoro - Frumento gr - Mais gr">Pomodoro - Frumento gr - Mais gr</option>
               <option value="Pomodoro - Frumento gr - Mais tr">Pomodoro - Frumento gr - Mais tr</option>
               <option value="Pomodoro - Frumento gr - Soia">Pomodoro - Frumento gr - Soia</option>
               <option value="Pomodoro - Frumento gr - Sorgo">Pomodoro - Frumento gr - Sorgo</option>
               <option value="Pomodoro - Frumento gr - Barbabietola">Pomodoro - Frumento gr - Barbabietola</option>
               <option value="Pomodoro - Frumento - Medica (3y)">Pomodoro - Frumento - Medica (3y)</option>
             </select>
             <p className="text-xs text-gray-500 mt-2">
               Seleziona la sequenza colturale. I residui (Biomassa) sono stimati in base a valori tipici per queste colture.
             </p>
           </div>
        </Card>

        {/* Regenerative Practices */}
        <Card title="Pratiche Rigenerative" className="border-t-4 border-t-emerald-600">
          <div className="space-y-3">
            <button 
              onClick={() => toggleParam('isMinimumTillage')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${carbonParams.isMinimumTillage ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <Tractor size={20} />
                <div className="text-left">
                  <div className="font-semibold">Minima Lavorazione</div>
                  <div className="text-xs text-gray-500">Rallenta ossidazione</div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border ${carbonParams.isMinimumTillage ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}></div>
            </button>

            <button 
              onClick={() => toggleParam('hasCoverCrops')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${carbonParams.hasCoverCrops ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <Sprout size={20} />
                <div className="text-left">
                  <div className="font-semibold">Cover Crops</div>
                  <div className="text-xs text-gray-500">Input C Invernale</div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border ${carbonParams.hasCoverCrops ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}></div>
            </button>

            <button 
              onClick={() => toggleParam('incorporateResidues')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${carbonParams.incorporateResidues ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <RotateCcw size={20} />
                <div className="text-left">
                  <div className="font-semibold">Interramento Residui</div>
                  <div className="text-xs text-gray-500">Restituzione al suolo</div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border ${carbonParams.incorporateResidues ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}></div>
            </button>

            <button 
              onClick={() => toggleParam('addManure')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${carbonParams.addManure ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <Leaf size={20} />
                <div className="text-left">
                  <div className="font-semibold">Ammendanti Organici</div>
                  <div className="text-xs text-gray-500">+Letame/Compost</div>
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border ${carbonParams.addManure ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}></div>
            </button>
          </div>
        </Card>

        {/* Note Box */}
        <div className="bg-gray-100 p-4 rounded-lg text-xs text-gray-600">
           <strong>Nota Agrivoltaico:</strong> Per analizzare l'impatto dei pannelli solari sulla biomassa e l'acqua, visita la nuova sezione <strong>Agrivoltaico</strong> nel menu. Gli effetti sono inclusi qui se l'ombreggiamento è attivo.
        </div>
      </div>

      {/* Charts Column */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Results Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
               <div className="text-xs text-gray-500">SOC Iniziale</div>
               <div className="text-lg font-bold text-gray-800">{soilParams.initial_soc} <span className="text-xs font-normal">Mg/ha</span></div>
             </div>
             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
               <div className="text-xs text-gray-500">Baseline (20yr)</div>
               <div className="text-lg font-bold text-gray-800">{baselineCarbonResults[baselineCarbonResults.length-1]?.TotalSOC.toFixed(1)} <span className="text-xs font-normal">Mg/ha</span></div>
             </div>
             <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
               <div className="text-xs text-emerald-800">Scenario (20yr)</div>
               <div className="text-lg font-bold text-emerald-700">{carbonResults[carbonResults.length-1]?.TotalSOC.toFixed(1)} <span className="text-xs font-normal">Mg/ha</span></div>
             </div>
             <div className={`p-4 rounded-xl border shadow-sm ${finalDiff >= 0 ? 'bg-emerald-100 border-emerald-300' : 'bg-red-50 border-red-200'}`}>
               <div className={`text-xs ${finalDiff >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>Delta Netto</div>
               <div className={`text-lg font-bold ${finalDiff >= 0 ? 'text-emerald-800' : 'text-red-700'}`}>
                 {finalDiff > 0 ? '+' : ''}{finalDiff.toFixed(2)} <span className="text-xs font-normal">Mg/ha</span>
               </div>
             </div>
        </div>

        <Card title="Teoria: Modello RothC" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400"/>}>
          <div className="prose prose-sm max-w-none text-slate-700">
            <p>
              La dinamica del carbonio è simulata usando il modello Rothamsted Carbon (RothC), che divide il C organico in pool con diverse velocità di decomposizione:
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 mt-2">
              <li><strong>DPM (Decomposable Plant Material):</strong> Residui facilmente degradabili (es. foglie).</li>
              <li><strong>RPM (Resistant Plant Material):</strong> Residui legnosi (es. lignina).</li>
              <li><strong>BIO (Biomass):</strong> Microorganismi del suolo.</li>
              <li><strong>HUM (Humus):</strong> Carbonio stabile a lento rilascio (decenni/secoli).</li>
              <li>Pratiche rigenerative (cover crops, letame) aumentano l'input; la minima lavorazione riduce la velocità di ossidazione.</li>
            </ul>
          </div>
        </Card>

        <Card 
          title="Confronto: Baseline vs. Scenario Rigenerativo"
          headerAction={<DownloadAction data={chartData} filename="carbonio_confronto.csv" />}
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="year" type="number" domain={['auto', 'auto']} label={{ value: 'Anno', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'SOC (Mg C/ha)', angle: -90, position: 'insideLeft' }} domain={['auto', 'auto']} />
                <Tooltip 
                  formatter={(value: number) => value.toFixed(2)}
                  labelFormatter={(label: number) => `Anno ${Math.floor(label)}`}
                />
                <Legend />
                <Line type="monotone" dataKey="Baseline_SOC" stroke="#94a3b8" strokeWidth={2} name="Baseline (Conv.)" dot={false} />
                <Line type="monotone" dataKey="Scenario_SOC" stroke="#059669" strokeWidth={3} name="Scenario Rigenerativo" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <strong>Baseline:</strong> Rotazione selezionata, Aratura classica, No Cover Crops, Residui Interrati (Standard).
          </div>
        </Card>

        <Card title="Dinamica Pool Carbonio (Scenario)">
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="year" />
                <YAxis label={{ value: 'Mg C/ha', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number) => value.toFixed(2)} />
                <Legend />
                <Area type="monotone" dataKey="HUM" stackId="1" stroke="#3f3f46" fill="#52525b" name="Humus (HUM)" />
                <Area type="monotone" dataKey="RPM" stackId="1" stroke="#a1a1aa" fill="#d4d4d8" name="Res. Plant Mat. (RPM)" />
                <Area type="monotone" dataKey="BIO" stackId="1" stroke="#22c55e" fill="#86efac" name="Biomassa Microbica (BIO)" />
                <Area type="monotone" dataKey="DPM" stackId="1" stroke="#fbbf24" fill="#fde68a" name="Dec. Plant Mat. (DPM)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};