import React, { useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, Slider, DownloadAction } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { BookOpen } from 'lucide-react';

export const LaiView: React.FC = () => {
  const { cropParams, setCropParams, simulationResults, runSimulation } = useSimulation();

  // Auto-run quando cambiano i parametri
  useEffect(() => {
    const timer = setTimeout(() => {
        runSimulation();
    }, 300); 
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropParams]);

  // Calcolo FINT per il grafico
  const chartData = simulationResults.map(d => ({
    ...d,
    FINT: 1 - Math.exp(-cropParams.KPAR * d.LAI),
    FINT_Scaled: (1 - Math.exp(-cropParams.KPAR * d.LAI)) * (Math.max(...simulationResults.map(r=>r.LAI)) || 1)
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card title="Parametri LAI (Indice Area Fogliare)">
          <Slider 
            label="LAI Iniziale" value={cropParams.LAI0} min={0.001} max={0.5} step={0.005} unit="m²/m²"
            onChange={v => setCropParams(p => ({...p, LAI0: v}))} 
            description="Area fogliare alla germinazione."
          />
          <Slider 
            label="LAI Massimo" value={cropParams.LAIMX} min={1} max={9} step={0.1} unit="m²/m²"
            onChange={v => setCropParams(p => ({...p, LAIMX: v}))} 
            description="Massimo indice fogliare raggiungibile dalla coltura in condizioni ottimali."
          />
          <Slider 
            label="Tasso Crescita (ALPHA)" value={cropParams.ALPHA} min={0.001} max={0.08} step={0.001} 
            onChange={v => setCropParams(p => ({...p, ALPHA: v}))} 
            description="Velocità relativa di espansione fogliare durante la fase esponenziale."
          />
          <Slider 
            label="Tasso Senescenza" value={cropParams.SENRATE} min={0.001} max={0.08} step={0.001} 
            onChange={v => setCropParams(p => ({...p, SENRATE: v}))} 
            description="Velocità di morte delle foglie nella fase finale."
          />
          <div className="my-4 border-t pt-4">
             <Slider 
              label="Inizio Emergenza (NDS)" value={cropParams.frEMR} min={0} max={0.2} step={0.01} 
              onChange={v => setCropParams(p => ({...p, frEMR: v}))} 
              description="Stadio di sviluppo (0-1) in cui inizia la crescita esponenziale."
            />
            <Slider 
              label="Inizio Senescenza (NDS)" value={cropParams.frBLS} min={0.2} max={0.9} step={0.01} 
              onChange={v => setCropParams(p => ({...p, frBLS: v}))} 
              description="Stadio di sviluppo (0-1) in cui inizia il declino del LAI."
            />
          </div>
          <Slider 
            label="Coeff. Estinzione (K)" value={cropParams.KPAR} min={0.2} max={1.2} step={0.05} 
            onChange={v => setCropParams(p => ({...p, KPAR: v}))} 
            description="Legge di Beer-Lambert: determina l'efficienza di intercettazione della luce."
          />
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        
        <Card title="Teoria: Intercettazione della Luce" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400"/>}>
          <div className="prose prose-sm max-w-none text-slate-700">
            <p>
              La capacità della coltura di catturare energia solare dipende dalla sua superficie fogliare (LAI).
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 mt-2">
              <li>
                <strong>Crescita Logistica:</strong> Il LAI aumenta esponenzialmente finché le foglie non iniziano a ombreggiarsi a vicenda (competizione), rallentando verso un massimo (LAI_max).
              </li>
              <li>
                <strong>Legge di Beer-Lambert:</strong> La frazione di luce intercettata (F_int) non è lineare col LAI:
                F_int = 1 - e^(-k * LAI)
              </li>
              <li>
                Il coefficiente k dipende dall'architettura della pianta (foglie erette vs planofile).
              </li>
            </ul>
          </div>
        </Card>

        <Card 
          title="LAI & Intercettazione Luce"
          headerAction={<DownloadAction data={chartData} filename="lai_intercettazione.csv" />}
        >
          <div className="h-[400px] w-full">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'LAI', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="LAI" stroke="#16a34a" strokeWidth={2} name="LAI (Indice Area Fogliare)" dot={false} />
                <Line type="monotone" dataKey="FINT_Scaled" stroke="#ca8a04" strokeDasharray="5 5" strokeWidth={2} name="FINT (Intercettazione scalata)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            FINT = 1 - exp(-K * LAI). La produzione giornaliera usa: SRAD * 0.48 * FINT * RUE.
          </p>
        </Card>
      </div>
    </div>
  );
};