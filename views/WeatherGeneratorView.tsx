import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart
} from 'recharts';
import { CHART_MARGIN, CHART_MARGIN_DUAL_Y } from '../utils/chartMargins';
import { Card, Slider, Button, DownloadAction } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { RefreshCw, CloudRain, Globe, Upload, MapPin, AlertCircle, Loader2, ThermometerSun } from 'lucide-react';
import { DailyWeather } from '../types';
import L from 'leaflet';
import { simulateCropAndWater } from '../services/cropModel';

const MONTHS_IT = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'] as const;

type SeasonChartMode = 'monthly' | 'crop' | 'custom';

function doyToMonthIndex(doy: number): number {
  const d = Math.max(1, Math.min(365, Math.round(doy)));
  return new Date(2001, 0, d).getMonth();
}

function isSequentialDayIndex(weather: DailyWeather[]): boolean {
  return weather.length > 0 && weather.every((row, idx) => row.day === idx + 1);
}

function sliceWeatherByDoyRange(weather: DailyWeather[], startDoy: number, endDoy: number): DailyWeather[] {
  const s = Math.max(1, Math.min(366, Math.round(startDoy)));
  const e = Math.max(1, Math.min(366, Math.round(endDoy)));
  if (s <= e) {
    return weather.filter((row) => row.day >= s && row.day <= e).sort((a, b) => a.day - b.day);
  }
  const hi = weather.filter((row) => row.day >= s).sort((a, b) => a.day - b.day);
  const lo = weather.filter((row) => row.day <= e).sort((a, b) => a.day - b.day);
  return [...hi, ...lo];
}

function describeSlice(rows: DailyWeather[], tbaseGdd: number) {
  if (!rows.length) {
    return {
      nDays: 0,
      rainTot: 0,
      rainDays: 0,
      rainMax: 0,
      tMean: 0,
      tminMean: 0,
      tmaxMean: 0,
      sradMean: 0,
      gddSum: 0
    };
  }
  let rainTot = 0;
  let rainDays = 0;
  let rainMax = 0;
  let tSum = 0;
  let tminSum = 0;
  let tmaxSum = 0;
  let sradSum = 0;
  let gddSum = 0;
  for (const w of rows) {
    rainTot += w.RAIN;
    if (w.RAIN > 0.1) rainDays += 1;
    rainMax = Math.max(rainMax, w.RAIN);
    const tavg = (w.TMIN + w.TMAX) / 2;
    tSum += tavg;
    tminSum += w.TMIN;
    tmaxSum += w.TMAX;
    sradSum += w.SRAD;
    gddSum += Math.max(0, tavg - tbaseGdd);
  }
  const n = rows.length;
  return {
    nDays: n,
    rainTot,
    rainDays,
    rainMax,
    tMean: tSum / n,
    tminMean: tminSum / n,
    tmaxMean: tmaxSum / n,
    sradMean: sradSum / n,
    gddSum
  };
}

type SliceStats = ReturnType<typeof describeSlice>;

function SeasonStatsPanel({ stats, tbase }: { stats: SliceStats; tbase: number }) {
  if (!stats.nDays) {
    return <p className="text-xs text-gray-500">Nessun dato nel periodo selezionato.</p>;
  }
  const fmt = (x: number, d = 1) => x.toFixed(d);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <div className="text-xs text-gray-500">Giorni</div>
        <div className="font-semibold text-gray-900">{stats.nDays}</div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <div className="text-xs text-gray-500">Pioggia totale</div>
        <div className="font-semibold text-gray-900">{fmt(stats.rainTot, 1)} mm</div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <div className="text-xs text-gray-500">Giorni con pioggia (&gt;0,1 mm)</div>
        <div className="font-semibold text-gray-900">{stats.rainDays}</div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <div className="text-xs text-gray-500">T media aria</div>
        <div className="font-semibold text-gray-900">{fmt(stats.tMean, 1)} °C</div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <div className="text-xs text-gray-500">T min / T max medie</div>
        <div className="font-semibold text-gray-900">
          {fmt(stats.tminMean, 1)} / {fmt(stats.tmaxMean, 1)} °C
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <div className="text-xs text-gray-500">Radiazione media (SRAD)</div>
        <div className="font-semibold text-gray-900">{fmt(stats.sradMean, 2)} MJ m⁻² d⁻¹</div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 md:col-span-2">
        <div className="text-xs text-gray-500">Somma gradi giorno semplice (Σ max(0, Tmedia − Tbase)), Tbase = {tbase} °C</div>
        <div className="font-semibold text-gray-900">{fmt(stats.gddSum, 0)} °C·d</div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
        <div className="text-xs text-gray-500">Massimo giornaliero di pioggia</div>
        <div className="font-semibold text-gray-900">{fmt(stats.rainMax, 1)} mm</div>
      </div>
    </div>
  );
}

function aggregateMonthly(
  weather: DailyWeather[],
  tbaseForGdd: number
): { chartRows: { name: string; pioggia: number; tMedia: number; giorni: number; gdd: number }[]; note?: string } {
  const n = weather.length;
  if (!n) return { chartRows: [] };

  const sequential = isSequentialDayIndex(weather);
  const chartRows: { name: string; pioggia: number; tMedia: number; giorni: number; gdd: number }[] = [];

  if (sequential && n >= 360 && n <= 366) {
    const buckets = Array.from({ length: 12 }, () => ({
      pioggia: 0,
      tSum: 0,
      gdd: 0,
      count: 0
    }));
    for (const w of weather) {
      const m = doyToMonthIndex(w.day);
      buckets[m].pioggia += w.RAIN;
      buckets[m].tSum += (w.TMIN + w.TMAX) / 2;
      buckets[m].gdd += Math.max(0, (w.TMIN + w.TMAX) / 2 - tbaseForGdd);
      buckets[m].count += 1;
    }
    for (let m = 0; m < 12; m++) {
      const b = buckets[m];
      chartRows.push({
        name: MONTHS_IT[m],
        pioggia: b.pioggia,
        tMedia: b.count ? b.tSum / b.count : 0,
        giorni: b.count,
        gdd: b.gdd
      });
    }
    return { chartRows };
  }

  let note = 'Serie non allineata a un anno solare (1…N): i 12 intervalli sono segmenti consecutivi di uguale lunghezza.';
  for (let m = 0; m < 12; m++) {
    const startIdx = Math.floor((m * n) / 12);
    const endIdx = Math.floor(((m + 1) * n) / 12) - 1;
    const chunk = weather.slice(startIdx, endIdx + 1);
    const st = describeSlice(chunk, tbaseForGdd);
    chartRows.push({
      name: `S${m + 1}`,
      pioggia: st.rainTot,
      tMedia: st.tMean,
      giorni: st.nDays,
      gdd: chunk.reduce((acc, w) => acc + Math.max(0, (w.TMIN + w.TMAX) / 2 - tbaseForGdd), 0)
    });
  }
  return { chartRows, note };
}

// Modelli climatici Open-Meteo (CMIP6 HighResMip)
const CLIMATE_MODELS = [
  { id: 'CMCC_CM2_VHR4', label: 'CMCC-CM2-VHR4 (IT)' },
  { id: 'FGOALS_f3_H', label: 'FGOALS-f3-H (CN)' },
  { id: 'HiRAM_SIT_HR', label: 'HiRAM-SIT-HR (TW)' },
  { id: 'MRI_AGCM3_2_S', label: 'MRI-AGCM3-2-S (JP)' },
  { id: 'EC_Earth3P_HR', label: 'EC-Earth3P-HR (EU)' },
  { id: 'MPI_ESM1_2_XR', label: 'MPI-ESM1-2-XR (DE)' },
  { id: 'NICAM16_8S', label: 'NICAM16-8S (JP)' },
] as const;

// --- Map Component ---
// Encapsulates Leaflet logic to avoid SSR/ESM issues with react-leaflet
const MapPicker: React.FC<{ lat: number; lon: number; onSelect: (lat: number, lon: number) => void }> = ({ lat, lon, onSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([42.5, 12.5], 5); // Center on Italy

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Fix default icon issues in Webpack/ESM environments
      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Handle Clicks
      map.on('click', (e) => {
        onSelect(parseFloat(e.latlng.lat.toFixed(2)), parseFloat(e.latlng.lng.toFixed(2)));
      });

      mapInstanceRef.current = map;
      
      // Init Marker
      markerRef.current = L.marker([lat, lon], { icon: defaultIcon }).addTo(map);
    }
  }, []); // Run once on mount

  // Update Marker & Pan when props change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const newLatLng = new L.LatLng(lat, lon);
      markerRef.current.setLatLng(newLatLng);
      // Optional: Pan to new location if it changes drastically, or just keep user view
      // mapInstanceRef.current.panTo(newLatLng); 
    }
  }, [lat, lon]);

  return <div ref={mapContainerRef} className="w-full h-[300px] rounded-lg border border-gray-300 z-0 relative" />;
};

export const WeatherGeneratorView: React.FC = () => {
  const {
    weatherParams,
    setWeatherParams,
    dailyWeather,
    setDailyWeather,
    generateWeather,
    cropParams,
    soilParams,
    getCurrentCropSowingDay
  } = useSimulation();

  const [mode, setMode] = useState<'synthetic' | 'era5' | 'csv' | 'climate'>('synthetic');
  const [seasonMode, setSeasonMode] = useState<SeasonChartMode>('monthly');
  const [customDoyStart, setCustomDoyStart] = useState(91);
  const [customDoyEnd, setCustomDoyEnd] = useState(243);
  
  // ERA5 / Climate shared coords
  const [lat, setLat] = useState(45.46); // Milano default
  const [lon, setLon] = useState(9.19);
  const [year, setYear] = useState(2023);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Climate State (Open-Meteo Climate API, 1950-2050)
  const [climateStartDate, setClimateStartDate] = useState('2040-01-01');
  const [climateEndDate, setClimateEndDate] = useState('2040-12-31');
  const [climateModel, setClimateModel] = useState<string>(CLIMATE_MODELS[0].id);

  // CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const cropSeasonBounds = useMemo(() => {
    if (!dailyWeather.length) {
      return { sowSim: 1, firstDay: 1, lastDay: 1, hasCrop: false };
    }
    const sowSim = Math.min(Math.max(1, getCurrentCropSowingDay()), dailyWeather.length);
    const { crop } = simulateCropAndWater(dailyWeather, cropParams, soilParams, sowSim);
    if (!crop.length) {
      return {
        sowSim,
        firstDay: dailyWeather[0].day,
        lastDay: dailyWeather[dailyWeather.length - 1].day,
        hasCrop: false
      };
    }
    return {
      sowSim,
      firstDay: crop[0].day,
      lastDay: crop[crop.length - 1].day,
      hasCrop: true
    };
  }, [dailyWeather, cropParams, soilParams, getCurrentCropSowingDay]);

  const seasonAnalysis = useMemo(() => {
    const tb = cropParams.Tbase;
    if (!dailyWeather.length) {
      return { kind: 'empty' as const };
    }
    if (seasonMode === 'monthly') {
      const { chartRows, note } = aggregateMonthly(dailyWeather, tb);
      const stats = describeSlice(dailyWeather, tb);
      return {
        kind: 'monthly' as const,
        chartRows,
        note,
        stats,
        header: 'Riepilogo per mese'
      };
    }
    let slice: DailyWeather[] = [];
    let header = '';
    if (seasonMode === 'crop') {
      slice = sliceWeatherByDoyRange(dailyWeather, cropSeasonBounds.firstDay, cropSeasonBounds.lastDay);
      header = `Stagione colturale (meteo dal giorno ${cropSeasonBounds.firstDay} al ${cropSeasonBounds.lastDay}; maturità a NDS≥1 nel modello colturale)`;
    } else {
      slice = sliceWeatherByDoyRange(dailyWeather, customDoyStart, customDoyEnd);
      header = `Intervallo personalizzato (indice giorno nell’anno di simulazione ${customDoyStart} → ${customDoyEnd})`;
    }
    if (!slice.length) {
      slice = [...dailyWeather].sort((a, b) => a.day - b.day);
      header = `${header} — nessun giorno nell’intervallo, mostro l’intera serie`;
    }
    const stats = describeSlice(slice, tb);
    let cum = 0;
    const dailyRows = slice.map((w) => {
      cum += w.RAIN;
      return {
        day: w.day,
        pioggia: w.RAIN,
        pioggiaCum: Number(cum.toFixed(1)),
        tMedia: Number(((w.TMIN + w.TMAX) / 2).toFixed(2)),
        srad: w.SRAD
      };
    });
    return { kind: 'range' as const, dailyRows, stats, header };
  }, [
    dailyWeather,
    seasonMode,
    cropParams.Tbase,
    cropSeasonBounds,
    customDoyStart,
    customDoyEnd
  ]);

  // --- ERA5 Fetch Logic ---
  const fetchEra5Data = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Open-Meteo Historical Weather API (Uses ERA5-Land)
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,shortwave_radiation_sum&timezone=auto`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Errore nel recupero dati meteo.");
      
      const data = await response.json();

      if (!data.daily) throw new Error("Formato dati non valido.");

      // Map API result to DailyWeather format
      const newWeather: DailyWeather[] = data.daily.time.map((t: string, index: number) => ({
        day: index + 1,
        TMAX: data.daily.temperature_2m_max[index],
        TMIN: data.daily.temperature_2m_min[index],
        RAIN: data.daily.precipitation_sum[index],
        // ERA5 Shortwave is in MJ/m² in daily aggregation for Open-Meteo
        SRAD: data.daily.shortwave_radiation_sum[index] 
      }));

      // Update Context
      if (typeof setDailyWeather === 'function') {
         setDailyWeather(newWeather);
         // n_days è sempre 365, non viene modificato
      }

    } catch (err: any) {
      setError(err.message || "Errore sconosciuto");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Climate API (Open-Meteo Climate, CMIP6 proiezioni 1950-2050) ---
  const fetchClimateData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        start_date: climateStartDate,
        end_date: climateEndDate,
        models: climateModel,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,shortwave_radiation_sum',
      });
      const url = `https://climate-api.open-meteo.com/v1/climate?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error((errBody as { reason?: string }).reason || response.statusText);
      }
      const data = await response.json();
      if (!data.daily?.time?.length) throw new Error('Formato dati non valido.');
      const times = data.daily.time as string[];
      const tmax = (data.daily.temperature_2m_max ?? []) as number[];
      const tmin = (data.daily.temperature_2m_min ?? []) as number[];
      const rain = (data.daily.precipitation_sum ?? []) as number[];
      const srad = (data.daily.shortwave_radiation_sum ?? []) as number[];
      const newWeather: DailyWeather[] = times.map((_, i) => ({
        day: i + 1,
        TMAX: tmax[i] ?? 0,
        TMIN: tmin[i] ?? 0,
        RAIN: rain[i] ?? 0,
        SRAD: srad[i] ?? 0,
      }));
      if (typeof setDailyWeather === 'function') setDailyWeather(newWeather);
    } catch (err: any) {
      setError(err.message || 'Errore recupero dati climatici');
    } finally {
      setIsLoading(false);
    }
  };

  // --- CSV Logic ---
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toUpperCase());
        
        // Expected headers: DAY, TMIN, TMAX, RAIN, SRAD
        const newWeather: DailyWeather[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = lines[i].split(',');
          const row: any = {};
          headers.forEach((h, idx) => row[h] = parseFloat(cols[idx]));
          
          if (!isNaN(row.TMIN) && !isNaN(row.TMAX)) {
             newWeather.push({
               day: row.DAY || i,
               TMIN: row.TMIN,
               TMAX: row.TMAX,
               RAIN: row.RAIN || 0,
               SRAD: row.SRAD || 0
             });
          }
        }

        if (newWeather.length > 0 && typeof setDailyWeather === 'function') {
           setDailyWeather(newWeather);
           // n_days è sempre 365, non viene modificato
        }
      } catch (err) {
        setError("Errore parsing CSV. Assicurati che le colonne siano: DAY,TMIN,TMAX,RAIN,SRAD");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        
        {/* Source Selector */}
        <div className="flex flex-wrap gap-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
           <button 
             onClick={() => setMode('synthetic')}
             className={`flex-1 min-w-0 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'synthetic' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Sintetico
           </button>
           <button 
             onClick={() => setMode('era5')}
             className={`flex-1 min-w-0 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'era5' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
           >
             ERA5
           </button>
           <button 
             onClick={() => setMode('climate')}
             className={`flex-1 min-w-0 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'climate' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Climate
           </button>
           <button 
             onClick={() => setMode('csv')}
             className={`flex-1 min-w-0 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'csv' ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:text-gray-700'}`}
           >
             CSV
           </button>
        </div>

        {/* CONTROLS: SYNTHETIC */}
        {mode === 'synthetic' && (
          <Card title="Generatore Stocastico">
            <p className="text-sm text-gray-600 mb-4">
              Crea dati climatici ideali basati su medie stagionali.
            </p>
            
            <Slider 
              label="Temperatura Media (°C)" value={weatherParams.tmean} min={5} max={30} step={0.5} unit="°C"
              onChange={v => setWeatherParams(p => ({...p, tmean: v}))}
            />
            <Slider 
              label="Ampiezza Termica (°C)" value={weatherParams.tamp} min={0} max={20} step={0.5} unit="°C"
              onChange={v => setWeatherParams(p => ({...p, tamp: v}))} 
            />
            <Slider 
              label="Radiazione Solare (MJ/m²)" value={weatherParams.srad} min={5} max={35} step={0.5} unit="MJ"
              onChange={v => setWeatherParams(p => ({...p, srad: v}))}
            />
            <Slider 
              label="Piovosità Media (mm/d)" value={weatherParams.rain_mean} min={0} max={10} step={0.2} unit="mm/d"
              onChange={v => setWeatherParams(p => ({...p, rain_mean: v}))}
            />
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Durata Simulazione:</strong> La simulazione è sempre di <strong>365 giorni</strong> (anno completo).
              </p>
            </div>

            <div className="mt-6 pt-4 border-t">
              <Button onClick={generateWeather} className="w-full">
                <RefreshCw size={18} /> Genera Meteo Sintetico
              </Button>
            </div>
          </Card>
        )}

        {/* CONTROLS: ERA5 (MAP) */}
        {mode === 'era5' && (
          <Card title="Dati Reali (ERA5-Land)">
             <div className="mb-4">
               <p className="text-xs text-gray-500 mb-2">
                 Clicca sulla mappa per selezionare le coordinate. Dati forniti da Open-Meteo.
               </p>
               
               {/* Leaflet Map Component */}
               <MapPicker 
                  lat={lat} 
                  lon={lon} 
                  onSelect={(newLat, newLon) => {
                    setLat(newLat);
                    setLon(newLon);
                  }} 
               />
             </div>

             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1">Latitudine</label>
                   <input 
                     type="number" step="0.01" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))}
                     className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50"
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-700 mb-1">Longitudine</label>
                   <input 
                     type="number" step="0.01" value={lon} onChange={(e) => setLon(parseFloat(e.target.value))}
                     className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50"
                   />
                 </div>
               </div>
               
               <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Anno</label>
                   <input 
                     type="number" min="1950" max="2024" value={year} onChange={(e) => setYear(parseInt(e.target.value))}
                     className="w-full border border-gray-300 rounded p-2 text-sm"
                   />
               </div>

               {error && (
                 <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200 flex items-center gap-2">
                   <AlertCircle size={14}/> {error}
                 </div>
               )}

               <Button onClick={fetchEra5Data} disabled={isLoading} variant="secondary" className="w-full">
                 {isLoading ? <Loader2 className="animate-spin"/> : <CloudRain size={18} />}
                 {isLoading ? 'Scaricamento...' : 'Scarica Dati Meteo'}
               </Button>
             </div>
          </Card>
        )}

        {/* CONTROLS: CLIMATE (Open-Meteo Climate API, proiezioni 1950-2050) */}
        {mode === 'climate' && (
          <Card title="Dati Climatici (Proiezioni CMIP6)" className="border-emerald-200">
            <p className="text-sm text-gray-600 mb-4">
              Proiezioni ad alta risoluzione (10 km) dal 1950 al 2050. Modelli HighResMip (IPCC CMIP6). Dati da Open-Meteo Climate API.
            </p>
            <div className="mb-4">
              <MapPicker lat={lat} lon={lon} onSelect={(newLat, newLon) => { setLat(newLat); setLon(newLon); }} />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Latitudine</label>
                <input type="number" step="0.01" value={lat} onChange={(e) => setLat(parseFloat(e.target.value))} className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Longitudine</label>
                <input type="number" step="0.01" value={lon} onChange={(e) => setLon(parseFloat(e.target.value))} className="w-full border border-gray-300 rounded p-2 text-sm bg-gray-50" />
              </div>
            </div>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Data inizio</label>
                <input type="date" value={climateStartDate} onChange={(e) => setClimateStartDate(e.target.value)} min="1950-01-01" max="2050-12-31" className="w-full border border-gray-300 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Data fine</label>
                <input type="date" value={climateEndDate} onChange={(e) => setClimateEndDate(e.target.value)} min="1950-01-01" max="2050-12-31" className="w-full border border-gray-300 rounded p-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Modello climatico</label>
                <select value={climateModel} onChange={(e) => setClimateModel(e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm bg-white">
                  {CLIMATE_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <p className="text-xs text-amber-800">
                Per simulazioni colturali conviene un intervallo di un anno (es. 2040-01-01 → 2040-12-31). Non tutti i modelli forniscono shortwave_radiation_sum; se mancante viene usato 0.
              </p>
            </div>
            {error && (
              <div className="p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200 flex items-center gap-2 mb-4">
                <AlertCircle size={14} /> {error}
              </div>
            )}
            <Button onClick={fetchClimateData} disabled={isLoading} variant="secondary" className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : <ThermometerSun size={18} />}
              {isLoading ? 'Scaricamento...' : 'Scarica Dati Climatici'}
            </Button>
          </Card>
        )}

        {/* CONTROLS: CSV */}
        {mode === 'csv' && (
          <Card title="Carica da File (CSV)">
             <p className="text-sm text-gray-600 mb-4">
               Carica un file CSV con le colonne: <code>DAY, TMIN, TMAX, RAIN, SRAD</code>.
             </p>
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
               <Upload className="mx-auto h-12 w-12 text-gray-400" />
               <input 
                 type="file" 
                 accept=".csv"
                 onChange={handleCsvUpload}
                 className="mt-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
               />
             </div>
          </Card>
        )}

      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card 
          title="Andamento Temperatura & Radiazione" 
          headerAction={<DownloadAction data={dailyWeather} filename="meteo_simulato.csv" />}
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <LineChart data={dailyWeather} margin={CHART_MARGIN_DUAL_Y}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: 0 }} />
                <YAxis yAxisId="left" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Radiazione (MJ)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="TMAX" stroke="#ef4444" dot={false} strokeWidth={1.5} name="T Max" />
                <Line yAxisId="left" type="monotone" dataKey="TMIN" stroke="#3b82f6" dot={false} strokeWidth={1.5} name="T Min" />
                <Line yAxisId="right" type="monotone" dataKey="SRAD" stroke="#eab308" dot={false} strokeDasharray="3 3" name="Radiazione" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Distribuzione Precipitazioni">
          <div className="h-[250px] w-full">
            <ResponsiveContainer>
              <BarChart data={dailyWeather} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: 0 }} />
                <YAxis label={{ value: 'Pioggia (mm)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="RAIN" fill="#60a5fa" name="Precipitazioni Giornaliere" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
            <CloudRain size={16}/> Totale Pioggia nel periodo: <strong>{dailyWeather.reduce((acc: number, curr: DailyWeather) => acc + curr.RAIN, 0).toFixed(1)} mm</strong>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-1">Analisi descrittiva (stagione / periodo)</h4>
            <p className="text-xs text-gray-500 mb-4">
              Confronta pioggia, temperature e radiazione per <strong>mese calendario</strong>, per l’intervallo <strong>semina → maturità</strong> stimato dal modello (stessi parametri colturali e suolo della simulazione), oppure tra <strong>due giorni dell’anno di simulazione</strong> (campo <code>day</code> nei dati, di solito 1–365).
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {(
                [
                  { id: 'monthly' as const, label: 'Per mese' },
                  { id: 'crop' as const, label: 'Semina → raccolta' },
                  { id: 'custom' as const, label: 'Da giorno a giorno' }
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSeasonMode(opt.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    seasonMode === opt.id
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {seasonMode === 'custom' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Giorno inizio (1–366)</label>
                  <input
                    type="number"
                    min={1}
                    max={366}
                    value={customDoyStart}
                    onChange={(e) => setCustomDoyStart(Math.min(366, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Giorno fine (1–366)</label>
                  <input
                    type="number"
                    min={1}
                    max={366}
                    value={customDoyEnd}
                    onChange={(e) => setCustomDoyEnd(Math.min(366, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm"
                  />
                </div>
                <p className="col-span-2 text-xs text-gray-500 sm:col-span-2">
                  Se fine &lt; inizio, il periodo attraversa la fine anno (es. 300 → 60).
                </p>
              </div>
            )}

            {seasonAnalysis.kind === 'empty' && (
              <p className="text-sm text-gray-500">Genera o carica una serie meteo per vedere l’analisi.</p>
            )}

            {seasonAnalysis.kind === 'monthly' && (
              <>
                {seasonAnalysis.note && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">{seasonAnalysis.note}</p>
                )}
                <p className="text-xs text-gray-600 mb-2">{seasonAnalysis.header}</p>
                <div className="h-[280px] w-full mb-4">
                  <ResponsiveContainer>
                    <ComposedChart data={seasonAnalysis.chartRows} margin={CHART_MARGIN_DUAL_Y}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" label={{ value: 'Pioggia (mm)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'T media (°C)', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="pioggia" name="Pioggia (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="tMedia" name="T media (°C)" stroke="#dc2626" dot={false} strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <SeasonStatsPanel stats={seasonAnalysis.stats} tbase={cropParams.Tbase} />
              </>
            )}

            {seasonAnalysis.kind === 'range' && (
              <>
                <p className="text-xs text-gray-700 mb-2 font-medium">{seasonAnalysis.header}</p>
                <div className="h-[300px] w-full mb-4">
                  <ResponsiveContainer>
                    <ComposedChart data={seasonAnalysis.dailyRows} margin={CHART_MARGIN_DUAL_Y}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} label={{ value: 'Giorno (serie)', position: 'insideBottom', offset: -2 }} />
                      <YAxis yAxisId="left" label={{ value: 'mm', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" label={{ value: 'Cum. mm', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="pioggia" name="Pioggia giornaliera" fill="#60a5fa" />
                      <Line yAxisId="right" type="monotone" dataKey="pioggiaCum" name="Pioggia cumulata" stroke="#0f766e" dot={false} strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <SeasonStatsPanel stats={seasonAnalysis.stats} tbase={cropParams.Tbase} />
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
