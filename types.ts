
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
  Tmean?: number; // Used for RUE temp response check
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
  // Carbon specific fields
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
}

export interface WaterStep extends DailyWeather {
  RO: number;
  ET0: number;
  Tact: number;
  Eact: number;
  DRAIN: number;
  W: number;
  ARID: number;
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

export type RotationType = 
  | 'Pomodoro - Frumento granella'
  | 'Pomodoro - Frumento gr - Mais gr'
  | 'Pomodoro - Frumento gr - Mais tr'
  | 'Pomodoro - Frumento gr - Soia'
  | 'Pomodoro - Frumento gr - Sorgo'
  | 'Pomodoro - Frumento gr - Barbabietola'
  | 'Pomodoro - Frumento - Medica (3y)';

export interface CarbonParams {
  rotation: RotationType;
  isMinimumTillage: boolean;
  hasCoverCrops: boolean;
  incorporateResidues: boolean;
  addManure: boolean;
  agrivoltaicsShading: number;
}

export interface RothCResult {
  month: number;
  year: number;
  DPM: number;
  RPM: number;
  BIO: number;
  HUM: number;
  IOM: number;
  TotalSOC: number;
  CO2_Emitted: number;
  C_Input: number;
}