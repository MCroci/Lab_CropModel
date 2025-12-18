
import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, Slider, Button, DownloadAction } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { RefreshCw, CloudRain, Globe, Upload, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { DailyWeather } from '../types';
import L from 'leaflet';

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
  const { weatherParams, setWeatherParams, dailyWeather, setDailyWeather, generateWeather } = useSimulation() as any; 

  const [mode, setMode] = useState<'synthetic' | 'era5' | 'csv'>('synthetic');
  
  // ERA5 State
  const [lat, setLat] = useState(45.46); // Milano default
  const [lon, setLon] = useState(9.19);
  const [year, setYear] = useState(2023);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // CSV State
  const [csvFile, setCsvFile] = useState<File | null>(null);

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
         setWeatherParams(prev => ({ ...prev, n_days: newWeather.length }));
      }

    } catch (err: any) {
      setError(err.message || "Errore sconosciuto");
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
           setWeatherParams(prev => ({ ...prev, n_days: newWeather.length }));
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
        <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
           <button 
             onClick={() => setMode('synthetic')}
             className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'synthetic' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Sintetico
           </button>
           <button 
             onClick={() => setMode('era5')}
             className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'era5' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
           >
             ERA5-Land (Mappa)
           </button>
           <button 
             onClick={() => setMode('csv')}
             className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'csv' ? 'bg-orange-50 text-orange-700' : 'text-gray-500 hover:text-gray-700'}`}
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
            <Slider 
              label="Durata Simulazione" value={weatherParams.n_days} min={100} max={365} step={10} unit="giorni"
              onChange={v => setWeatherParams(p => ({...p, n_days: v}))}
            />

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
              <LineChart data={dailyWeather} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" label={{ value: 'Giorno', position: 'insideBottom', offset: -5 }} />
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
              <BarChart data={dailyWeather} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="day" />
                <YAxis label={{ value: 'Pioggia (mm)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="RAIN" fill="#60a5fa" name="Precipitazioni Giornaliere" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
            <CloudRain size={16}/> Totale Pioggia nel periodo: <strong>{dailyWeather.reduce((acc: number, curr: any) => acc + curr.RAIN, 0).toFixed(1)} mm</strong>
          </div>
        </Card>
      </div>
    </div>
  );
};
