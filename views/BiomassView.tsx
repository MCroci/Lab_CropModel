import React, { useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, Slider, DownloadAction } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { BookOpen } from 'lucide-react';

export const BiomassView: React.FC = () => {
  const { cropParams, setCropParams, simulationResults, runSimulation } = useSimulation();

  useEffect(() => {
    const timer = setTimeout(() => {
        runSimulation();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropParams]);

  const chartData = simulationResults.map(d => ({
    ...d,
    dB_Scaled: d.dB * 20
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card title="Parametri Biomassa (RUE)">
          <Slider 
            label="RUE (g/MJ)" value={cropParams.RUE} min={0.5} max={5.0} step={0.1} unit="g/MJ"
            onChange={v => setCropParams(p => ({...p, RUE: v}))} 
            description="Radiation Use Efficiency: biomassa secca prodotta per ogni MJ di radiazione fotosintetica intercettata."
          />
          <div className="my-4 border-t pt-4">
            <h4 className="text-sm font-semibold mb-3 text-gray-700">Risposta alla Temperatura</h4>
            <Slider 
              label="T Base RUE" value={cropParams.TBRUE} min={0} max={20} step={0.5} unit="°C"
              onChange={v => setCropParams(p => ({...p, TBRUE: v}))} 
              description="Temperatura minima sotto la quale la fotosintesi si ferma."
            />
            <Slider 
              label="T Ottimale 1" value={cropParams.TP1RUE} min={10} max={30} step={0.5} unit="°C"
              onChange={v => setCropParams(p => ({...p, TP1RUE: v}))} 
              description="Inizio dell'intervallo di temperatura ottimale per la fotosintesi."
            />
            <Slider 
              label="T Ottimale 2" value={cropParams.TP2RUE} min={15} max={40} step={0.5} unit="°C"
              onChange={v => setCropParams(p => ({...p, TP2RUE: v}))} 
              description="Fine dell'intervallo di temperatura ottimale."
            />
            <Slider 
              label="T Massima (Ceiling)" value={cropParams.TCRUE} min={20} max={50} step={0.5} unit="°C"
              onChange={v => setCropParams(p => ({...p, TCRUE: v}))} 
              description="Temperatura massima sopra la quale la fotosintesi si azzera (stress termico)."
            />
          </div>
          <p className="text-xs text-gray-500">La funzione di risposta è trapezoidale (0-1) basata sulla temperatura media giornaliera.</p>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        
        <Card title="Teoria: Accumulo di Biomassa" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400"/>}>
          <div className="prose prose-sm max-w-none text-slate-700">
            <p>
              La produzione di biomassa è modellata secondo l'approccio di <strong>Monteith (1977)</strong>, che lega linearmente la crescita alla luce intercettata.
            </p>
            <div className="bg-white p-2 rounded border border-slate-200 font-mono text-center my-2 text-xs text-slate-800">
               Delta B = RUE * PAR * (1 - e^(-k * LAI)) * f(T)
            </div>
            <ul className="list-disc list-inside text-xs space-y-1">
              <li><strong>RUE (Radiation Use Efficiency):</strong> L'efficienza di conversione dell'energia in materia secca (g/MJ).</li>
              <li><strong>PAR:</strong> Photosynthetically Active Radiation (~48% della radiazione globale).</li>
              <li><strong>f(T):</strong> Fattore di limitazione termica (0-1) che riduce la fotosintesi se fa troppo freddo o troppo caldo.</li>
            </ul>
          </div>
        </Card>

        <Card 
          title="Accumulo Biomassa"
          headerAction={<DownloadAction data={chartData} filename="biomassa.csv" />}
        >
          <div className="h-[400px] w-full">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Biomassa (g/m²)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="B" stroke="#059669" strokeWidth={2} name="Biomassa Totale (B)" dot={false} />
                <Line type="monotone" dataKey="dB_Scaled" stroke="#9333ea" strokeDasharray="3 3" strokeWidth={2} name="Crescita Giornaliera (dB * 20)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};