import { WeatherParams, CropParams, SoilParams, DailyWeather, SimulationStep, WaterStep } from '../types';

// Utility Helpers
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// Simple Gamma-like generator (Box-Muller approx or simple log for didactic purposes)
// R's rgamma(shape=1.2, scale=mean/1.2). 
// Since we don't have a stats library, we will use a simplified approximation for positive skewed distribution.
const generateRain = (mean: number): number => {
  if (mean <= 0) return 0;
  // Simplified: using exponential distribution which is a special case of Gamma(1, scale)
  // Close enough for didactic weather gen.
  return -Math.log(Math.random()) * mean;
};

export const makeWeather = (params: WeatherParams): DailyWeather[] => {
  const { n_days, tmean, tamp, srad, rain_mean } = params;
  const weather: DailyWeather[] = [];

  for (let i = 1; i <= n_days; i++) {
    const doy = i;
    const tmp = tmean + tamp * Math.sin(2 * Math.PI * (doy - 30) / 365);
    const tmin = tmp - 5;
    const tmax = tmp + 5;
    // Keep SRAD positive and seasonal
    const srad_d = Math.max(0, srad + 6 * Math.sin(2 * Math.PI * (doy - 80) / 365));
    const rain = generateRain(rain_mean);

    weather.push({
      day: doy,
      TMIN: tmin,
      TMAX: tmax,
      SRAD: srad_d,
      RAIN: rain
    });
  }
  return weather;
};

// Thermal time
const dtt = (tmin: number, tmax: number, tbase: number) => Math.max(((tmin + tmax) / 2) - tbase, 0);

// LAI Step
const laiStep = (lai: number, nds: number, p: CropParams) => {
  const { frEMR, frBLS, LAIMX, ALPHA, SENRATE } = p;
  let dlai = 0;
  let lai2 = lai;

  if (nds >= frEMR && nds < frBLS) {
    dlai = ALPHA * lai * Math.max(LAIMX - lai, 0);
    lai2 = lai + dlai;
  } else if (nds >= frBLS && nds < 1) {
    dlai = -SENRATE * lai;
    lai2 = Math.max(lai + dlai, 0);
  } else {
    lai2 = lai;
    dlai = 0;
  }
  return { lai: lai2, dlai };
};

// Radiation Interception & Biomass
const fint = (lai: number, k: number) => 1 - Math.exp(-k * lai);

const ddmp = (srad: number, lai: number, k: number, rue: number, tempFactor = 1) => {
  return srad * 0.48 * fint(lai, k) * rue * tempFactor;
};

export const simulateCrop = (weather: DailyWeather[], params: CropParams): SimulationStep[] => {
  let CTU = 0;
  let NDS = 0;
  let LAI = params.LAI0;
  let B = params.B0;
  
  const results: SimulationStep[] = [];
  // Use Tmean from weather param or default if not passed, effectively calculated from data usually
  // The R code uses input$tmean passed into params.
  const p = { ...params }; 

  for (let i = 0; i < weather.length; i++) {
    const w = weather[i];
    const DTU = dtt(w.TMIN, w.TMAX, p.Tbase);
    CTU += DTU;
    NDS = clamp(CTU / p.tuHAR, 0, 1);

    // Temperature response
    let tf = 0;
    // Check if Tmean is valid for calculation logic from R code (seems to use params.Tmean > params.Tbase as a switch)
    // We will assume the logic is always active if params provided
    const tavg = (w.TMIN + w.TMAX) / 2;
    if (tavg <= p.TBRUE || tavg >= p.TCRUE) {
      tf = 0;
    } else if (tavg > p.TBRUE && tavg < p.TP1RUE) {
      tf = (tavg - p.TBRUE) / (p.TP1RUE - p.TBRUE);
    } else if (tavg > p.TP2RUE && tavg < p.TCRUE) {
      tf = (p.TCRUE - tavg) / (p.TCRUE - p.TP2RUE);
    } else {
      tf = 1;
    }

    // LAI
    const { lai: newLAI } = laiStep(LAI, NDS, p);
    LAI = newLAI;

    // Biomass
    let dB = ddmp(w.SRAD, LAI, p.KPAR, p.RUE, tf);
    if (NDS >= 1) dB = 0;
    B += dB;

    results.push({
      ...w,
      DTU, CTU, NDS, LAI, dB, B
    });

    if (NDS >= 1) break; // Stop simulation at maturity
  }

  return results;
};

export const simulateSoilWater = (weather: DailyWeather[], soilPar: SoilParams, laiSeries: number[]): WaterStep[] => {
  let W = soilPar.W0;
  const results: WaterStep[] = [];

  for (let i = 0; i < weather.length; i++) {
    const w = weather[i];
    // get LAI, if simulation ended early, use last LAI
    const lai = i < laiSeries.length ? laiSeries[i] : laiSeries[laiSeries.length - 1] || 0;

    const eto = soilPar.ET0;
    const f_cover = clamp(lai / soilPar.LAI_full_cover, 0, 1);
    const Tpot = eto * f_cover;
    const Epot = eto * (1 - f_cover);

    const aw = Math.max(W - soilPar.W_wp, 0);
    const Tact = Math.min(Tpot, soilPar.alpha * aw);
    const Eact = Math.min(Epot, soilPar.gamma * aw);

    const D = Math.max(W - soilPar.W_fc, 0) * soilPar.beta;
    const RO = Math.max(w.RAIN - soilPar.inf_cap, 0);

    W = W + (w.RAIN - RO - Tact - Eact - D);
    W = clamp(W, 0, soilPar.W_sat);

    const ARID = eto > 0 ? 1 - (Tact / eto) : 0;

    results.push({
      ...w,
      RO, ET0: eto, Tact, Eact, DRAIN: D, W, ARID
    });
  }
  return results;
};
