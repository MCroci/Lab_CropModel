
export interface WeatherParams {
  n_days: number;
  tmean: number;
  tamp: number;
  srad: number;
  rain_mean: number;
}

export interface CropParams {
  // Phenology
  Tbase: number;
  tuHAR: number;
  // Temperature cardinali per tempfun/DTU (Eq. 6.1) - se assenti si usa TP1RUE/TP2RUE/TCRUE
  TP1D?: number;
  TP2D?: number;
  TCD?: number;
  // Water stress: soglia FTSW per crescita (Eq. 15.3)
  WSSG?: number;
  // LAI
  LAI0: number;
  LAIMX: number;
  ALPHA: number;
  SENRATE: number;
  frEMR: number;
  frBLS: number;
  KPAR: number;
  // Biomass
  RUE: number;
  TBRUE: number;
  TP1RUE: number;
  TP2RUE: number;
  TCRUE: number;
  // Initials calculated/constant
  B0: number;
  Tmean?: number;
}

export interface SoilParams {
  W0: number;
  W_wp: number;
  W_fc: number;
  W_sat: number;
  ET0: number;
  alpha: number;
  beta: number;
  gamma: number;
  inf_cap: number;
  LAI_full_cover: number;
  soil_depth: number; // cm
  /** Curve Number SCS (0-100) per runoff Eq. 14.14; se assente usa inf_cap */
  CN?: number;
  initial_soc: number;
  clay_percent: number;
}

export interface DailyWeather {
  day: number;
  TMIN: number;
  TMAX: number;
  SRAD: number;
  RAIN: number;
}

export interface SimulationStep extends DailyWeather {
  DTU: number;
  CTU: number;
  NDS: number;
  LAI: number;
  dB: number;
  B: number;
  /** FTSW (0-1) - Fraction Transpirable Soil Water */
  FTSW?: number;
  /** WSFG (0-1) - Water Stress Factor for Growth */
  WSFG?: number;
}

export interface WaterStep extends DailyWeather {
  RO: number;
  ET0: number;
  Tact: number;
  Eact: number;
  DRAIN: number;
  W: number;
  ARID: number;
  /** FTSW = ATSW/TTSW (Eq. 14.7) */
  FTSW?: number;
}

export interface EmergenceStep {
  day: number;
  T_soil: number;
  W_soil: number;
  GDD_daily: number;
  GDD_cum: number;
  HydroFactor: number; // 0-1 reduction due to water
  ETT_daily: number;   // Effective Thermal Time
  ETT_cum: number;
  EmergencePct: number; // 0-100%
}

export interface CalibrationResult {
  param: string;
  value: number;
  RMSE: number;
  B_final: number;
}

export interface SensitivityResult {
  param: string;
  scenario: 'low' | 'base' | 'high';
  value: number;
  B_final: number;
}
