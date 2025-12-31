import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { Card, Button, Slider } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { DailyWeather } from '../types';
import { 
  filterWeatherData, 
  checkWeatherConsistency, 
  calculateWeatherStatistics,
  correctAnomalies,
  WeatherFilter,
  ConsistencyCheck 
} from '../services/weatherDataService';
import { Filter, CheckCircle2, AlertTriangle, XCircle, Info, Download, RefreshCw } from 'lucide-react';

export const WeatherDataManagementView: React.FC = () => {
  const { dailyWeather, setDailyWeather } = useSimulation();
  
  // Filtri
  const [filters, setFilters] = useState<WeatherFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Controlli di consistenza
  const [consistencyChecks, setConsistencyChecks] = useState<ConsistencyCheck[]>([]);
  const [showChecks, setShowChecks] = useState(false);
  
  // Dati filtrati
  const filteredData = useMemo(() => {
    if (dailyWeather.length === 0) return [];
    return filterWeatherData(dailyWeather, filters);
  }, [dailyWeather, filters]);

  // Statistiche
  const originalStats = useMemo(() => 
    calculateWeatherStatistics(dailyWeather), 
    [dailyWeather]
  );
  
  const filteredStats = useMemo(() => 
    calculateWeatherStatistics(filteredData), 
    [filteredData]
  );

  // Esegui controlli di consistenza
  const runConsistencyChecks = () => {
    const checks = checkWeatherConsistency(dailyWeather);
    setConsistencyChecks(checks);
    setShowChecks(true);
  };

  // Applica correzioni automatiche
  const applyCorrections = () => {
    if (consistencyChecks.length === 0) {
      runConsistencyChecks();
      return;
    }
    const corrected = correctAnomalies(dailyWeather, consistencyChecks);
    setDailyWeather(corrected);
    runConsistencyChecks(); // Riesegui controlli dopo correzione
  };

  // Reset filtri
  const resetFilters = () => {
    setFilters({});
  };

  const getCheckIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="text-red-600" size={18} />;
      case 'warning': return <AlertTriangle className="text-yellow-600" size={18} />;
      case 'info': return <CheckCircle2 className="text-green-600" size={18} />;
      default: return <Info className="text-blue-600" size={18} />;
    }
  };

  const getCheckColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'info': return 'bg-green-50 border-green-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  // Dati per grafici
  const chartData = filteredData.map(d => ({
    day: d.day,
    TMIN: d.TMIN,
    TMAX: d.TMAX,
    TAVG: (d.TMIN + d.TMAX) / 2,
    RAIN: d.RAIN,
    SRAD: d.SRAD
  }));

  const hasActiveFilters = Object.keys(filters).length > 0;
  const hasErrors = consistencyChecks.some(c => !c.passed && c.severity === 'error');
  const hasWarnings = consistencyChecks.some(c => !c.passed && c.severity === 'warning');

  return (
    <div className="space-y-6">
      <Card title="Gestione Dati Meteo">
        <p className="text-gray-700 mb-4">
          Questa sezione permette di filtrare, controllare la consistenza e correggere i dati meteo.
          Utilizza i filtri per selezionare periodi o condizioni specifiche, e i controlli di consistenza
          per identificare e correggere valori anomali o inconsistenti.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? 'primary' : 'outline'}
          >
            <Filter size={16} />
            {hasActiveFilters ? 'Filtri Attivi' : 'Filtri'}
          </Button>
          <Button
            onClick={runConsistencyChecks}
            variant={showChecks ? 'primary' : 'outline'}
          >
            <CheckCircle2 size={16} />
            Controlli Consistenza
            {hasErrors && <span className="ml-1 text-red-600">●</span>}
            {hasWarnings && !hasErrors && <span className="ml-1 text-yellow-600">●</span>}
          </Button>
          {hasErrors && (
            <Button
              onClick={applyCorrections}
              variant="secondary"
            >
              <RefreshCw size={16} />
              Correggi Automaticamente
            </Button>
          )}
          {hasActiveFilters && (
            <Button
              onClick={resetFilters}
              variant="outline"
            >
              Reset Filtri
            </Button>
          )}
        </div>
      </Card>

      {/* Pannello Filtri */}
      {showFilters && (
        <Card title="Filtri Dati Meteo" className="bg-blue-50 border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Range Giorni
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Giorno inizio"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={filters.startDay || ''}
                  onChange={(e) => setFilters({...filters, startDay: e.target.value ? parseInt(e.target.value) : undefined})}
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Giorno fine"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={filters.endDay || ''}
                  onChange={(e) => setFilters({...filters, endDay: e.target.value ? parseInt(e.target.value) : undefined})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperatura Media (°C)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={filters.minTemp || ''}
                  onChange={(e) => setFilters({...filters, minTemp: e.target.value ? parseFloat(e.target.value) : undefined})}
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={filters.maxTemp || ''}
                  onChange={(e) => setFilters({...filters, maxTemp: e.target.value ? parseFloat(e.target.value) : undefined})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pioggia (mm/giorno)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  step="0.1"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={filters.minRain || ''}
                  onChange={(e) => setFilters({...filters, minRain: e.target.value ? parseFloat(e.target.value) : undefined})}
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  step="0.1"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={filters.maxRain || ''}
                  onChange={(e) => setFilters({...filters, maxRain: e.target.value ? parseFloat(e.target.value) : undefined})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radiazione (MJ/m²/giorno)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  step="0.1"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={filters.minSrad || ''}
                  onChange={(e) => setFilters({...filters, minSrad: e.target.value ? parseFloat(e.target.value) : undefined})}
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  step="0.1"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={filters.maxSrad || ''}
                  onChange={(e) => setFilters({...filters, maxSrad: e.target.value ? parseFloat(e.target.value) : undefined})}
                />
              </div>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 p-3 bg-blue-100 rounded text-sm text-blue-800">
              <strong>Filtri attivi:</strong> {filteredData.length} giorni su {dailyWeather.length} totali
            </div>
          )}
        </Card>
      )}

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Statistiche Dati Originali">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Giorni totali:</span>
              <span className="font-semibold">{dailyWeather.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Temperatura media:</span>
              <span className="font-semibold">{originalStats.meanTemp.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Range temperatura:</span>
              <span className="font-semibold">{originalStats.minTemp.toFixed(1)} - {originalStats.maxTemp.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pioggia totale:</span>
              <span className="font-semibold">{originalStats.totalRain.toFixed(1)} mm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Giorni piovosi:</span>
              <span className="font-semibold">{originalStats.rainyDays}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Radiazione media:</span>
              <span className="font-semibold">{originalStats.meanSrad.toFixed(2)} MJ/m²</span>
            </div>
          </div>
        </Card>

        {hasActiveFilters && (
          <Card title="Statistiche Dati Filtrati" className="bg-blue-50 border-blue-200">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Giorni filtrati:</span>
                <span className="font-semibold">{filteredData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Temperatura media:</span>
                <span className="font-semibold">{filteredStats.meanTemp.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Range temperatura:</span>
                <span className="font-semibold">{filteredStats.minTemp.toFixed(1)} - {filteredStats.maxTemp.toFixed(1)}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pioggia totale:</span>
                <span className="font-semibold">{filteredStats.totalRain.toFixed(1)} mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Giorni piovosi:</span>
                <span className="font-semibold">{filteredStats.rainyDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Radiazione media:</span>
                <span className="font-semibold">{filteredStats.meanSrad.toFixed(2)} MJ/m²</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Controlli di Consistenza */}
      {showChecks && consistencyChecks.length > 0 && (
        <Card title="Controlli di Consistenza">
          <div className="space-y-3">
            {consistencyChecks.map((check, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getCheckColor(check.severity)}`}
              >
                <div className="flex items-start gap-3">
                  {getCheckIcon(check.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{check.check}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        check.passed 
                          ? 'bg-green-200 text-green-800' 
                          : check.severity === 'error'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-yellow-200 text-yellow-800'
                      }`}>
                        {check.passed ? 'OK' : check.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{check.message}</p>
                    {check.affectedDays && check.affectedDays.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        Giorni interessati: {check.affectedDays.slice(0, 10).join(', ')}
                        {check.affectedDays.length > 10 && ` ... (+${check.affectedDays.length - 10} altri)`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grafici */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Temperatura">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="TMIN" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="Tmin" />
              <Line type="monotone" dataKey="TMAX" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Tmax" />
              <Line type="monotone" dataKey="TAVG" stroke="#22c55e" strokeWidth={2} dot={false} name="Tmedia" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Pioggia">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Pioggia (mm)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="RAIN" fill="#3b82f6" name="Pioggia" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Radiazione Solare" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Radiazione (MJ/m²)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="SRAD" stroke="#f59e0b" strokeWidth={2} dot={false} name="Radiazione" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

