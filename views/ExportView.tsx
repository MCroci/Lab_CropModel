import React from 'react';
import { Card, Button } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { Download } from 'lucide-react';

export const ExportView: React.FC = () => {
  const { simulationResults, waterResults } = useSimulation();

  const downloadCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Scarica Risultati">
        <div className="space-y-4">
          <Button onClick={() => downloadCSV(simulationResults, `simulazione_coltura_${new Date().toISOString().split('T')[0]}.csv`)} className="w-full">
            <Download size={18} /> Scarica CSV Simulazione Coltura
          </Button>
          <Button onClick={() => downloadCSV(waterResults, `simulazione_acqua_${new Date().toISOString().split('T')[0]}.csv`)} variant="secondary" className="w-full">
            <Download size={18} /> Scarica CSV Bilancio Idrico
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-4">I file CSV includono le variabili giornaliere (TMIN, TMAX, SRAD, LAI, Biomassa, Acqua, etc.).</p>
      </Card>
      
      <Card title="Suggerimenti per la Relazione" className="bg-blue-50 border-blue-100">
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Descrivi il sistema: stati, flussi, parametri e forzanti.</li>
          <li>Includi grafici significativi: NDS, LAI, FINT, Biomassa, Acqua nel suolo (W) e ARID.</li>
          <li>Documenta le assunzioni e i limiti del modello didattico usato.</li>
          <li>Discuti come le variazioni meteo (es. pioggia vs siccità) influenzano la resa finale.</li>
        </ul>
      </Card>
    </div>
  );
};
