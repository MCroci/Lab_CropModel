
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { WeatherParams, CropParams, SoilParams, SimulationStep, WaterStep, DailyWeather, CarbonParams, RothCResult, RotationType } from '../types';
import { makeWeather, simulateCrop, simulateSoilWater } from '../services/cropModel';
import { aggregateToMonthly, simulateLongTermCarbon } from '../services/rothC';
import { saveCurrentConfiguration, loadCurrentConfiguration, saveNamedConfiguration, getAllSavedConfigurations, loadConfiguration, deleteConfiguration, SavedConfiguration } from '../services/storageService';

interface SimulationContextType {
  weatherParams: WeatherParams;
  setWeatherParams: React.Dispatch<React.SetStateAction<WeatherParams>>;
  dailyWeather: DailyWeather[];
  setDailyWeather: React.Dispatch<React.SetStateAction<DailyWeather[]>>; // Exposed this
  generateWeather: () => void;
  cropParams: CropParams;
  setCropParams: React.Dispatch<React.SetStateAction<CropParams>>;
  soilParams: SoilParams;
  setSoilParams: React.Dispatch<React.SetStateAction<SoilParams>>;
  simulationResults: SimulationStep[];
  waterResults: WaterStep[];
  runSimulation: () => void;
  // Carbon
  carbonParams: CarbonParams;
  setCarbonParams: React.Dispatch<React.SetStateAction<CarbonParams>>;
  carbonResults: RothCResult[];
  baselineCarbonResults: RothCResult[];
  // Sowing dates per coltura
  sowingDays: Record<string, number>;
  setSowingDays: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  getCurrentCropSowingDay: () => number;
  // Storage functions
  saveConfiguration: (name: string) => string;
  loadSavedConfiguration: (id: string) => boolean;
  getAllSavedConfigurations: () => SavedConfiguration[];
  deleteSavedConfiguration: (id: string) => boolean;
  // Loading state
  isSimulating: boolean;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error("useSimulation must be used within a SimulationProvider");
  return context;
};

// Typical Total Dry Biomass (Mg/ha) for rotation components (Approximation)
const ROTATION_DATA: Record<RotationType, number[]> = {
  'Pomodoro - Frumento granella': [8, 14],
  'Pomodoro - Frumento gr - Mais gr': [8, 14, 22],
  'Pomodoro - Frumento gr - Mais tr': [8, 14, 20],
  'Pomodoro - Frumento gr - Soia': [8, 14, 8],
  'Pomodoro - Frumento gr - Sorgo': [8, 14, 16],
  'Pomodoro - Frumento gr - Barbabietola': [8, 14, 18],
  'Pomodoro - Frumento - Medica (3y)': [8, 14, 12, 12, 12]
};

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [weatherParams, setWeatherParams] = useState<WeatherParams>({
    n_days: 365, // Sempre 365 giorni
    tmean: 18,
    tamp: 8,
    srad: 18,
    rain_mean: 2,
  });

  const [dailyWeather, setDailyWeather] = useState<DailyWeather[]>([]);

  const [cropParams, setCropParams] = useState<CropParams>({
    Tbase: 8,
    tuHAR: 1400,
    LAI0: 0.02,
    LAIMX: 5,
    ALPHA: 0.02,
    SENRATE: 0.02,
    frEMR: 0.05,
    frBLS: 0.65,
    KPAR: 0.6,
    RUE: 2.5,
    TBRUE: 8,
    TP1RUE: 18,
    TP2RUE: 28,
    TCRUE: 40,
    B0: 0,
    Tmean: 18 
  });

  const [soilParams, setSoilParams] = useState<SoilParams>({
    W0: 120,
    W_wp: 60,
    W_fc: 160,
    W_sat: 250,
    ET0: 4,
    alpha: 0.25,
    beta: 0.20,
    gamma: 0.15,
    inf_cap: 25,
    LAI_full_cover: 3,
    soil_depth: 30,
    initial_soc: 50,
    clay_percent: 25
  });

  const [carbonParams, setCarbonParams] = useState<CarbonParams>({
    rotation: 'Pomodoro - Frumento granella',
    isMinimumTillage: false,
    hasCoverCrops: false,
    incorporateResidues: true,
    addManure: false,
    agrivoltaicsShading: 0
  });

  const [simulationResults, setSimulationResults] = useState<SimulationStep[]>([]);
  const [waterResults, setWaterResults] = useState<WaterStep[]>([]);
  const [carbonResults, setCarbonResults] = useState<RothCResult[]>([]);
  const [baselineCarbonResults, setBaselineCarbonResults] = useState<RothCResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sowing dates per coltura (day of year, 1-based)
  // Default: tutte le colture iniziano al giorno 1
  const [sowingDays, setSowingDays] = useState<Record<string, number>>({
    'generica': 1,
    'mais': 1,
    'frumento': 1,
    'pomodoro': 1
  });
  
  // Helper per ottenere la data di semina della coltura corrente
  const getCurrentCropSowingDay = useCallback(() => {
    // Identifica quale preset corrisponde ai parametri attuali
    const cropPresets: Record<string, { Tbase: number; RUE: number; KPAR: number }> = {
      'generica': { Tbase: 8, RUE: 2.5, KPAR: 0.6 },
      'mais': { Tbase: 10, RUE: 3.8, KPAR: 0.65 },
      'frumento': { Tbase: 0, RUE: 2.2, KPAR: 0.5 },
      'pomodoro': { Tbase: 12, RUE: 2.0, KPAR: 0.7 }
    };
    
    const currentPreset = Object.entries(cropPresets).find(([_, preset]) => {
      return preset.Tbase === cropParams.Tbase && 
             preset.RUE === cropParams.RUE &&
             preset.KPAR === cropParams.KPAR;
    });
    
    const cropId = currentPreset ? currentPreset[0] : 'generica';
    return sowingDays[cropId] || sowingDays['generica'] || 1;
  }, [cropParams, sowingDays]);

  // Load saved configuration on mount
  useEffect(() => {
    const saved = loadCurrentConfiguration();
    if (saved) {
      if (saved.weatherParams) setWeatherParams(saved.weatherParams);
      if (saved.cropParams) setCropParams(saved.cropParams);
      if (saved.soilParams) setSoilParams(saved.soilParams);
      if (saved.carbonParams) setCarbonParams(saved.carbonParams);
      if (saved.sowingDays) setSowingDays(saved.sowingDays);
    }
    generateWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Sync Tmean
  useEffect(() => {
    setCropParams(p => ({ ...p, Tmean: weatherParams.tmean }));
  }, [weatherParams.tmean]);

  const generateWeather = useCallback(() => {
    const newWeather = makeWeather(weatherParams);
    setDailyWeather(newWeather);
  }, [weatherParams]);

  const runSimulation = useCallback(() => {
    if (dailyWeather.length === 0) return;
    
    setIsSimulating(true);

    // Ottieni la data di semina per la coltura corrente
    const currentSowingDay = getCurrentCropSowingDay();

    // Filter weather data starting from sowing day
    const weatherFromSowing = dailyWeather.filter(w => w.day >= currentSowingDay);
    if (weatherFromSowing.length === 0) {
      // If sowing day is beyond available weather, use all data
      const cropRes = simulateCrop(dailyWeather, cropParams);
      const laiSeries = cropRes.map(r => r.LAI);
      const waterRes = simulateSoilWater(dailyWeather, soilParams, laiSeries);
      setSimulationResults(cropRes);
      setWaterResults(waterRes);
      return;
    }

    // 1. CROP SIMULATION (Single generic crop visualization)
    // Adjust day numbers to start from 1 for the simulation
    const adjustedWeather = weatherFromSowing.map((w, idx) => ({
      ...w,
      day: idx + 1 // Reset day counter from sowing
    }));
    const cropRes = simulateCrop(adjustedWeather, cropParams);
    
    // Restore original day numbers for display
    const cropResWithOriginalDays = cropRes.map((r, idx) => ({
      ...r,
      day: weatherFromSowing[idx].day // Original day from weather data
    }));
    
    // 2. WATER SIMULATION
    const laiSeries = cropRes.map(r => r.LAI);
    // For water simulation, we need to account for pre-sowing period
    const fullLaiSeries = new Array(currentSowingDay - 1).fill(0).concat(laiSeries);
    const waterRes = simulateSoilWater(dailyWeather, soilParams, fullLaiSeries);

    setSimulationResults(cropResWithOriginalDays);
    setWaterResults(waterRes);

    // 3. CARBON SIMULATION (Long term rotation)
    const monthlyData = aggregateToMonthly(dailyWeather, cropRes);
    
    // Use the predefined biomass sequence for the selected rotation
    const biomassSequence = ROTATION_DATA[carbonParams.rotation];

    // Baseline: Same rotation, but standard practices (Tillage, No Cover, etc.)
    const baselineP: CarbonParams = {
        ...carbonParams,
        isMinimumTillage: false,
        hasCoverCrops: false,
        addManure: false,
        incorporateResidues: true 
    };
    const baseC = simulateLongTermCarbon(20, soilParams, baselineP, monthlyData, biomassSequence);
    setBaselineCarbonResults(baseC);

    // Scenario: User selected practices
    const scenC = simulateLongTermCarbon(20, soilParams, carbonParams, monthlyData, biomassSequence);
    setCarbonResults(scenC);
    
    setIsSimulating(false);
  }, [dailyWeather, cropParams, soilParams, carbonParams, getCurrentCropSowingDay]);

  // Auto-save configuration (debounced)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveCurrentConfiguration(weatherParams, cropParams, soilParams, carbonParams, sowingDays);
    }, 1000); // Save after 1 second of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [weatherParams, cropParams, soilParams, carbonParams, sowingDays]);

  // Debounced simulation trigger
  const simulationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (simulationTimeoutRef.current) {
      clearTimeout(simulationTimeoutRef.current);
    }
    
    simulationTimeoutRef.current = setTimeout(() => {
      runSimulation();
    }, 150); // 150ms debounce

    return () => {
      if (simulationTimeoutRef.current) {
        clearTimeout(simulationTimeoutRef.current);
      }
    };
  }, [dailyWeather, runSimulation]);

  // Storage functions
  const saveConfiguration = useCallback((name: string): string => {
    return saveNamedConfiguration(name, weatherParams, cropParams, soilParams, carbonParams, sowingDays);
  }, [weatherParams, cropParams, soilParams, carbonParams, sowingDays]);

  const loadSavedConfiguration = useCallback((id: string): boolean => {
    const config = loadConfiguration(id);
    if (config) {
      setWeatherParams(config.weatherParams);
      setCropParams(config.cropParams);
      setSoilParams(config.soilParams);
      setCarbonParams(config.carbonParams);
      setSowingDays(config.sowingDays);
      generateWeather();
      return true;
    }
    return false;
  }, [generateWeather]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    weatherParams, setWeatherParams, dailyWeather, setDailyWeather, generateWeather,
    cropParams, setCropParams,
    soilParams, setSoilParams,
    simulationResults, waterResults,
    runSimulation,
    carbonParams, setCarbonParams,
    carbonResults, baselineCarbonResults,
    sowingDays, setSowingDays, getCurrentCropSowingDay,
    saveConfiguration,
    loadSavedConfiguration,
    getAllSavedConfigurations,
    deleteSavedConfiguration: deleteConfiguration,
    isSimulating
  }), [
    weatherParams, dailyWeather, generateWeather,
    cropParams, soilParams,
    simulationResults, waterResults,
    runSimulation,
    carbonParams,
    carbonResults, baselineCarbonResults,
    sowingDays, setSowingDays, getCurrentCropSowingDay,
    saveConfiguration, loadSavedConfiguration,
    isSimulating
  ]);

  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
};
