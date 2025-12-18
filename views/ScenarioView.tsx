import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, Slider, Button } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { simulateCrop, simulateSoilWater } from '../services/cropModel';
import { Zap, BookOpen } from 'lucide-react';

export const ScenarioView: React.FC = () => {
  const { cropParams, soilParams, simulationResults: baselineRes, waterResults: baselineWater } = useSimulation();

  // Scenario Modifiers (1.0 = 100% of baseline)
  const [radFactor, setRadFactor] = useState(1.0);
  const [et0Factor, setEt0Factor] = useState(1.0);
  const [rainFactor, setRainFactor] = useState(1.0);

  // Apply Agrivoltaics Preset
  // Hypothesis: Panels reduce radiation by ~30% and reduce ET0 by ~20% (microclimate)
  const applyAgrivoltaics = () => {
    setRadFactor(0.7);
    setEt0Factor(0.8);
    setRainFactor(1.0);
  };

  const resetScenario = () => {
    setRadFactor(1.0);
    setEt0Factor(1.0);
    setRainFactor(1.0);
  };

  // Run Scenario Simulation on-the-fly
  const scenarioData = useMemo(() => {
    if (baselineRes.length === 0) return null;

    // 1. Modify Weather based on factors
    const scenarioWeather = baselineRes.map(day => ({
      ...day,
      SRAD: Math.max(0, day.SRAD * radFactor),
      RAIN: Math.max(0, day.RAIN * rainFactor),
    }));

    // 2. Modify Soil Params
    const scenarioSoilParams = {
      ...soilParams,
      ET0: soilParams.ET0 * et0Factor
    };

    // 3. Run Models
    const cropRes = simulateCrop(scenarioWeather, cropParams);
    const laiSeries = cropRes.map(r => r.LAI);
    const waterRes = simulateSoilWater(scenarioWeather, scenarioSoilParams, laiSeries);

    // 4. Merge for Charting
    return baselineRes.map((base, i) => {
      const scenCrop = cropRes[i];
      const scenWater = waterRes[i];
      
      return {
        day: base.day,
        // Biomass
        B_Base: base.B,
        B_Scen: scenCrop.B,
        // LAI
        LAI_Base: base.LAI,
        LAI_Scen: scenCrop.LAI,
        // Water
        W_Base: baselineWater[i].W,
        W_Scen: scenWater.W,
        // Stress
        ARID_Base: baselineWater[i].ARID,
        ARID_Scen: scenWater.ARID
      };
    });

  }, [baselineRes, baselineWater, cropParams, soilParams, radFactor, et0Factor, rainFactor]);

  if (!scenarioData) return <div>Esegui prima una simulazione nella tab Panoramica o Fenologia.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Controls */}
      <div className="lg:col-span-1 space-y-6">
        <Card title="Configurazione Scenario">
          <p className="text-sm text-gray-600 mb-4">
            Modifica le forzanti ambientali per confrontare i risultati con la baseline.
          </p>

          <div className="space-y-6">
            <Slider 
              label="Modificatore Radiazione" 
              value={Math.round(radFactor * 100)} 
              min={10} max={150} step={5} unit="%"
              onChange={v => setRadFactor(v / 100)}
              description="Radiazione solare incidente sulla coltura (es. ombreggiamento nuvolosità o pannelli)."
            />
            
            <Slider 
              label="Modificatore ET0" 
              value={Math.round(et0Factor * 100)} 
              min={10} max={150} step={5} unit="%"
              onChange={v => setEt0Factor(v / 100)}
              description="Domanda di Evapotraspirazione di riferimento (es. cambiamenti vento/umidità)."
            />

            <Slider 
              label="Modificatore Pioggia" 
              value={Math.round(rainFactor * 100)} 
              min={0} max={200} step={10} unit="%"
              onChange={v => setRainFactor(v / 100)}
              description="Quantità di precipitazioni."
            />
          </div>

          <div className="mt-8 pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Zap size={16} className="text-yellow-500"/> Preset
            </h4>
            <div className="flex gap-2 flex-col">
              <Button onClick={applyAgrivoltaics} variant="primary" className="w-full justify-between">
                <span>Preset Agrivoltaico</span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Rad -30%, ET0 -20%</span>
              </Button>
              <Button onClick={resetScenario} variant="outline" className="w-full">
                Reset a Baseline
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Summary */}
        <Card title="Confronto Risultati Finali">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Biomassa Finale</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {scenarioData[scenarioData.length-1].B_Scen.toFixed(1)} <span className="text-xs font-normal text-gray-500">g/m²</span>
                  </div>
                  <div className={`text-xs ${scenarioData[scenarioData.length-1].B_Scen < scenarioData[scenarioData.length-1].B_Base ? 'text-red-500' : 'text-green-500'}`}>
                    vs {scenarioData[scenarioData.length-1].B_Base.toFixed(1)} (Base)
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Acqua Media Suolo</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-600">
                    {(scenarioData.reduce((acc, c) => acc + c.W_Scen, 0) / scenarioData.length).toFixed(1)} <span className="text-xs font-normal text-gray-500">mm</span>
                  </div>
                   <div className="text-xs text-gray-400">
                    vs {(scenarioData.reduce((acc, c) => acc + c.W_Base, 0) / scenarioData.length).toFixed(1)} (Base)
                  </div>
                </div>
              </div>
            </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="lg:col-span-2 space-y-6">
        
        <Card title="Teoria: Analisi di Scenario e Forzanti" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400"/>}>
          <div className="prose prose-sm max-w-none text-slate-700">
            <p>
              I modelli sono strumenti potenti per esplorare scenari <strong>"What-If"</strong>.
              Modificando le <strong>variabili forzanti</strong> (input esterni come pioggia o radiazione), possiamo simulare condizioni future o alternative di gestione.
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 mt-2">
              <li><strong>Resilienza Climatica:</strong> Cosa succede se piove il 50% in meno?</li>
              <li><strong>Agrivoltaico:</strong> Cosa succede se riduco la radiazione del 30% e l'ET del 20%?</li>
              <li>Noterai che la risposta del sistema è spesso <strong>non lineare</strong> (es. una riduzione della pioggia causa un calo drastico della biomassa solo se si scende sotto una certa soglia critica).</li>
            </ul>
          </div>
        </Card>

        <Card title="Confronto Biomassa">
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <LineChart data={scenarioData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Biomassa (g/m²)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="B_Base" stroke="#94a3b8" strokeWidth={2} name="Baseline" dot={false} />
                <Line type="monotone" dataKey="B_Scen" stroke="#16a34a" strokeWidth={3} name="Scenario" dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Dinamica Idrica">
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <LineChart data={scenarioData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Acqua nel suolo (mm)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="W_Base" stroke="#94a3b8" strokeWidth={2} name="Baseline" dot={false} />
                <Line type="monotone" dataKey="W_Scen" stroke="#2563eb" strokeWidth={3} name="Scenario" dot={false} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
            <strong>Osservazione:</strong> In scenari con minore radiazione (es. nuvoloso o pannelli), potresti osservare meno biomassa (limite luce) ma <em>maggiore</em> acqua nel suolo, poiché la coltura consuma meno (minore domanda traspirativa).
          </div>
        </Card>

      </div>
    </div>
  );
};