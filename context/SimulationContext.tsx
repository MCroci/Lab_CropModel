
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WeatherParams, CropParams, SoilParams, SimulationStep, WaterStep, DailyWeather, CarbonParams, RothCResult, RotationType } from '../types';
import { makeWeather, simulateCrop, simulateSoilWater } from '../services/cropModel';
import { aggregateToMonthly, simulateLongTermCarbon } from '../services/rothC';

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
    n_days: 200,
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

  // Initialize weather on mount
  useEffect(() => {
    generateWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Sync Tmean
  useEffect(() => {
    setCropParams(p => ({ ...p, Tmean: weatherParams.tmean }));
  }, [weatherParams.tmean]);

  const generateWeather = () => {
    const newWeather = makeWeather(weatherParams);
    setDailyWeather(newWeather);
  };

  const runSimulation = () => {
    if (dailyWeather.length === 0) return;

    // 1. CROP SIMULATION (Single generic crop visualization)
    const cropRes = simulateCrop(dailyWeather, cropParams);
    
    // 2. WATER SIMULATION
    const laiSeries = cropRes.map(r => r.LAI);
    const waterRes = simulateSoilWater(dailyWeather, soilParams, laiSeries);

    setSimulationResults(cropRes);
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
  };

  // Trigger run when weather updates
  useEffect(() => {
    runSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyWeather]);

  return (
    <SimulationContext.Provider value={{
      weatherParams, setWeatherParams, dailyWeather, setDailyWeather, generateWeather,
      cropParams, setCropParams,
      soilParams, setSoilParams,
      simulationResults, waterResults,
      runSimulation,
      carbonParams, setCarbonParams,
      carbonResults, baselineCarbonResults
    }}>
      {children}
    </SimulationContext.Provider>
  );
};
