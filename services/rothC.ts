import { DailyWeather, SoilParams, CarbonParams, SimulationStep, RotationType } from '../types';

// Constants based on standard RothC parametrization (Matches R script v8.6)
const RATE_CONSTANTS = {
  DPM: 10.0,
  RPM: 0.3,
  BIO: 0.66,
  HUM: 0.02,
  IOM: 0.0
};

// Temperature modifier (Jenkinson et al.) - Matches R script logic
const getTempModifier = (tempC: number) => {
  if (tempC < -5.0) return 0.0;
  return 47.91 / (1.0 + Math.exp(106.06 / (tempC + 18.27)));
};

// Moisture modifier (simplified based on precipitation/evap deficit for web performance)
// Conceptually aligns with RothC topsoil deficit logic but simplified for daily/monthly aggregation.
const getMoistureModifier = (precip: number, et0: number, clay: number) => {
  const maxSMD = -(20 + 1.3 * clay - 0.01 * clay * clay); // Max deficit formula matches RothC
  const balance = precip - et0;
  
  if (balance >= 0) return 1.0;
  
  const deficit = Math.max(balance, maxSMD);
  const factor = 0.2 + (1.0 - 0.2) * ((maxSMD - deficit) / maxSMD);
  return Math.max(0.2, Math.min(1.0, factor)); 
};

// Cover modifier
const getCoverModifier = (hasPlants: boolean) => {
  return hasPlants ? 0.6 : 1.0; // Decomposition is slower under plant cover
};

export const aggregateToMonthly = (dailyWeather: DailyWeather[], dailySim: SimulationStep[]) => {
  const monthlyData: { temp: number; precip: number; et0: number; plantCover: boolean }[] = [];
  
  const chunkSize = 30;
  for (let i = 0; i < dailyWeather.length; i += chunkSize) {
    const chunkW = dailyWeather.slice(i, i + chunkSize);
    const chunkS = dailySim.slice(i, i + chunkSize);
    
    if (chunkW.length === 0) break;

    const avgTemp = chunkW.reduce((acc, d) => acc + (d.TMIN + d.TMAX) / 2, 0) / chunkW.length;
    const sumPrecip = chunkW.reduce((acc, d) => acc + d.RAIN, 0);
    
    const activeDays = chunkS.filter(s => s.LAI > 0.5).length;
    const plantCover = activeDays > (chunkW.length / 2);

    monthlyData.push({
      temp: avgTemp,
      precip: sumPrecip,
      et0: 100, // Placeholder
      plantCover
    });
  }
  return monthlyData;
};

// Main RothC Step - Analytic Solution
export const runRothCStep = (
  pools: { DPM: number; RPM: number; BIO: number; HUM: number; IOM: number },
  inputs: { DPM: number; RPM: number }, // Monthly C input
  modifiers: { temp: number; moisture: number; cover: number },
  clay: number
) => {
  const tstep = 1 / 12; // Monthly step
  
  // Clay factor x calculation (Matches R script)
  // x = 1.67 * (1.85 + 1.60 * exp(-0.0786 * clay))
  const clayFactor = 1.67 * (1.85 + 1.60 * Math.exp(-0.0786 * clay));
  const x = clayFactor;
  const co2Prop = x / (x + 1);
  const bioHumProp = 1 / (x + 1);
  const bioFrac = 0.46; // Standard split
  
  const combinedMod = modifiers.temp * modifiers.moisture * modifiers.cover;

  // Calculate decomposition for each pool
  // Pool(t+1) = Pool(t) * exp(-k * mod * dt)
  const decompose = (poolName: 'DPM'|'RPM'|'BIO'|'HUM', amount: number) => {
    const rate = RATE_CONSTANTS[poolName];
    const amountDecomposed = amount * (1 - Math.exp(-rate * combinedMod * tstep));
    const amountRemaining = amount - amountDecomposed;
    return { decomposed: amountDecomposed, remaining: amountRemaining };
  };

  const dpmRes = decompose('DPM', pools.DPM);
  const rpmRes = decompose('RPM', pools.RPM);
  const bioRes = decompose('BIO', pools.BIO);
  const humRes = decompose('HUM', pools.HUM);

  const totalDecomposed = dpmRes.decomposed + rpmRes.decomposed + bioRes.decomposed + humRes.decomposed;
  
  const totalCO2 = totalDecomposed * co2Prop;
  const toBioHum = totalDecomposed * bioHumProp;
  
  const toBio = toBioHum * bioFrac;
  const toHum = toBioHum * (1 - bioFrac);

  return {
    DPM: dpmRes.remaining + inputs.DPM,
    RPM: rpmRes.remaining + inputs.RPM,
    BIO: bioRes.remaining + toBio,
    HUM: humRes.remaining + toHum,
    IOM: pools.IOM, // Inert does not change
    CO2: totalCO2
  };
};

const isLegume = (rotation: RotationType, yearIndex: number): boolean => {
  // Check index in rotation array
  if (rotation === 'Pomodoro - Frumento gr - Soia') {
    return yearIndex === 2; // Year 3 is Soy
  }
  if (rotation === 'Pomodoro - Frumento - Medica (3y)') {
    return yearIndex >= 2; // Years 3, 4, 5 are Alfalfa
  }
  return false;
};

export const simulateLongTermCarbon = (
  years: number,
  soilParams: SoilParams,
  carbonParams: CarbonParams,
  baseWeather: { temp: number; precip: number; et0: number; plantCover: boolean }[],
  biomassSequenceMgHa: number[] // Sequence of annual biomass matching the rotation length
) => {
  // Initial Pool Distribution (Heuristic for didactic purposes)
  const totalC = soilParams.initial_soc;
  let pools = {
    DPM: totalC * 0.01,
    RPM: totalC * 0.15,
    BIO: totalC * 0.02,
    HUM: totalC * 0.75, // Most C is Humus
    IOM: totalC * 0.07  // Inert
  };

  const results = [];
  
  // Tillage modifier
  const tillageMod = carbonParams.isMinimumTillage ? 0.8 : 1.0; 

  for (let y = 0; y < years; y++) {
    // Determine crop inputs for this year
    const cycleIndex = y % biomassSequenceMgHa.length;
    const currentBiomass = biomassSequenceMgHa[cycleIndex];
    
    // Check for Legume year in rotation for DPM/RPM ratio
    const isLegumeYear = isLegume(carbonParams.rotation, cycleIndex);

    // 1. Crop Residues Inputs (Logic aligns with v8.6 residues vs stubble switch)
    // incorporateResidues = true simulates "Full Residues" (e.g. Corn Stover)
    // incorporateResidues = false simulates "Stubble Only" (Straw baled)
    const residueFactor = carbonParams.incorporateResidues ? 0.65 : 0.20; 
    const cropCInputAnnual = currentBiomass * 0.45 * residueFactor;
    
    // 2. Cover crop input (Mg C/ha/yr)
    const ccInput = carbonParams.hasCoverCrops ? 0.8 : 0; 
    
    // 3. Manure input
    const manureInput = carbonParams.addManure ? 1.0 : 0;

    const totalAnnualInput = cropCInputAnnual + ccInput + manureInput;
    const monthlyInput = totalAnnualInput / 12;

    // DPM/RPM Ratio
    // Standard RothC DPM/RPM: Agricultural Crops = 1.44, Legumes ~ 1.0
    const dpmRpmRatio = isLegumeYear ? 1.0 : 1.44; 
    const dpmFrac = dpmRpmRatio / (1 + dpmRpmRatio);
    
    const inputObj = {
      DPM: monthlyInput * dpmFrac,
      RPM: monthlyInput * (1 - dpmFrac)
    };

    // Loop through 12 months
    for (let m = 0; m < 12; m++) {
      const w = baseWeather[m % baseWeather.length];
      
      const mod = {
        temp: getTempModifier(w.temp),
        moisture: getMoistureModifier(w.precip, soilParams.ET0 * 30, soilParams.clay_percent), 
        cover: getCoverModifier(w.plantCover || (carbonParams.hasCoverCrops && [0,1,2,10,11].includes(m)))
      };

      // Apply tillage modifier to the rate calc
      mod.cover = mod.cover * tillageMod; 

      const nextPools = runRothCStep(pools, inputObj, mod, soilParams.clay_percent);
      
      const { CO2, ...updatedPools } = nextPools;
      pools = updatedPools;

      results.push({
        month: m + 1,
        year: y + 1,
        ...nextPools,
        TotalSOC: nextPools.DPM + nextPools.RPM + nextPools.BIO + nextPools.HUM + nextPools.IOM,
        CO2_Emitted: nextPools.CO2,
        C_Input: monthlyInput
      });
    }
  }

  return results;
};