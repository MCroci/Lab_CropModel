
import React, { useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, Slider, Button, DownloadAction } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { Play, BookOpen } from 'lucide-react';

export const PhenologyView: React.FC = () => {
  const { cropParams, setCropParams, simulationResults, runSimulation } = useSimulation();

  // Re-run simulation when params change
  useEffect(() => {
    const timer = setTimeout(() => {
        runSimulation();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropParams]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card title="Parametri Fenologici">
          <p className="text-sm text-gray-600 mb-4">
             Controllano la velocità di sviluppo della pianta in base alla temperatura.
          </p>

          <Slider 
            label="Tbase (°C)" value={cropParams.Tbase} min={0} max={15} step={0.5} unit="°C"
            onChange={v => setCropParams(p => ({...p, Tbase: v}))} 
            description="Temperatura base al di sotto della quale lo sviluppo si arresta."
          />
          <Slider 
            label="tuHAR (°C·d)" value={cropParams.tuHAR} min={800} max={2200} step={50} unit="°C·d"
            description="Somma termica necessaria per raggiungere la maturità fisiologica (raccolta)."
            onChange={v => setCropParams(p => ({...p, tuHAR: v}))} 
          />
        </Card>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
          <strong>Nota Meteo:</strong> Per modificare la temperatura e la durata della simulazione, vai alla sezione <strong>Generatore Meteo</strong>. I dati meteo generati lì sono usati qui.
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        
        <Card title="Teoria: Il Tempo Termico" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400"/>}>
          <div className="prose prose-sm max-w-none text-slate-700">
            <p>
              Le piante non misurano il tempo in giorni solari, ma in accumulo di calore. 
              Il modello utilizza il concetto di <strong>Gradi Giorno di Crescita (GDD)</strong>.
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 mt-2">
              <li>
                Ogni giorno viene calcolato un <strong>DTU</strong> (Daily Thermal Unit): 
                DTU = max(T_media - T_base, 0).
              </li>
              <li>
                Questi si sommano nel tempo formando il <strong>CTU</strong> (Cumulative Thermal Unit).
              </li>
              <li>
                Lo stadio di sviluppo (<strong>NDS</strong>) è una frazione: NDS = CTU / tuHAR. 
                Quando NDS = 1, la pianta è matura.
              </li>
            </ul>
          </div>
        </Card>

        <Card 
          title="Traiettoria Fenologica"
          headerAction={<DownloadAction data={simulationResults} filename="fenologia.csv" />}
        >
          <div className="h-[350px] w-full">
            <ResponsiveContainer>
              <LineChart data={simulationResults} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" label={{ value: 'Giorno Simulazione', position: 'insideBottom', offset: -5 }} />
                
                {/* Asse Sinistro per CTU */}
                <YAxis yAxisId="left" label={{ value: 'CTU (°C·d)', angle: -90, position: 'insideLeft' }} />
                
                {/* Asse Destro per NDS (0-1) */}
                <YAxis yAxisId="right" orientation="right" domain={[0, 1.2]} label={{ value: 'Stadio (0-1)', angle: 90, position: 'insideRight' }} />
                
                <Tooltip />
                <Legend />
                
                <Line yAxisId="left" type="monotone" dataKey="CTU" stroke="#2563eb" dot={false} strokeWidth={2} name="Tempo Termico (CTU)" />
                <Line yAxisId="right" type="monotone" dataKey="NDS" stroke="#ea580c" strokeDasharray="5 5" dot={false} strokeWidth={2} name="Stadio (NDS)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Tabella Dati (Primi 10 Giorni)">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th className="px-4 py-2">Giorno</th>
                  <th className="px-4 py-2">Tmin</th>
                  <th className="px-4 py-2">Tmax</th>
                  <th className="px-4 py-2">DTU</th>
                  <th className="px-4 py-2">CTU</th>
                  <th className="px-4 py-2">NDS</th>
                </tr>
              </thead>
              <tbody>
                {simulationResults.slice(0, 10).map((row) => (
                  <tr key={row.day} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2">{row.day}</td>
                    <td className="px-4 py-2">{row.TMIN.toFixed(1)}</td>
                    <td className="px-4 py-2">{row.TMAX.toFixed(1)}</td>
                    <td className="px-4 py-2">{row.DTU.toFixed(1)}</td>
                    <td className="px-4 py-2">{row.CTU.toFixed(1)}</td>
                    <td className="px-4 py-2">{row.NDS.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
