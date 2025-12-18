
import { DailyWeather, EmergenceStep, SoilParams } from '../types';

// Constants for Soil Temperature Estimation
// T_soil is approximated from T_air and Radiation
const RAD_TO_SOIL_TEMP_FACTOR = 0.25; // Empirical: How much Radiation (MJ) heats the topsoil above Air Temp

export interface GerminationParams {
  Tbase: number;
  Topt: number;
  Tceiling: number;
  GDD_target: number; // Thermal time required for emergence
  theta_wilt_frac: number; // Fraction of W_sat (0-1)
  theta_opt_frac: number;  // Fraction of W_sat (0-1)
}

// 1. Temperature Response Function (Beta Function / Trapezoid)
// Used in Model 2 (Extended)
const f_temp_response = (T: number, p: GerminationParams): number => {
  if (T <= p.Tbase || T >= p.Tceiling) return 0;
  if (T > p.Tbase && T <= p.Topt) {
    return (T - p.Tbase) / (p.Topt - p.Tbase);
  }
  // From Opt to Ceiling (linear decline)
  return (p.Tceiling - T) / (p.Tceiling - p.Topt);
};

// 2. Water Response Function (Linear rise)
// Used in Model 2 (Extended)
const f_water_response = (W: number, W_sat: number, p: GerminationParams): number => {
  const theta = W / W_sat; // Volumetric fraction approx
  const th_wilt = p.theta_wilt_frac;
  const th_opt = p.theta_opt_frac;

  if (theta <= th_wilt) return 0;
  if (theta >= th_opt) return 1;
  
  return (theta - th_wilt) / (th_opt - th_wilt);
};

export const simulateEmergence = (
  weather: DailyWeather[], 
  soilWaterSeries: number[], 
  soilParams: SoilParams,
  germParams: GerminationParams,
  shading: number // 0-1
): EmergenceStep[] => {
  
  const results: EmergenceStep[] = [];
  let ETT_cum = 0; // Model 2 Accumulator
  let GDD_cum = 0; // Model 1 Accumulator

  for (let i = 0; i < weather.length; i++) {
    const w = weather[i];
    const W_current = soilWaterSeries[i] || soilParams.W0;
    
    // --- Model 1: Python GDD Approach (Simple) ---
    // Uses Air Temperature
    const T_avg_air = (w.TMIN + w.TMAX) / 2;
    const GDD_daily = Math.max(0, T_avg_air - germParams.Tbase);
    GDD_cum += GDD_daily;

    // --- Model 2: Python ETT Approach (Extended) ---
    // Uses Soil Temp + Water Factor
    
    // A. Soil Temp Est.
    const rad_eff = w.SRAD * (1 - shading);
    const T_soil = T_avg_air + (rad_eff * RAD_TO_SOIL_TEMP_FACTOR);

    // B. Response Functions (0-1)
    const tempFactor = f_temp_response(T_soil, germParams);
    const waterFactor = f_water_response(W_current, soilParams.W_sat, germParams);
    
    // C. Effective Thermal Time Calculation
    // We scale the 0-1 factors by the max potential GDD for that day (Topt - Tbase)
    // to make the units comparable to Model 1 on the chart.
    const max_potential_daily = (germParams.Topt - germParams.Tbase);
    const ETT_daily = max_potential_daily * tempFactor * waterFactor;

    ETT_cum += ETT_daily;

    // Percentages based on same target for comparison
    const pct_ETT = Math.min(100, (ETT_cum / germParams.GDD_target) * 100);
    // Note: Model 1 might reach > 100% quickly, handled in UI

    results.push({
      day: w.day,
      T_soil,
      W_soil: W_current,
      GDD_daily,
      GDD_cum,        // Model 1 Cumulative
      HydroFactor: waterFactor,
      ETT_daily,
      ETT_cum,        // Model 2 Cumulative
      EmergencePct: pct_ETT // Defaulting to Model 2 for main output
    });
  }

  return results;
};
