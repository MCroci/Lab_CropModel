import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { Card, Slider } from '../components/UI';
import { CHART_MARGIN } from '../utils/chartMargins';
import { MathFormula } from '../components/MathFormula';
import { Thermometer, Droplet, Sun, Zap, CloudRain, Layers } from 'lucide-react';

// Funzioni di risposta (per demo interattiva)
const tempfunTrapezoid = (t: number, TBD: number, TP1: number, TP2: number, TCD: number): number => {
  if (t <= TBD) return 0;
  if (t < TP1) return (t - TBD) / (TP1 - TBD);
  if (t <= TP2) return 1;
  if (t < TCD) return (TCD - t) / (TCD - TP2);
  return 0;
};

const tempfunTriangular = (t: number, TBD: number, Topt: number, TCD: number): number => {
  if (t <= TBD || t >= TCD) return 0;
  if (t <= Topt) return (t - TBD) / (Topt - TBD);
  return (TCD - t) / (TCD - Topt);
};

const tempfunBeta = (t: number, TBD: number, Topt: number, TCD: number): number => {
  if (t <= TBD || t >= TCD) return 0;
  const a = (t - TBD) / (Topt - TBD);
  const b = (TCD - t) / (TCD - Topt);
  const exp = (Topt - TBD) / (TCD - Topt);
  return a * Math.pow(b, exp);
};

const wsfgFn = (ftsw: number, wssg: number) => (ftsw >= wssg ? 1 : Math.max(0, ftsw / wssg));
const fintBeer = (lai: number, k: number) => 1 - Math.exp(-k * lai);
const fHeatFn = (tmax: number, thresh: number, tExt: number) => {
  if (tmax < thresh) return 1;
  if (tmax >= tExt) return 0;
  return 1 - (tmax - thresh) / (tExt - thresh);
};
const runoffSCSFn = (rain: number, cn: number) => {
  if (rain <= 0 || cn <= 0) return 0;
  const S = 254 * (100 / cn - 1);
  if (S <= 0) return rain;
  if (rain <= 0.2 * S) return 0;
  return Math.pow(rain - 0.2 * S, 2) / (rain + 0.8 * S);
};

export const ResponseFunctionsView: React.FC = () => {
  const [tempShape, setTempShape] = useState<'trapezoid' | 'triangular' | 'beta'>('trapezoid');
  const [TBD, setTBD] = useState(8);
  const [TP1, setTP1] = useState(18);
  const [TP2, setTP2] = useState(28);
  const [TCD, setTCD] = useState(40);
  const [WSSG, setWSSG] = useState(0.25);
  const [KPAR, setKPAR] = useState(0.6);
  const [TmaxThresh, setTmaxThresh] = useState(35);
  const [TmaxExt, setTmaxExt] = useState(45);
  const [CN, setCN] = useState(70);

  const Topt = (TP1 + TP2) / 2;

  const tempData = useMemo(() => {
    return Array.from({ length: 51 }, (_, i) => {
      const t = i;
      let f = 0;
      if (tempShape === 'trapezoid') f = tempfunTrapezoid(t, TBD, TP1, TP2, TCD);
      else if (tempShape === 'triangular') f = tempfunTriangular(t, TBD, Topt, TCD);
      else f = tempfunBeta(t, TBD, Topt, TCD);
      return { t, f: Math.round(f * 1000) / 1000 };
    });
  }, [tempShape, TBD, TP1, TP2, TCD, Topt]);

  const wsfgData = useMemo(() => {
    return Array.from({ length: 101 }, (_, i) => {
      const ftsw = i / 100;
      return { ftsw, wsfg: Math.round(wsfgFn(ftsw, WSSG) * 1000) / 1000 };
    });
  }, [WSSG]);

  const fintData = useMemo(() => {
    return Array.from({ length: 81 }, (_, i) => {
      const lai = i * 0.1;
      return { lai, fint: Math.round(fintBeer(lai, KPAR) * 1000) / 1000 };
    });
  }, [KPAR]);

  const heatData = useMemo(() => {
    return Array.from({ length: 56 }, (_, i) => {
      const tmax = i;
      return { tmax, fHeat: Math.round(fHeatFn(tmax, TmaxThresh, TmaxExt) * 1000) / 1000 };
    });
  }, [TmaxThresh, TmaxExt]);

  const runoffData = useMemo(() => {
    return Array.from({ length: 101 }, (_, i) => {
      const rain = i * 2;
      return { rain, runoff: Math.round(runoffSCSFn(rain, CN) * 10) / 10 };
    });
  }, [CN]);

  return (
    <div className="space-y-8">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
        <h2 className="text-xl font-bold text-amber-900">Funzioni di Risposta del Modello</h2>
        <p className="text-amber-800 mt-1 text-sm">
          Ogni processo fisiologico usa una funzione che mappa un input (temperatura, LAI, acqua, …) in un fattore moltiplicativo (0–1).
          Qui puoi vedere la forma delle curve e come cambiano con i parametri.
        </p>
      </div>

      {/* 1. Risposta alla temperatura */}
      <Card title="1. Risposta alla Temperatura (tempfun / TCFRUE)" className="border-l-4 border-l-orange-500" headerAction={<Thermometer className="text-orange-500" />}>
        <p className="text-sm text-gray-700 mb-3">
          Usata per <strong>DTU</strong> (Eq. 6.1) e <strong>RUE</strong> (Eq. 10.3). Determina quanto la temperatura favorisce o limita lo sviluppo e la fotosintesi.
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          {(['trapezoid', 'triangular', 'beta'] as const).map(s => (
            <button
              key={s}
              onClick={() => setTempShape(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tempShape === s ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {s === 'trapezoid' ? 'Trapezoidale (default)' : s === 'triangular' ? 'Triangolare' : 'Beta'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Slider label="T base (TBD)" value={TBD} min={0} max={20} step={1} onChange={setTBD} unit="°C" />
            <Slider label="T ottimale 1 (TP1)" value={TP1} min={10} max={35} step={1} onChange={setTP1} unit="°C" />
            <Slider label="T ottimale 2 (TP2)" value={TP2} min={15} max={40} step={1} onChange={setTP2} unit="°C" />
            <Slider label="T ceiling (TCD)" value={TCD} min={25} max={50} step={1} onChange={setTCD} unit="°C" />
          </div>
          <div className="bg-slate-50 p-4 rounded border border-slate-200 text-sm">
            <div className="font-semibold mb-2">Equazione</div>
            {tempShape === 'trapezoid' && (
              <div className="space-y-1 text-slate-700">
                <div>f = 0 se T ≤ TBD</div>
                <div>f = (T − TBD)/(TP1 − TBD) se TBD &lt; T &lt; TP1</div>
                <div>f = 1 se TP1 ≤ T ≤ TP2</div>
                <div>f = (TCD − T)/(TCD − TP2) se TP2 &lt; T &lt; TCD</div>
                <div>f = 0 se T ≥ TCD</div>
              </div>
            )}
            {tempShape === 'triangular' && (
              <MathFormula formula="f = \\frac{T-T_{base}}{T_{opt}-T_{base}} \\cdot \\frac{T_{max}-T}{T_{max}-T_{opt}}" display className="block" />
            )}
            {tempShape === 'beta' && (
              <MathFormula formula="f = \\frac{T-T_{base}}{T_{opt}-T_{base}} \\left(\\frac{T_{max}-T}{T_{max}-T_{opt}}\\right)^{\\frac{T_{opt}-T_{base}}{T_{max}-T_{opt}}}" display className="block" />
            )}
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="t" label={{ value: 'Temperatura (°C)', position: 'insideBottom', offset: 0 }} />
              <YAxis domain={[0, 1.1]} label={{ value: 'f(T)', angle: -90, position: 'insideLeft' }} />
              <ReferenceLine x={TBD} stroke="#94a3b8" strokeDasharray="2 2" />
              <ReferenceLine x={TP1} stroke="#22c55e" strokeDasharray="2 2" />
              <ReferenceLine x={TP2} stroke="#22c55e" strokeDasharray="2 2" />
              <ReferenceLine x={TCD} stroke="#ef4444" strokeDasharray="2 2" />
              <Tooltip />
              <Line type="monotone" dataKey="f" stroke="#ea580c" strokeWidth={2} dot={false} name="f(T)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. FTSW → WSFG */}
      <Card title="2. Stress Idrico: FTSW → WSFG (Eq. 15.3)" className="border-l-4 border-l-blue-500" headerAction={<Droplet className="text-blue-500" />}>
        <p className="text-sm text-gray-700 mb-3">
          FTSW = acqua transpirabile disponibile / totale. Sotto la soglia WSSG la crescita è ridotta linearmente.
        </p>
        <div className="flex gap-4 mb-4">
          <Slider label="Soglia WSSG" value={WSSG} min={0.1} max={0.5} step={0.05} onChange={setWSSG} className="max-w-xs" />
        </div>
        <div className="bg-slate-50 p-3 rounded border border-slate-200 text-sm mb-4 font-mono">
          WSFG = 1 se FTSW ≥ WSSG &nbsp;&nbsp;|&nbsp;&nbsp; WSFG = FTSW/WSSG se FTSW &lt; WSSG
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wsfgData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ftsw" label={{ value: 'FTSW', position: 'insideBottom', offset: 0 }} />
              <YAxis domain={[0, 1.1]} label={{ value: 'WSFG', angle: -90, position: 'insideLeft' }} />
              <ReferenceLine x={WSSG} stroke="#3b82f6" strokeDasharray="2 2" />
              <Tooltip />
              <Line type="monotone" dataKey="wsfg" stroke="#2563eb" strokeWidth={2} dot={false} name="WSFG" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 3. Beer-Lambert FINT */}
      <Card title="3. Intercettazione Radiativa: Legge di Beer-Lambert (FINT)" className="border-l-4 border-l-amber-500" headerAction={<Sun className="text-amber-500" />}>
        <p className="text-sm text-gray-700 mb-3">
          Frazione di PAR intercettata dal canopy. <MathFormula formula="F_{int} = 1 - e^{-k \\cdot LAI}" />.
        </p>
        <div className="flex gap-4 mb-4">
          <Slider label="K (KPAR)" value={KPAR} min={0.3} max={1.0} step={0.05} onChange={setKPAR} className="max-w-xs" />
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fintData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lai" label={{ value: 'LAI (m²/m²)', position: 'insideBottom', offset: 0 }} />
              <YAxis domain={[0, 1.05]} label={{ value: 'FINT', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="fint" stroke="#d97706" strokeWidth={2} dot={false} name="FINT" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 4. Heat stress */}
      <Card title="4. Stress Termico (fHeat) – SIMPLE" className="border-l-4 border-l-red-500" headerAction={<Zap className="text-red-500" />}>
        <p className="text-sm text-gray-700 mb-3">
          Riduce la crescita quando Tmax supera la soglia. Lineare tra soglia e temperatura estrema, poi zero.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <Slider label="Tmax soglia" value={TmaxThresh} min={28} max={40} step={1} onChange={setTmaxThresh} unit="°C" />
          <Slider label="Tmax estrema" value={TmaxExt} min={38} max={50} step={1} onChange={setTmaxExt} unit="°C" />
        </div>
        <div className="bg-slate-50 p-3 rounded border border-slate-200 text-sm mb-4 font-mono">
          fHeat = 1 se Tmax &lt; soglia &nbsp;&nbsp;|&nbsp;&nbsp; fHeat = 0 se Tmax ≥ estrema &nbsp;&nbsp;|&nbsp;&nbsp; lineare tra le due
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={heatData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tmax" label={{ value: 'Tmax (°C)', position: 'insideBottom', offset: 0 }} />
              <YAxis domain={[0, 1.1]} label={{ value: 'fHeat', angle: -90, position: 'insideLeft' }} />
              <ReferenceLine x={TmaxThresh} stroke="#f97316" strokeDasharray="2 2" />
              <ReferenceLine x={TmaxExt} stroke="#dc2626" strokeDasharray="2 2" />
              <Tooltip />
              <Line type="monotone" dataKey="fHeat" stroke="#ef4444" strokeWidth={2} dot={false} name="fHeat" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 5. Runoff SCS */}
      <Card title="5. Runoff – Metodo SCS Curve Number (Eq. 14.14)" className="border-l-4 border-l-cyan-500" headerAction={<CloudRain className="text-cyan-500" />}>
        <p className="text-sm text-gray-700 mb-3">
          <MathFormula formula="S = 254(100/CN - 1)" /> &nbsp;
          <MathFormula formula="RO = \\frac{(P - 0.2S)^2}{P + 0.8S}" /> se P &gt; 0.2S
        </p>
        <div className="flex gap-4 mb-4">
          <Slider label="Curve Number (CN)" value={CN} min={50} max={95} step={5} onChange={setCN} className="max-w-xs" />
        </div>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={runoffData} margin={CHART_MARGIN}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rain" label={{ value: 'Pioggia (mm)', position: 'insideBottom', offset: 0 }} />
              <YAxis label={{ value: 'Runoff (mm)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="runoff" stroke="#0891b2" strokeWidth={2} dot={false} name="Runoff" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 6. Flusso del modello */}
      <Card title="6. Sequenza degli Step nel Modello" className="border-l-4 border-l-emerald-600" headerAction={<Layers className="text-emerald-600" />}>
        <div className="text-sm text-gray-700 space-y-2">
          <p className="font-semibold">Per ogni giorno, nell'ordine:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li><strong>FTSW</strong> da bilancio idrico (W, W_wp, W_fc) → <strong>WSFG</strong></li>
            <li><strong>tempfun(T)</strong> → <strong>DTU</strong> (Eq. 6.2), accumulo CTU, NDS</li>
            <li><strong>TCFRUE(T)</strong> per RUE (stessa forma di tempfun)</li>
            <li><strong>LAI</strong> da laiStep (logistica + senescenza)</li>
            <li><strong>FINT</strong> = 1 − exp(−k·LAI)</li>
            <li><strong>fHeat(Tmax)</strong></li>
            <li><strong>DDMP</strong> = PAR × FINT × RUE × TCFRUE × WSFG × fHeat</li>
            <li>Bilancio idrico: Runoff (SCS), Drenaggio, ET, aggiornamento W</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};
