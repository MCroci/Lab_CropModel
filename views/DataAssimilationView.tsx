import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CHART_MARGIN } from '../utils/chartMargins';
import { Card, Slider } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { simulateCrop } from '../services/cropModel';
import { CropParams } from '../types';
import { BookOpen } from 'lucide-react';

/**
 * Assimilazione sequenziale 1D: a ogni giorno con osservazione
 * x_corr = x_mod + K * (y_oss - x_mod). Senza oss. si usa il modello.
 */
const assimilateSequential = (
  modelSeries: { day: number; value: number }[],
  obs: { day: number; value: number }[],
  gain: number
): { day: number; value: number }[] => {
  const obsMap = new Map(obs.map(o => [o.day, o.value]));
  return modelSeries.map(({ day, value }) => {
    if (obsMap.has(day)) {
      const yObs = obsMap.get(day)!;
      return { day, value: value + gain * (yObs - value) };
    }
    return { day, value };
  });
};

export const DataAssimilationView: React.FC = () => {
  const { dailyWeather, cropParams, simulationResults } = useSimulation();
  const [obsFreq, setObsFreq] = useState(25);
  const [obsNoiseSd, setObsNoiseSd] = useState(0.15);
  const [assimGain, setAssimGain] = useState(0.6);
  const [modelBias, setModelBias] = useState(0.85);

  // Genera dati: "verità" (riferimento), modello con bias, osservazioni sparse rumorose
  const { truthSeries, modelSeries, obsPoints, assimilatedSeries } = useMemo(() => {
    if (!dailyWeather.length || !simulationResults.length) {
      return { truthSeries: [], modelSeries: [], obsPoints: [], assimilatedSeries: [] };
    }

    const truthSteps = simulationResults;
    const truth = truthSteps.map(s => ({ day: s.day, value: s.LAI }));

    const biasedParams: CropParams = { ...cropParams, RUE: cropParams.RUE * modelBias };
    const modelSteps = simulateCrop(dailyWeather, biasedParams);
    const model = modelSteps.map(s => ({ day: s.day, value: s.LAI }));

    const obs: { day: number; value: number }[] = [];
    for (let d = 1; d <= (truthSteps[truthSteps.length - 1]?.day ?? 365); d += obsFreq) {
      const t = truthSteps.find(s => s.day === d);
      if (t) {
        const noise = (Math.random() - 0.5) * 2 * obsNoiseSd * Math.max(t.LAI, 0.1);
        obs.push({ day: d, value: Math.max(0, t.LAI + noise) });
      }
    }

    const assim = assimilateSequential(model, obs, assimGain);

    return {
      truthSeries: truth,
      modelSeries: model,
      obsPoints: obs,
      assimilatedSeries: assim
    };
  }, [dailyWeather, cropParams, modelBias, obsFreq, obsNoiseSd, assimGain, simulationResults]);

  const chartData = useMemo(() => {
    const maxLen = Math.max(
      truthSeries.length,
      modelSeries.length,
      assimilatedSeries.length
    );
    const obsMap = new Map(obsPoints.map(o => [o.day, o.value]));
    const result: Array<Record<string, number | undefined>> = [];
    for (let i = 0; i < maxLen; i++) {
      const day = truthSeries[i]?.day ?? modelSeries[i]?.day ?? assimilatedSeries[i]?.day ?? i + 1;
      result.push({
        day,
        Verità: truthSeries[i]?.value,
        Modello: modelSeries[i]?.value,
        Assimilato: assimilatedSeries[i]?.value,
        Osservazioni: obsMap.get(day)
      });
    }
    return result;
  }, [truthSeries, modelSeries, assimilatedSeries, obsPoints]);

  const rmseModel = useMemo(() => {
    if (truthSeries.length === 0 || modelSeries.length === 0) return 0;
    let sum = 0;
    let n = 0;
    for (let i = 0; i < truthSeries.length; i++) {
      const m = modelSeries.find(s => s.day === truthSeries[i].day);
      if (m) {
        sum += (m.value - truthSeries[i].value) ** 2;
        n++;
      }
    }
    return n > 0 ? Math.sqrt(sum / n) : 0;
  }, [truthSeries, modelSeries]);

  const rmseAssim = useMemo(() => {
    if (truthSeries.length === 0 || assimilatedSeries.length === 0) return 0;
    let sum = 0;
    let n = 0;
    for (let i = 0; i < truthSeries.length; i++) {
      const a = assimilatedSeries.find(s => s.day === truthSeries[i].day);
      if (a) {
        sum += (a.value - truthSeries[i].value) ** 2;
        n++;
      }
    }
    return n > 0 ? Math.sqrt(sum / n) : 0;
  }, [truthSeries, assimilatedSeries]);

  return (
    <div className="space-y-6">
      <Card title="Data Assimilation" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400" />}>
        <div className="prose prose-sm max-w-none text-slate-700">
          <p>
            La <strong>data assimilation</strong> combina le previsioni del modello con osservazioni (es. satellitari LAI/FPAR)
            per migliorare la stima dello stato della coltura.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 mt-2">
            <li><strong>Modello:</strong> evolve lo stato nel tempo ma può avere errori (parametri, condizioni iniziali).</li>
            <li><strong>Osservazioni:</strong> misure reali (satellite, campo) ma sparse e rumorose.</li>
            <li><strong>Assimilazione:</strong> correzione sequenziale: a ogni osservazione, lo stato viene aggiornato verso il valore osservato (es. filtro di Kalman, EnKF).</li>
          </ul>
          <p className="text-xs text-slate-500 mt-3">
            Riferimento: EnKF per modello SIMPLE (LUEr, Zhao et al. 2019) — calibrazione di I50A, RUE, biomassa tramite fSolar/FPAR.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Parametri Demo">
          <p className="text-xs text-gray-600 mb-4">
            Demo didattica: &quot;Verità&quot; = simulazione attuale. Modello con RUE ridotta (bias). Osservazioni = campioni rumorosi.
          </p>
          <Slider
            label="Bias modello (RUE ×)"
            value={modelBias}
            min={0.6}
            max={1.1}
            step={0.05}
            onChange={setModelBias}
            description="Riduce RUE per simulare errore parametrico."
          />
          <Slider
            label="Frequenza oss. (giorni)"
            value={obsFreq}
            min={10}
            max={50}
            step={5}
            onChange={setObsFreq}
            description="Ogni quanti giorni arrivano osservazioni."
          />
          <Slider
            label="Rumore osservazioni (σ)"
            value={obsNoiseSd}
            min={0.02}
            max={0.5}
            step={0.02}
            onChange={setObsNoiseSd}
            description="Deviazione standard del rumore."
          />
          <Slider
            label="Guadagno assimilazione (K)"
            value={assimGain}
            min={0.2}
            max={1}
            step={0.1}
            onChange={setAssimGain}
            description="Peso dell'osservazione nell'aggiornamento (0-1)."
          />
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Confronto LAI: Verità vs Modello vs Assimilato">
            <div className="h-[350px] w-full">
              <ResponsiveContainer>
                <ComposedChart data={chartData} margin={CHART_MARGIN}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: 0 }} />
                  <YAxis label={{ value: 'LAI (m²/m²)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Verità" stroke="#22c55e" strokeWidth={2} dot={false} name="Verità (riferimento)" />
                  <Line type="monotone" dataKey="Modello" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1.5} dot={false} name="Modello (bias)" />
                  <Line type="monotone" dataKey="Assimilato" stroke="#3b82f6" strokeWidth={2} dot={false} name="Assimilato" />
                  <Line type="monotone" dataKey="Osservazioni" stroke="none" dot={{ fill: '#ef4444', r: 5 }} connectNulls={false} name="Osservazioni" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              RMSE Modello: <strong>{rmseModel.toFixed(3)}</strong> — RMSE Assimilato: <strong>{rmseAssim.toFixed(3)}</strong>
              {rmseAssim < rmseModel && <span className="text-green-600 ml-2">✓ Miglioramento</span>}
            </p>
          </Card>

          <Card title="Schema Assimilazione" className="bg-blue-50 border-blue-200">
            <div className="text-sm text-blue-900 space-y-2">
              <p><strong>Aggiornamento sequenziale (1D):</strong></p>
              <code className="block bg-white p-2 rounded text-xs">x_corretto = x_modello + K × (y_osservato − x_modello)</code>
              <p>Con K = guadagno (0–1). K alto = più fiducia nell&apos;osservazione.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
