import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { Card, Slider, DownloadAction } from '../components/UI';
import { runEnergySimulation } from '../services/energyBalanceModel';
import { Zap, Sun, Thermometer, Droplet, BookOpen } from 'lucide-react';

export const AgriVoltaicEnergyView: React.FC = () => {
  const [shading, setShading] = useState(0); 
  const [days, setDays] = useState(3);
  
  // Crop & Physics Parameters
  const [lai, setLai] = useState(4.0);
  const [height, setHeight] = useState(0.8);
  const [gsMax, setGsMax] = useState(0.01); // m/s
  const [drag, setDrag] = useState(0.2);
  const [albedo, setAlbedo] = useState(0.23);

  // Run Simulation on the fly
  const simulationData = useMemo(() => {
    const overrides = {
        lai, 
        canopy_height: height,
        max_conductance: gsMax,
        drag_coeff: drag,
        albedo
    };

    // Run Baseline (0% shading) with current physical params
    const baseline = runEnergySimulation(days, 0, overrides);
    // Run Scenario (Current shading)
    const scenario = runEnergySimulation(days, shading, overrides);

    // Merge data
    return baseline.map((b, i) => ({
      time: b.time,
      hour: b.hour,
      
      Rad_Base: b.rad,
      Rad_Scen: scenario[i].rad,

      Temp_Air: b.temp_air,
      Temp_Canopy_Base: b.temp_canopy,
      Temp_Canopy_Scen: scenario[i].temp_canopy,
      Temp_Soil_Base: b.temp_soil,
      Temp_Soil_Scen: scenario[i].temp_soil,

      ET_Base: b.et_mm_h,
      ET_Scen: scenario[i].et_mm_h,

      SW_Base: b.soil_water,
      SW_Scen: scenario[i].soil_water
    }));
  }, [shading, days, lai, height, gsMax, drag, albedo]);

  const totalETBase = simulationData.reduce((acc, d) => acc + d.ET_Base * 0.5, 0); 
  const totalETScen = simulationData.reduce((acc, d) => acc + d.ET_Scen * 0.5, 0);
  const waterSaving = ((totalETBase - totalETScen) / totalETBase) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Configurazione Impianto" className="border-t-4 border-t-orange-500">
             <div className="space-y-6">
                <Slider 
                  label="Ombreggiamento (%)" value={shading} min={0} max={90} step={10} 
                  onChange={setShading} unit="%"
                  description="Riduzione radiazione diretta."
                />
                <Slider 
                  label="Giorni Simulazione" value={days} min={1} max={7} step={1} 
                  onChange={setDays} 
                />
             </div>
             
             <div className="mt-6 bg-orange-50 p-4 rounded-xl border border-orange-200">
                <h4 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                  <Droplet size={18}/> Risparmio Idrico
                </h4>
                <div className="text-2xl font-bold text-orange-600">
                   {shading > 0 ? `+${waterSaving.toFixed(1)}%` : '0%'}
                </div>
             </div>
          </Card>

          <Card title="Parametri Coltura (Struttura & Fisiologia)">
            <p className="text-xs text-gray-500 mb-4 italic">
              Nota: In questa analisi di breve periodo, si definiscono direttamente gli stati fisici della coltura anziché i parametri di crescita (Tbase, tuHAR, RUE).
            </p>
            <Slider 
              label="LAI (Indice Area Fogliare)" value={lai} min={0.5} max={8.0} step={0.5} 
              onChange={setLai} 
              description="Superficie fogliare per unità di suolo."
            />
            <Slider 
              label="Altezza Chioma (m)" value={height} min={0.2} max={3.0} step={0.1} unit="m"
              onChange={setHeight} 
              description="Influenza la rugosità aerodinamica."
            />
            <Slider 
              label="Conduttanza Stomatica Max" value={gsMax} min={0.002} max={0.02} step={0.001} unit="m/s"
              onChange={setGsMax} 
              description="Capacità massima della pianta di traspirare."
            />
          </Card>

          <Card title="Parametri Energetici">
            <Slider 
              label="Albedo (Riflessione)" value={albedo} min={0.1} max={0.4} step={0.01} 
              onChange={setAlbedo} 
              description="Frazione di radiazione solare riflessa."
            />
            <Slider 
              label="Coeff. Resistenza (Drag)" value={drag} min={0.05} max={0.5} step={0.05} 
              onChange={setDrag} 
              description="Resistenza al flusso d'aria (aerodinamica)."
            />
          </Card>
        </div>

        {/* Charts & Theory */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card title="Teoria: Il Bilancio Energetico" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400"/>}>
            <div className="prose prose-sm max-w-none text-slate-700">
              <p>Il modello risolve iterativamente l'equazione del bilancio energetico per la chioma e il suolo:</p>
              <div className="bg-white p-3 rounded border border-slate-200 font-mono text-center my-2 text-slate-800 font-bold">
                 Rn = H + λE + G
              </div>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li><strong>Rn (Radiazione Netta):</strong> Energia solare assorbita meno la radiazione a onde lunghe emessa.</li>
                <li><strong>H (Calore Sensibile):</strong> Energia che riscalda l'aria (convezione).</li>
                <li><strong>λE (Calore Latente):</strong> Energia usata per l'evapotraspirazione (raffredda la foglia).</li>
                <li><strong>G (Flusso Suolo):</strong> Energia condotta nel terreno.</li>
              </ul>
              <p className="mt-2 text-xs">
                L'approccio <strong>Penman-Monteith</strong> calcola λE basandosi sulla <em>resistenza aerodinamica</em> ($r_a$, funzione di altezza e vento) e sulla <em>resistenza stomatica</em> ($r_s$, funzione di luce, fisiologia e stress idrico).
              </p>
            </div>
          </Card>

          {/* Radiazione */}
          <Card title="1. Radiazione Solare Incidente (W/m²)">
            <div className="h-[200px] w-full">
              <ResponsiveContainer>
                <AreaChart data={simulationData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="time" unit="d" type="number" domain={[0, days]} allowDecimals={false} />
                  <YAxis />
                  <Tooltip labelFormatter={(label) => `Giorno ${Math.floor(Number(label))} - Ore ${(Number(label)%1*24).toFixed(0)}:00`} />
                  <Legend />
                  <Area type="monotone" dataKey="Rad_Base" stroke="#f59e0b" fill="#fef3c7" name="Pieno Campo" />
                  <Area type="monotone" dataKey="Rad_Scen" stroke="#ea580c" fill="#ffedd5" name="Sotto Pannelli" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Temperature */}
          <Card title="2. Temperature Chioma vs Aria (°C)" headerAction={<DownloadAction data={simulationData} filename="temp_energy_balance.csv" />}>
            <div className="h-[300px] w-full">
              <ResponsiveContainer>
                <LineChart data={simulationData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="time" unit="d" type="number" domain={[0, days]} allowDecimals={false} />
                  <YAxis domain={['auto', 'auto']} />
                  <Tooltip labelFormatter={(label) => `Giorno ${Math.floor(Number(label))} - Ore ${(Number(label)%1*24).toFixed(0)}:00`} />
                  <Legend />
                  <Line type="monotone" dataKey="Temp_Air" stroke="#000" strokeWidth={2} dot={false} name="Temp. Aria" />
                  <Line type="monotone" dataKey="Temp_Canopy_Base" stroke="#ef4444" strokeWidth={2} dot={false} name="Chioma (Pieno Campo)" />
                  <Line type="monotone" dataKey="Temp_Canopy_Scen" stroke="#3b82f6" strokeWidth={2} dot={false} name="Chioma (Agrivoltaico)" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* ET */}
          <Card title="3. Evapotraspirazione Oraria (mm/h)">
            <div className="h-[200px] w-full">
              <ResponsiveContainer>
                <LineChart data={simulationData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="time" unit="d" type="number" domain={[0, days]} allowDecimals={false} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ET_Base" stroke="#0ea5e9" strokeWidth={2} dot={false} name="ET Pieno Campo" />
                  <Line type="monotone" dataKey="ET_Scen" stroke="#0284c7" strokeWidth={2} dot={false} name="ET Agrivoltaico" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
