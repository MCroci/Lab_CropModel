import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { CHART_MARGIN } from '../utils/chartMargins';
import { Card, Slider, Button } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { Play, Pause, RotateCcw, Lightbulb, Target, ArrowRight } from 'lucide-react';

const expolinear = (t: number, r_m: number, C_m: number, t_b: number) => {
  const arg = r_m * (t - t_b);
  return (C_m / r_m) * Math.log(1 + Math.exp(arg));
};

const ExpolinearDemo: React.FC = () => {
  const [r_m, setR_m] = useState(0.1);
  const [C_m, setC_m] = useState(20);
  const [t_b, setT_b] = useState(20);
  const chartData = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => {
      const t = i;
      const W = expolinear(t, r_m, C_m, t_b);
      const dW = t > 0 ? expolinear(t, r_m, C_m, t_b) - expolinear(t - 1, r_m, C_m, t_b) : 0;
      return { t, W: Math.round(W * 10) / 10, dW: Math.round(dW * 100) / 100 };
    });
  }, [r_m, C_m, t_b]);
  return (
    <Card title="Funzione Expolinear (Goudriaan e Monteith, 1990)" className="border-l-4 border-l-cyan-500 bg-cyan-50/30">
      <p className="text-sm text-gray-700 mb-3">
        La crescita della biomassa passa da una fase <strong>esponenziale</strong> (pianta piccola) a una fase <strong>lineare</strong> (intercettazione massima). Modifica i parametri per vedere l'effetto sulla curva.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Slider label="r_m (tasso relativo)" value={r_m} min={0.02} max={0.25} step={0.01} onChange={setR_m} description="g g⁻¹ d⁻¹" />
        <Slider label="C_m (tasso max)" value={C_m} min={5} max={50} step={1} onChange={setC_m} description="g/m² d" />
        <Slider label="t_b (tempo base)" value={t_b} min={0} max={60} step={5} onChange={setT_b} description="giorni" />
      </div>
      <div className="bg-white p-3 rounded border border-cyan-200 text-sm mb-4" style={{ fontFamily: 'serif' }}>
        W = (C<sub>m</sub>/r<sub>m</sub>) · ln&#123;1 + exp[r<sub>m</sub>·(t − t<sub>b</sub>)]&#125;
      </div>
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="t" label={{ value: 'Giorni (t)', position: 'insideBottom', offset: 0 }} />
            <YAxis label={{ value: 'Biomassa W (g/m²)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="W" stroke="#0891b2" strokeWidth={2} name="Biomassa W" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const ConceptsView: React.FC = () => {
  const { simulationResults } = useSimulation();
  const [selectedConcept, setSelectedConcept] = useState<'state' | 'flow' | 'param' | 'forcing' | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState(500);
  const [isRunning, setIsRunning] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);

  // Esempio semplificato per dimostrare Stato vs Flusso
  const exampleData = useMemo(() => {
    if (simulationResults.length === 0) return [];
    
    return simulationResults.slice(0, Math.min(50, simulationResults.length)).map((step, index) => ({
      day: step.day,
      // STATO: valori cumulativi/accumulati
      CTU_State: step.CTU,           // Stato: accumulo cumulativo
      Biomassa_State: step.B,        // Stato: biomassa totale
      LAI_State: step.LAI,           // Stato: LAI corrente
      // FLUSSO: variazioni giornaliere
      DTU_Flow: step.DTU,            // Flusso: incremento giornaliero
      dB_Flow: step.dB,              // Flusso: incremento biomassa
      dLAI_Flow: index > 0 ? step.LAI - simulationResults[index - 1].LAI : 0, // Flusso: variazione LAI
      // FORZANTI
      TMAX_Forcing: step.TMAX,
      RAIN_Forcing: step.RAIN,
      SRAD_Forcing: step.SRAD
    }));
  }, [simulationResults]);

  // Dati per il giorno corrente (se simulazione attiva)
  const currentDayData = exampleData[currentDay] || exampleData[0];

  // Classificazione variabili
  const variableClassification = {
    state: [
      { name: 'CTU', value: currentDayData?.CTU_State.toFixed(1), unit: '°C·d', description: 'Accumulo cumulativo di gradi giorno' },
      { name: 'NDS', value: simulationResults[currentDay]?.NDS.toFixed(3), unit: '', description: 'Stadio di sviluppo normalizzato (0-1)' },
      { name: 'LAI', value: currentDayData?.LAI_State.toFixed(2), unit: 'm²/m²', description: 'Area fogliare attuale' },
      { name: 'Biomassa', value: currentDayData?.Biomassa_State.toFixed(0), unit: 'kg/ha', description: 'Biomassa totale accumulata' },
      { name: 'W (Acqua suolo)', value: '120', unit: 'mm', description: 'Contenuto idrico del suolo' }
    ],
    flow: [
      { name: 'DTU', value: currentDayData?.DTU_Flow.toFixed(1), unit: '°C·d/giorno', description: 'Incremento giornaliero di gradi giorno' },
      { name: 'dB', value: currentDayData?.dB_Flow.toFixed(1), unit: 'kg/ha/giorno', description: 'Incremento giornaliero di biomassa' },
      { name: 'dLAI', value: currentDayData?.dLAI_Flow.toFixed(3), unit: 'm²/m²/giorno', description: 'Variazione giornaliera di LAI' },
      { name: 'ET', value: '4.2', unit: 'mm/giorno', description: 'Evapotraspirazione giornaliera' }
    ],
    param: [
      { name: 'Tbase', value: '8', unit: '°C', description: 'Temperatura base per sviluppo' },
      { name: 'tuHAR', value: '1400', unit: '°C·d', description: 'Somma termica per maturazione' },
      { name: 'RUE', value: '2.5', unit: 'g/MJ', description: 'Efficienza uso radiazione' },
      { name: 'KPAR', value: '0.6', unit: '', description: 'Coefficiente estinzione radiativa' }
    ],
    forcing: [
      { name: 'TMAX', value: currentDayData?.TMAX_Forcing.toFixed(1), unit: '°C', description: 'Temperatura massima giornaliera' },
      { name: 'TMIN', value: simulationResults[currentDay]?.TMIN.toFixed(1), unit: '°C', description: 'Temperatura minima giornaliera' },
      { name: 'SRAD', value: currentDayData?.SRAD_Forcing.toFixed(2), unit: 'MJ/m²', description: 'Radiazione solare giornaliera' },
      { name: 'RAIN', value: currentDayData?.RAIN_Forcing.toFixed(1), unit: 'mm', description: 'Precipitazione giornaliera' }
    ]
  };

  // Simulazione step-by-step
  React.useEffect(() => {
    if (!isRunning || exampleData.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentDay(prev => {
        if (prev >= exampleData.length - 1) {
          setIsRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [isRunning, exampleData.length, simulationSpeed]);

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentDay(0);
  };

  const ConceptCard: React.FC<{ 
    title: string; 
    type: 'state' | 'flow' | 'param' | 'forcing';
    color: string;
    description: string;
    examples: Array<{ name: string; value: string; unit: string; description: string }>;
  }> = ({ title, type, color, description, examples }) => {
    const isSelected = selectedConcept === type;
    
    return (
      <Card 
        title={title}
        className={`border-l-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-brand-500' : ''}`}
        style={{ borderLeftColor: color }}
        onClick={() => setSelectedConcept(isSelected ? null : type)}
      >
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        
        {isSelected && (
          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-gray-700 mb-2">Esempi dal Modello:</div>
            {examples.map((ex, i) => (
              <div key={i} className="bg-gray-50 p-2 rounded text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{ex.name}:</span>
                  <span className="font-bold text-brand-600">
                    {ex.value} <span className="text-xs text-gray-500">{ex.unit}</span>
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">{ex.description}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Funzione Expolinear - Demo interattiva */}
      <ExpolinearDemo />

      {/* Glossario Interattivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConceptCard
          title="Variabili di Stato (State)"
          type="state"
          color="#3b82f6"
          description="Descrivono lo stato del sistema in un dato momento. Si accumulano nel tempo."
          examples={variableClassification.state}
        />
        <ConceptCard
          title="Variabili di Flusso (Rate)"
          type="flow"
          color="#ef4444"
          description="Rappresentano la velocità di cambiamento delle variabili di stato. Sono derivate giornaliere."
          examples={variableClassification.flow}
        />
        <ConceptCard
          title="Parametri"
          type="param"
          color="#22c55e"
          description="Proprietà costanti del sistema o della cultivar durante la simulazione."
          examples={variableClassification.param}
        />
        <ConceptCard
          title="Variabili Forzanti (Forcing)"
          type="forcing"
          color="#f59e0b"
          description="Input esterni che guidano il sistema. Cambiano ogni giorno."
          examples={variableClassification.forcing}
        />
      </div>

      {/* Simulatore Interattivo */}
      {simulationResults.length > 0 && (
        <Card title="Simulatore Interattivo: Stato vs Flusso">
          <p className="text-gray-600 text-sm mb-4">
            Osserva come le variabili di <strong>stato</strong> (accumulano) si differenziano dalle variabili di <strong>flusso</strong> (variazioni giornaliere).
          </p>
          
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                variant="primary"
                className="text-sm"
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isRunning ? 'Pausa' : 'Avvia'}
              </Button>
              <Button
                onClick={resetSimulation}
                variant="outline"
                className="text-sm"
              >
                <RotateCcw size={16} />
                Reset
              </Button>
            </div>
            <div className="flex-1">
              <Slider
                label="Velocità Simulazione"
                value={simulationSpeed}
                min={100}
                max={2000}
                step={100}
                onChange={setSimulationSpeed}
                unit="ms"
                description="Tempo tra un giorno e il successivo"
              />
            </div>
            <div className="text-sm font-semibold text-brand-600">
              Giorno: {currentDay + 1} / {exampleData.length}
            </div>
          </div>

          {/* Grafici Stato vs Flusso */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card title="Stato: Accumulo Cumulativo" className="bg-blue-50 border-blue-200">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={exampleData.slice(0, currentDay + 1)} margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: 0 }} />
                  <YAxis label={{ value: 'Valore', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="CTU_State" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="CTU (Stato)"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Biomassa_State" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Biomassa (Stato)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-2">
                Le variabili di stato <strong>accumulano</strong> nel tempo (sempre crescenti o decrescenti)
              </p>
            </Card>

            <Card title="Flusso: Variazioni Giornaliere" className="bg-red-50 border-red-200">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={exampleData.slice(0, currentDay + 1)} margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: 0 }} />
                  <YAxis label={{ value: 'Flusso', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="DTU_Flow" fill="#ef4444" name="DTU (Flusso)" />
                  <Bar dataKey="dB_Flow" fill="#f59e0b" name="dB (Flusso)" />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-600 mt-2">
                Le variabili di flusso rappresentano <strong>incrementi giornalieri</strong> (possono essere positive o negative)
              </p>
            </Card>
          </div>

          {/* Confronto Diretto */}
          <Card title="Confronto Diretto: Stato vs Flusso" className="mt-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-700 mb-3">Variabili di Stato (Giorno {currentDay + 1})</h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-blue-100 rounded">
                    <span className="text-sm">CTU:</span>
                    <span className="font-bold">{currentDayData?.CTU_State.toFixed(1)} °C·d</span>
                  </div>
                  <div className="flex justify-between p-2 bg-blue-100 rounded">
                    <span className="text-sm">Biomassa:</span>
                    <span className="font-bold">{currentDayData?.Biomassa_State.toFixed(0)} kg/ha</span>
                  </div>
                  <div className="flex justify-between p-2 bg-blue-100 rounded">
                    <span className="text-sm">LAI:</span>
                    <span className="font-bold">{currentDayData?.LAI_State.toFixed(2)} m²/m²</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-3">Variabili di Flusso (Giorno {currentDay + 1})</h4>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-red-100 rounded">
                    <span className="text-sm">DTU:</span>
                    <span className="font-bold">{currentDayData?.DTU_Flow.toFixed(1)} °C·d/giorno</span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-100 rounded">
                    <span className="text-sm">dB:</span>
                    <span className="font-bold">{currentDayData?.dB_Flow.toFixed(1)} kg/ha/giorno</span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-100 rounded">
                    <span className="text-sm">dLAI:</span>
                    <span className="font-bold">{currentDayData?.dLAI_Flow.toFixed(3)} m²/m²/giorno</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <strong>Bilancio di Massa:</strong> Lo stato al giorno N = Stato al giorno N-1 + Flusso al giorno N.
              In generale: <strong>Stato attuale = Stato precedente + Ingressi - Uscite</strong> (es. acqua, biomassa, CTU).
            </div>
          </Card>
        </Card>
      )}

      {/* Ciclo di Simulazione */}
      <Card title="Ciclo Giornaliero di Simulazione" className="bg-slate-50 border-slate-200">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-brand-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Aggiorna Forzanti</h4>
              <p className="text-sm text-gray-600">
                Leggi/calcola le variabili forzanti per il giorno corrente (Temperatura, Radiazione, Pioggia)
              </p>
              {currentDayData && (
                <div className="mt-2 text-xs bg-yellow-50 p-2 rounded">
                  Esempio: TMAX={currentDayData.TMAX_Forcing.toFixed(1)}°C, 
                  SRAD={currentDayData.SRAD_Forcing.toFixed(2)} MJ/m², 
                  RAIN={currentDayData.RAIN_Forcing.toFixed(1)} mm
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Calcola Flussi</h4>
              <p className="text-sm text-gray-600">
                Calcola le variazioni giornaliere basate su forzanti e stati attuali (DTU, dLAI, dB, ET)
              </p>
              {currentDayData && (
                <div className="mt-2 text-xs bg-red-50 p-2 rounded">
                  Esempio: DTU={currentDayData.DTU_Flow.toFixed(1)}°C·d, 
                  dB={currentDayData.dB_Flow.toFixed(1)} kg/ha
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Aggiorna Stati</h4>
              <p className="text-sm text-gray-600">
                Aggiorna le variabili di stato usando i flussi calcolati: Stato[N] = Stato[N-1] + Flusso[N]
              </p>
              {currentDayData && currentDay > 0 && (
                <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                  Esempio: CTU[N] = CTU[N-1] + DTU[N] = {exampleData[currentDay - 1]?.CTU_State.toFixed(1)} + {currentDayData.DTU_Flow.toFixed(1)} = {currentDayData.CTU_State.toFixed(1)}°C·d
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Development-Growth Decoupling */}
      <Card title="Development–Growth Decoupling: Concetto Chiave per Agrivoltaico" className="border-l-4 border-l-purple-500 bg-purple-50/30">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Target size={18} />
              Il Problema Fondamentale
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              In condizioni di pieno campo, <strong>radiazione solare e temperatura sono correlate positivamente</strong>: 
              giorni soleggiati tendono ad essere più caldi. Sia la crescita (biomassa) che lo sviluppo (fenologia) 
              accelerano insieme.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Sotto sistemi agrivoltaici</strong>, l'ombreggiamento riduce la radiazione fotosintetica (PAR) 
              ma altera la temperatura dell'aria solo moderatamente (1-2°C). Il fotoperiodo non è affatto influenzato. 
              Questo crea un <strong className="text-purple-700">disaccoppiamento</strong> tra sviluppo e crescita.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h5 className="font-semibold text-blue-900 mb-2">Sviluppo (Development)</h5>
              <p className="text-sm text-gray-700 mb-2">
                Guidato da <strong>temperatura e fotoperiodo</strong>. Sotto APV:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Temperatura leggermente ridotta → sviluppo leggermente rallentato</li>
                <li>Fotoperiodo invariato → nessun effetto diretto</li>
                <li><strong>Risultato:</strong> Fenologia procede quasi normalmente</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h5 className="font-semibold text-red-900 mb-2">Crescita (Growth)</h5>
              <p className="text-sm text-gray-700 mb-2">
                Guidata da <strong>radiazione intercettata</strong>. Sotto APV:
              </p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>PAR ridotta del 20-50% → crescita significativamente rallentata</li>
                <li>Biomassa accumulata molto inferiore</li>
                <li><strong>Risultato:</strong> Canopi più piccole, meno biomassa pre-fioritura</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h5 className="font-semibold text-yellow-900 mb-2">Conseguenze del Decoupling</h5>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                Una coltura può raggiungere la fioritura <strong>"in tempo"</strong> (in termini di tempo termico) 
                ma con:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Canopi più piccole</li>
                <li>Meno fusti/rami</li>
                <li>Sistemi radicali ridotti</li>
                <li>Biomassa pre-antesi inferiore</li>
              </ul>
              <p className="mt-2">
                Questo ha effetti a cascata su: <strong>dimensione dei sink</strong> (es. numero di grani), 
                <strong>fornitura di assimilati</strong> durante il riempimento, e infine su 
                <strong>harvest index e resa</strong>.
              </p>
            </div>
          </div>

          {simulationResults.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <h5 className="font-semibold text-purple-900 mb-3">Visualizzazione nel Modello</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Stadio Fenologico (NDS)</div>
                  <div className="text-lg font-bold text-blue-600">
                    {simulationResults[Math.min(currentDay, simulationResults.length - 1)]?.NDS.toFixed(3) || '0.000'}
                  </div>
                  <div className="text-xs text-gray-500">Procede normalmente con temperatura</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Biomassa Totale</div>
                  <div className="text-lg font-bold text-red-600">
                    {simulationResults[Math.min(currentDay, simulationResults.length - 1)]?.B.toFixed(0) || '0'} kg/ha
                  </div>
                  <div className="text-xs text-gray-500">Limitata dalla radiazione intercettata</div>
                </div>
              </div>
              <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-purple-800">
                <strong>Nota:</strong> In un sistema APV reale, la biomassa sarebbe ulteriormente ridotta 
                rispetto a questa simulazione in pieno campo, mentre l'NDS rimarrebbe simile.
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Esercizi Interattivi */}
      <Card title="Esercizi Pratici" className="border-l-4 border-l-orange-500 bg-orange-50/30">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-orange-200">
            <div className="flex items-start gap-2 mb-2">
              <Target className="text-orange-600 mt-0.5" size={18} />
              <h4 className="font-semibold text-gray-900">Esercizio 1: Classificazione</h4>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Classifica le seguenti variabili come Stato, Flusso, Parametro o Forzante:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {['CTU', 'DTU', 'Tbase', 'TMAX', 'LAI', 'dLAI', 'RUE', 'RAIN'].map((varName, i) => {
                const isState = ['CTU', 'LAI'].includes(varName);
                const isFlow = ['DTU', 'dLAI'].includes(varName);
                const isParam = ['Tbase', 'RUE'].includes(varName);
                const isForcing = ['TMAX', 'RAIN'].includes(varName);
                
                return (
                  <div key={i} className="p-2 bg-white border rounded">
                    <div className="font-medium">{varName}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {isState && '✓ Stato (accumula)'}
                      {isFlow && '✓ Flusso (variazione)'}
                      {isParam && '✓ Parametro (costante)'}
                      {isForcing && '✓ Forzante (input esterno)'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-orange-200">
            <div className="flex items-start gap-2 mb-2">
              <Lightbulb className="text-orange-600 mt-0.5" size={18} />
              <h4 className="font-semibold text-gray-900">Esercizio 2: Relazione Stato-Flusso</h4>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Se al giorno 10: CTU = 200°C·d e DTU = 15°C·d, qual è il valore di CTU al giorno 11?
            </p>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm">
              <strong>Risposta:</strong> CTU[11] = CTU[10] + DTU[11] = 200 + 15 = <strong>215°C·d</strong>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};