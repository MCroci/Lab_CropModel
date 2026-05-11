import React, { useEffect, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { CHART_MARGIN } from '../utils/chartMargins';
import { Card, Slider, DownloadAction, LoadingSpinner } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { BookOpen, Gauge } from 'lucide-react';
import { SimulationStep } from '../types';

const LIMIT_FACTORS: {
  key: 'fInt' | 'fTempRUE' | 'fHeat' | 'WSFG';
  short: string;
  label: string;
  color: string;
  hint: string;
}[] = [
  {
    key: 'fInt',
    short: 'f_int',
    label: 'Intercettazione PAR (LAI)',
    color: '#ca8a04',
    hint: 'Bassa con LAI piccolo: poca radiazione intercettata anche se il resto è favorevole.'
  },
  {
    key: 'fTempRUE',
    short: 'f_T',
    label: 'Risposta T (RUE)',
    color: '#2563eb',
    hint: 'Trapezio su Tmedia: freddo o caldo estremo riduce la fotosintesi rispetto all’ottimo.'
  },
  {
    key: 'fHeat',
    short: 'f_heat',
    label: 'Stress caldo (Tmax)',
    color: '#ea580c',
    hint: 'Oltre le soglie (≈35–45 °C) riduce la crescita anche se la Tmedia è ancora nella fascia RUE.'
  },
  {
    key: 'WSFG',
    short: 'WSFG',
    label: 'Stress idrico',
    color: '#059669',
    hint: 'FTSW sotto WSSG: WSFG = FTSW/WSSG (Eq. 15.3).'
  }
];

function summarizeLimitingFactors(rows: SimulationStep[]) {
  const growth = rows.filter((d) => d.NDS < 1);
  if (!growth.length) return null;

  const means: Record<'fInt' | 'fTempRUE' | 'fHeat' | 'WSFG', number> = {
    fInt: 0,
    fTempRUE: 0,
    fHeat: 0,
    WSFG: 0
  };
  const deficits: Record<'fInt' | 'fTempRUE' | 'fHeat' | 'WSFG', number> = {
    fInt: 0,
    fTempRUE: 0,
    fHeat: 0,
    WSFG: 0
  };
  for (const { key } of LIMIT_FACTORS) {
    const vals = growth.map((d) => {
      const v = d[key];
      return typeof v === 'number' && !Number.isNaN(v) ? Math.min(1, Math.max(0, v)) : 1;
    });
    const m = vals.reduce((a, b) => a + b, 0) / vals.length;
    means[key] = m;
    deficits[key] = 1 - m;
  }

  let dominant: (typeof LIMIT_FACTORS)[number]['key'] = 'fInt';
  let maxDef = -1;
  for (const { key } of LIMIT_FACTORS) {
    if (deficits[key] > maxDef) {
      maxDef = deficits[key];
      dominant = key;
    }
  }

  const combinedMean =
    growth.reduce((acc, d) => {
      const fi = d.fInt ?? 1;
      const ft = d.fTempRUE ?? 1;
      const fh = d.fHeat ?? 1;
      const fw = d.WSFG ?? 1;
      return acc + fi * ft * fh * fw;
    }, 0) / growth.length;

  return { means, deficits, dominant, combinedMean, nDays: growth.length };
}

export const BiomassView: React.FC = () => {
  const { cropParams, setCropParams, simulationResults, runSimulation, getCurrentCropSowingDay, isSimulating } = useSimulation();
  const sowingDay = getCurrentCropSowingDay();

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

  const limitingChartData = useMemo(
    () =>
      simulationResults.map((d) => ({
        day: d.day,
        fInt: d.fInt ?? 0,
        fTempRUE: d.fTempRUE ?? 0,
        fHeat: d.fHeat ?? 1,
        WSFG: d.WSFG ?? 1,
        fProd: (d.fInt ?? 1) * (d.fTempRUE ?? 1) * (d.fHeat ?? 1) * (d.WSFG ?? 1)
      })),
    [simulationResults]
  );

  const limitingSummary = useMemo(() => summarizeLimitingFactors(simulationResults), [simulationResults]);
  const dominantMeta = LIMIT_FACTORS.find((f) => f.key === limitingSummary?.dominant);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
          <div className="my-4 border-t pt-4">
            <h4 className="text-sm font-semibold mb-3 text-gray-700">Stress Idrico (FTSW/WSFG)</h4>
            <Slider 
              label="Soglia FTSW (WSSG)" value={cropParams.WSSG ?? 0.25} min={0.1} max={0.5} step={0.05}
              onChange={v => setCropParams(p => ({...p, WSSG: v}))} 
              description="Sotto questa soglia la crescita è limitata (Eq. 15.3)."
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
              <li><strong>f(Heat):</strong> Stress termico (SIMPLE, Zhao et al. 2019): riduce la crescita quando Tmax supera 35°C, azzerandosi sopra ~45°C.</li>
              <li><strong>WSFG (stress idrico):</strong> FTSW &lt; soglia riduce RUE (Eq. 15.3-15.4). WSFG = FTSW/WSSG sotto soglia.</li>
              <li><strong>Effetto CO₂:</strong> RUE_x = RUE_0[1 + b·ln(C_x/C_0)] con b≈0.4 (C4) o 0.8 (C3).</li>
            </ul>
          </div>
        </Card>

        <Card 
          title="Accumulo Biomassa"
          headerAction={<DownloadAction data={chartData} filename="biomassa.csv" />}
        >
          {isSimulating && (
            <div className="flex justify-end mb-2">
              <LoadingSpinner size="sm" text="Aggiornamento simulazione…" />
            </div>
          )}
          <div className="h-[250px] sm:h-[400px] w-full overflow-x-auto">
            <ResponsiveContainer width="100%" minHeight={250}>
              <LineChart data={chartData} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis 
                  dataKey="day" 
                  label={{ value: `Giorno (Semina: giorno ${sowingDay})`, position: 'insideBottom', offset: 0 }} 
                />
                <YAxis label={{ value: 'Biomassa (g/m²)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="B" stroke="#059669" strokeWidth={2} name="Biomassa Totale (B)" dot={false} />
                <Line type="monotone" dataKey="dB_Scaled" stroke="#9333ea" strokeDasharray="3 3" strokeWidth={2} name="Crescita Giornaliera (dB * 20)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Effetti limitanti sulla crescita" headerAction={<Gauge className="text-gray-400" size={18} />}>
          <div className="prose prose-sm max-w-none text-gray-700 mb-4">
            <p>
              La crescita giornaliera segue <strong>ΔB ∝ f<sub>int</sub> · f<sub>T</sub> · f<sub>heat</sub> · WSFG</strong>
              (oltre a RUE, radiazione e termini costanti): ogni fattore è tra 0 e 1; se uno tende a 0, moltiplica tutta la crescita.
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 text-gray-600">
              <li><strong>f<sub>int</sub></strong>: intercettazione PAR, 1 − e<sup>−k·LAI</sup>.</li>
              <li><strong>f<sub>T</sub></strong>: risposta della RUE alla temperatura media (trapezio).</li>
              <li><strong>f<sub>heat</sub></strong>: penalità aggiuntiva per <em>Tmax</em> elevata.</li>
              <li><strong>WSFG</strong>: acqua disponibile (FTSW rispetto a WSSG).</li>
            </ul>
          </div>

          {limitingSummary && dominantMeta && (
            <div className="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              <strong>Vincolo principale (media sul ciclo, NDS &lt; 1):</strong>{' '}
              <span className="font-semibold">{dominantMeta.label}</span>
              {' — '}
              {dominantMeta.hint}
              <span className="block mt-1 text-xs text-amber-900/90">
                Criterio: maggior “deficit” medio (1 − f). Giorni considerati: {limitingSummary.nDays}. Efficienza combinata media:{' '}
                {(limitingSummary.combinedMean * 100).toFixed(1)} % del massimo teorico (tutti i fattori a 1).
              </span>
            </div>
          )}

          {limitingSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
              {LIMIT_FACTORS.map(({ key, short, label, color }) => (
                <div key={key} className="rounded-lg border border-gray-200 bg-gray-50 p-2">
                  <div className="font-medium text-gray-800" style={{ borderLeft: `3px solid ${color}`, paddingLeft: 6 }}>
                    {short}
                  </div>
                  <div className="text-gray-500 mt-0.5 leading-tight">{label}</div>
                  <div className="text-gray-700 mt-1 font-medium">Media: {(limitingSummary.means[key] * 100).toFixed(1)}%</div>
                  <div className="text-gray-500">Deficit: {(limitingSummary.deficits[key] * 100).toFixed(1)}%</div>
                </div>
              ))}
            </div>
          )}

          {!limitingSummary && simulationResults.length > 0 && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
              Nessun giorno con NDS &lt; 1 nei risultati: impossibile calcolare i fattori limitanti sul ciclo (serie meteo o parametri da verificare).
            </p>
          )}

          {limitingChartData.length > 0 ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" minHeight={220}>
              <LineChart data={limitingChartData} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} label={{ value: 'Giorno', position: 'insideBottom', offset: -2 }} />
                <YAxis domain={[0, 1.05]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} label={{ value: 'Fattore (0–100%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: number | string, name: string) => [`${(Number(value) * 100).toFixed(1)}%`, name]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="fInt" stroke="#ca8a04" strokeWidth={2} dot={false} name="f_int (PAR)" />
                <Line type="monotone" dataKey="fTempRUE" stroke="#2563eb" strokeWidth={2} dot={false} name="f_T (RUE)" />
                <Line type="monotone" dataKey="fHeat" stroke="#ea580c" strokeWidth={2} dot={false} name="f_heat" />
                <Line type="monotone" dataKey="WSFG" stroke="#059669" strokeWidth={2} dot={false} name="WSFG" />
                <Line type="monotone" dataKey="fProd" stroke="#7c3aed" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Prodotto (tutti)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          ) : (
            <p className="text-sm text-gray-500 py-8 text-center">Carica meteo ed esegui la simulazione per vedere i fattori limitanti.</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            La linea viola tratteggiata è il <strong>prodotto</strong> dei quattro fattori (efficienza relativa giornaliera). La linea grigia orizzontale è il riferimento 100% (nessuna limitazione).
          </p>
        </Card>
      </div>
    </div>
  );
};