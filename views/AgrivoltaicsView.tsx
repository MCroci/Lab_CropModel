import React, { useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { CHART_MARGIN } from '../utils/chartMargins';
import { Card, Slider, DownloadAction } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { Sun, Zap, BookOpen } from 'lucide-react';
import { simulateCropAndWater } from '../services/cropModel';

export const AgrivoltaicsView: React.FC = () => {
  const { dailyWeather, cropParams, soilParams, agrivoltaicsShading, setAgrivoltaicsShading, runSimulation, getCurrentCropSowingDay } = useSimulation();
  const sowingDay = getCurrentCropSowingDay();

  // Run simulation whenever params change
  useEffect(() => {
    runSimulation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agrivoltaicsShading]);

  // We need to calculate the COMPARISON data locally for this view
  const getAgrivoltaicsData = () => {
    if (dailyWeather.length === 0) return [];

    const safeSowing = Math.min(Math.max(1, sowingDay), dailyWeather.length);

    // 1. Standard Simulation
    const { crop: baseCropRes, water: baseWaterRes } = simulateCropAndWater(
      dailyWeather, cropParams, soilParams, safeSowing
    );
    const baseWaterFromSowing = baseWaterRes.filter(w => w.day >= safeSowing);

    // 2. Agrivoltaics Simulation (Current Shading)
    const radiationFactor = 1.0 - (agrivoltaicsShading / 100);
    const et0Factor = 1.0 - (agrivoltaicsShading / 100) * 0.3;
    const agriWeather = dailyWeather.map(w =>
      w.day >= safeSowing ? { ...w, SRAD: w.SRAD * radiationFactor } : w
    );
    const agriSoilParams = { ...soilParams, ET0: soilParams.ET0 * et0Factor };

    const { crop: agriCropRes, water: agriWaterRes } = simulateCropAndWater(
      agriWeather, cropParams, agriSoilParams, safeSowing
    );
    const agriWaterFromSowing = agriWaterRes.filter(w => w.day >= safeSowing);

    return baseCropRes.map((base, i) => {
      const wBase = baseWaterFromSowing.find(w => w.day === base.day);
      const wAgri = agriWaterFromSowing.find(w => w.day === base.day);
      return {
        day: base.day,
        Biomassa_Standard: base.B,
        Biomassa_Agri: agriCropRes[i]?.B ?? base.B,
        Acqua_Standard: wBase?.W ?? 0,
        Acqua_Agri: wAgri?.W ?? 0,
        Stress_Standard: wBase?.ARID ?? 0,
        Stress_Agri: wAgri?.ARID ?? 0
      };
    });
  };

  const chartData = getAgrivoltaicsData();
  const finalBiomassBase = chartData.length > 0 ? chartData[chartData.length-1].Biomassa_Standard : 0;
  const finalBiomassAgri = chartData.length > 0 ? chartData[chartData.length-1].Biomassa_Agri : 0;
  const biomassLoss = finalBiomassBase > 0 ? ((finalBiomassBase - finalBiomassAgri) / finalBiomassBase) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Controls */}
      <div className="lg:col-span-1 space-y-6">
        <Card title="Configurazione Impianto Agrivoltaico" className="border-t-4 border-t-yellow-500">
           <div className="flex items-start gap-3 mb-6">
              <Sun className="text-yellow-500 mt-1" size={32} />
              <div>
                <p className="text-sm text-gray-600">
                  Simula la presenza di pannelli fotovoltaici sopra le colture. L'ombreggiamento riduce la fotosintesi ma può ridurre lo stress idrico.
                </p>
              </div>
           </div>
           
           <Slider 
              label="Ombreggiamento (%)" 
              value={agrivoltaicsShading} min={0} max={60} step={5} 
              onChange={(v) => setAgrivoltaicsShading(v)} 
              unit="%"
              description="Percentuale di radiazione solare intercettata dai pannelli e sottratta alla coltura."
           />

           <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
             <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><Zap size={16}/> Risultati Sintetici</h4>
             <div className="flex justify-between text-sm mb-1">
               <span>Perdita Biomassa:</span>
               <span className="font-bold text-red-600">-{biomassLoss.toFixed(1)}%</span>
             </div>
             <div className="text-xs text-gray-500 mt-2">
               Nota: Il modello assume anche una leggera riduzione dell'evapotraspirazione (ET0) dovuta al microclima protetto.
             </div>
           </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="lg:col-span-2 space-y-6">
        
        <Card title="Teoria: Agrivoltaico e Trade-off" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400"/>}>
          <div className="prose prose-sm max-w-none text-slate-700">
            <p>
              L'agrivoltaico introduce una competizione per la luce tra produzione energetica (pannelli) e fotosintesi vegetale (coltura).
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 mt-2">
              <li>
                <strong>Meno Luce:</strong> La radiazione intercettata dai pannelli non raggiunge la pianta, riducendo la biomassa potenziale (specialmente per colture eliofile come il mais).
              </li>
              <li>
                <strong>Microclima:</strong> L'ombra riduce la temperatura fogliare e la domanda evapotraspirativa ($ET_0$). In climi aridi o estati torride, questo può ridurre lo stress idrico e compensare parzialmente la perdita di luce (effetto "salva-acqua").
              </li>
            </ul>
          </div>
        </Card>

        <Card 
          title="Confronto Produzione Biomassa"
          headerAction={<DownloadAction data={chartData} filename="agrivoltaico_biomassa.csv" />}
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis 
                  dataKey="day" 
                  label={{ value: `Giorno (Semina: giorno ${sowingDay})`, position: 'insideBottom', offset: 0 }} 
                />
                <YAxis label={{ value: 'Biomassa (g/m²)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Biomassa_Standard" stroke="#94a3b8" strokeWidth={2} name="Pieno Sole (Standard)" dot={false} />
                <Line type="monotone" dataKey="Biomassa_Agri" stroke="#eab308" strokeWidth={3} name="Sotto Pannelli (Agrivoltaico)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card 
          title="Dinamica Idrica del Suolo"
          headerAction={<DownloadAction data={chartData} filename="agrivoltaico_acqua.csv" />}
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis 
                  dataKey="day" 
                  label={{ value: `Giorno (Semina: giorno ${sowingDay})`, position: 'insideBottom', offset: 0 }} 
                />
                <YAxis label={{ value: 'Acqua nel suolo (mm)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="Acqua_Agri" stackId="1" stroke="#3b82f6" fill="#bfdbfe" name="Acqua (Agrivoltaico)" fillOpacity={0.6} />
                <Area type="monotone" dataKey="Acqua_Standard" stackId="2" stroke="#1e40af" fill="none" name="Acqua (Standard)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            L'agrivoltaico può mantenere l'umidità del suolo più alta riducendo la domanda evapotraspirativa, mitigando lo stress nei periodi secchi.
          </div>
        </Card>

      </div>
    </div>
  );
};