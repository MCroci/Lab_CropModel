
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Area, AreaChart } from 'recharts';
import { Card, Slider, Button } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { simulateSoilWater } from '../services/cropModel';
import { simulateEmergence, GerminationParams } from '../services/emergenceModel';
import { Sprout, Sun, Droplet, Thermometer, BookOpen, GitCompare } from 'lucide-react';

export const SeedEmergenceView: React.FC = () => {
  const { dailyWeather, soilParams, carbonParams } = useSimulation();

  // Germination Parameters State
  const [germParams, setGermParams] = useState<GerminationParams>({
    Tbase: 6,
    Topt: 20,
    Tceiling: 32,
    GDD_target: 120,
    theta_wilt_frac: 0.15, // Fraction of Saturation
    theta_opt_frac: 0.35
  });

  const [shading, setShading] = useState(carbonParams.agrivoltaicsShading > 0 ? carbonParams.agrivoltaicsShading : 30);

  // --- Run Simulation on the fly ---
  const data = useMemo(() => {
    if (dailyWeather.length === 0) return [];

    // 1. Water Balance Baseline (Open Field)
    const emptyLai = dailyWeather.map(() => 0); 
    const waterBase = simulateSoilWater(dailyWeather, soilParams, emptyLai);
    
    // 2. Water Balance Agrivoltaic
    const et0Factor = 1.0 - (shading / 100) * 0.3;
    const soilParamsAgri = { ...soilParams, ET0: soilParams.ET0 * et0Factor };
    const waterAgri = simulateSoilWater(dailyWeather, soilParamsAgri, emptyLai);

    // 3. Emergence Baseline (Open Field) - Returns Model 1 (GDD) & Model 2 (ETT)
    const emBase = simulateEmergence(dailyWeather, waterBase.map(w=>w.W), soilParams, germParams, 0);

    // 4. Emergence Agrivoltaic - Returns Model 1 & 2
    const emAgri = simulateEmergence(dailyWeather, waterAgri.map(w=>w.W), soilParams, germParams, shading / 100);

    // Merge
    return dailyWeather.map((d, i) => ({
      day: d.day,
      rain: d.RAIN,
      
      // Soil Temp
      Ts_Base: emBase[i].T_soil,
      Ts_Agri: emAgri[i].T_soil,

      // Soil Water
      W_Base: waterBase[i].W,
      W_Agri: waterAgri[i].W,

      // Model 1: GDD Cumulati (Simple)
      GDD_Cum_Base: emBase[i].GDD_cum,
      
      // Model 2: ETT Cumulati (Extended)
      ETT_Cum_Base: emBase[i].ETT_cum,
      ETT_Cum_Agri: emAgri[i].ETT_cum, // Used for Agrivoltaic comparison

      // Factors for debugging
      HydroFactor: emBase[i].HydroFactor
    }));
  }, [dailyWeather, soilParams, germParams, shading]);

  // Find Emergence Days
  const dayEmergenceModel1 = data.find(d => d.GDD_Cum_Base >= germParams.GDD_target)?.day;
  const dayEmergenceModel2 = data.find(d => d.ETT_Cum_Base >= germParams.GDD_target)?.day;
  const dayEmergenceAgri = data.find(d => d.ETT_Cum_Agri >= germParams.GDD_target)?.day;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Controls */}
      <div className="lg:col-span-1 space-y-6">
        <Card title="Parametri Germinazione">
          <div className="space-y-5">
             <Slider 
                label="T Base (°C)" value={germParams.Tbase} min={-5} max={30} step={0.5} 
                onChange={v => setGermParams(p => ({...p, Tbase: v}))}
                description="Tmin per accumulo termico."
             />
             <Slider 
                label="T Ottimale (°C)" value={germParams.Topt} min={10} max={50} step={0.5} 
                onChange={v => setGermParams(p => ({...p, Topt: v}))}
                description="T per massima velocità (solo Modello 2)."
             />
             <Slider 
                label="Target Cumulato" value={germParams.GDD_target} min={10} max={800} step={10} 
                onChange={v => setGermParams(p => ({...p, GDD_target: v}))}
                description="Soglia di accumulo per l'emergenza."
             />
          </div>
          <hr className="my-4 border-gray-100"/>
           <div className="space-y-5">
             <Slider 
                label="Soglia Idrica Min (Frac)" value={germParams.theta_wilt_frac} min={0.0} max={0.8} step={0.01} 
                onChange={v => setGermParams(p => ({...p, theta_wilt_frac: v}))}
                description="Solo Modello 2: Limite umidità."
             />
             <Slider 
                label="Ombreggiamento (%)" value={shading} min={0} max={100} step={1} 
                onChange={setShading}
                description="Per scenario Agrivoltaico."
             />
           </div>
        </Card>

        <Card title="Previsioni Emergenza (Pieno Campo)" className="border-t-4 border-purple-500">
           <div className="space-y-4">
              <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                 <div>
                   <div className="text-xs font-bold text-purple-900">Modello 1 (GDD Semplice)</div>
                   <div className="text-[10px] text-purple-600">Solo T_aria media</div>
                 </div>
                 <div className="text-xl font-bold text-purple-700">
                   {dayEmergenceModel1 ? `Giorno ${dayEmergenceModel1}` : '> Fine Sim'}
                 </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-emerald-50 rounded">
                 <div>
                   <div className="text-xs font-bold text-emerald-900">Modello 2 (ETT Esteso)</div>
                   <div className="text-[10px] text-emerald-600">T_suolo + Stress Idrico + T_opt</div>
                 </div>
                 <div className="text-xl font-bold text-emerald-700">
                   {dayEmergenceModel2 ? `Giorno ${dayEmergenceModel2}` : '> Fine Sim'}
                 </div>
              </div>
           </div>
           <div className="mt-4 text-xs text-gray-500 italic">
             Il Modello 2 è solitamente più lento perché penalizza giorni secchi o troppo caldi.
           </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="lg:col-span-2 space-y-6">
        
        <Card title="Teoria: Modellazione dell'Emergenza" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400"/>}>
          <div className="prose prose-sm max-w-none text-slate-700">
            <p>
              L'emergenza è la fase critica tra la semina e la comparsa delle prime foglie vere. La velocità di questo processo dipende da temperatura e umidità.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-white p-3 rounded border border-purple-100">
                <h4 className="font-bold text-purple-900 text-xs mb-1">Modello 1: Tempo Termico (GDD)</h4>
                <p className="text-xs text-gray-600">
                  Approccio classico. Accumula gradi giorno basandosi solo sulla <strong>temperatura dell'aria</strong>.
                  <br/>
                  <em>Assunzione:</em> Acqua sempre disponibile, T_suolo ≈ T_aria.
                  <br/>
                  Formula: <code className="text-xs bg-gray-100 px-1">GDD = max(0, T_avg - T_base)</code>
                </p>
              </div>
              <div className="bg-white p-3 rounded border border-emerald-100">
                <h4 className="font-bold text-emerald-900 text-xs mb-1">Modello 2: Tempo Idrotermico (ETT)</h4>
                <p className="text-xs text-gray-600">
                  Approccio meccanicistico. Considera la <strong>temperatura del suolo</strong> (stimata dalla radiazione) e lo <strong>stato idrico</strong>.
                  <br/>
                  Se il suolo è secco o troppo caldo (sopra T_opt), l'accumulo rallenta drasticamente.
                  <br/>
                  Formula: <code className="text-xs bg-gray-100 px-1">ETT = GDD_pot * f(T_suolo) * f(H2O)</code>
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Confronto Metodologico: GDD vs ETT" headerAction={<GitCompare className="text-gray-400"/>}>
          <div className="prose prose-sm max-w-none text-slate-700 mb-4">
            <p className="text-xs">
              Confronto tra accumulo termico classico (Lineare, T_aria) e tempo termico efficace (Non-lineare, T_suolo, Umidità).
            </p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Accumulo Termico', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={germParams.GDD_target} stroke="red" strokeDasharray="3 3" label="Soglia" />
                
                <Line type="monotone" dataKey="GDD_Cum_Base" stroke="#9333ea" strokeWidth={2} name="Modello 1 (GDD)" dot={false} />
                <Line type="monotone" dataKey="ETT_Cum_Base" stroke="#10b981" strokeWidth={3} name="Modello 2 (ETT)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Effetto Agrivoltaico (Solo Modello 2)" headerAction={<Sun className="text-orange-400"/>}>
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'ETT Cumulato', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <ReferenceLine y={germParams.GDD_target} stroke="red" strokeDasharray="3 3" label="Soglia" />
                
                <Line type="monotone" dataKey="ETT_Cum_Base" stroke="#10b981" strokeWidth={2} name="Pieno Campo (ETT)" dot={false} />
                <Line type="monotone" dataKey="ETT_Cum_Agri" stroke="#3b82f6" strokeWidth={2} name="Agrivoltaico (ETT)" dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center">
            Emergenza Pieno Campo: <strong>{dayEmergenceModel2 || 'N/A'}</strong> vs Agrivoltaico: <strong>{dayEmergenceAgri || 'N/A'}</strong>
          </div>
        </Card>

        <Card title="Fattori Ambientali (Dettaglio Modello 2)">
          <div className="h-[200px] w-full">
             <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                   <XAxis dataKey="day" />
                   <YAxis label={{ value: 'Acqua (mm)', angle: -90, position: 'insideLeft' }} />
                   <Tooltip />
                   <Area type="monotone" dataKey="W_Base" stroke="#3b82f6" fill="#bfdbfe" name="Acqua Suolo" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
};
