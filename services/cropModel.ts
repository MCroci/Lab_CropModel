import { WeatherParams, CropParams, SoilParams, DailyWeather, SimulationStep, WaterStep } from '../types';

/**
 * Heat stress factor (SIMPLE model - Zhao et al. 2019).
 * Growth is reduced when Tmax exceeds threshold; zero above Text.
 */
const fHeat = (tmax: number, tmaxThresh: number, text: number): number => {
  if (tmax < tmaxThresh) return 1;
  if (tmax >= text) return 0;
  return 1 - (tmax - tmaxThresh) / (text - tmaxThresh);
};

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

const generateRain = (mean: number): number => {
  if (mean <= 0) return 0;
  return -Math.log(Math.random()) * mean;
};

export const makeWeather = (params: WeatherParams): DailyWeather[] => {
  const { tmean, tamp, srad, rain_mean } = params;
  const weather: DailyWeather[] = [];
  const n_days = 365;

  for (let i = 1; i <= n_days; i++) {
    const doy = i;
    const tmp = tmean + tamp * Math.sin(2 * Math.PI * (doy - 30) / 365);
    const tmin = tmp - 5;
    const tmax = tmp + 5;
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

/** Eq. 6.1 - tempfun: funzione normalizzata (0-1) risposta alla temperatura */
const tempfun = (tavg: number, TBD: number, TP1D: number, TP2D: number, TCD: number): number => {
  if (tavg <= TBD) return 0;
  if (tavg < TP1D) return (tavg - TBD) / (TP1D - TBD);
  if (tavg <= TP2D) return 1;
  if (tavg < TCD) return (TCD - tavg) / (TCD - TP2D);
  return 0;
};

/** Eq. 6.2 - DTU corretta per temperatura (usa tempfun) */
const dttWithTempfun = (tmin: number, tmax: number, TBD: number, TP1D: number, TP2D: number, TCD: number): number => {
  const tavg = (tmin + tmax) / 2;
  const tf = tempfun(tavg, TBD, TP1D, TP2D, TCD);
  return (TP1D - TBD) * tf;
};

/** DTU semplificata (Eq. 2.1) - fallback */
const dttSimple = (tmin: number, tmax: number, tbase: number) => Math.max(((tmin + tmax) / 2) - tbase, 0);

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

const ddmp = (srad: number, lai: number, k: number, rue: number, tempFactor = 1, waterFactor = 1) => {
  return srad * 0.48 * fint(lai, k) * rue * tempFactor * waterFactor;
};

/** Eq. 15.3 - WSFG: Water Stress Factor for Growth */
const wsfg = (ftsw: number, wssg: number): number =>
  ftsw >= wssg ? 1 : Math.max(0, ftsw / wssg);

/** Eq. 14.14 - Runoff SCS: S = 254*(100/CN - 1), RO = (RAIN - 0.2*S)²/(RAIN + 0.8*S) se RAIN > 0.2*S */
const runoffSCS = (rain: number, cn: number): number => {
  if (rain <= 0 || cn <= 0) return 0;
  const S = 254 * (100 / cn - 1);
  if (S <= 0) return rain;
  if (rain <= 0.2 * S) return 0;
  return Math.pow(rain - 0.2 * S, 2) / (rain + 0.8 * S);
};

/** Simulazione accoppiata coltura + bilancio idrico (FTSW, WSFG, tempfun, SCS) */
export const simulateCropAndWater = (
  weather: DailyWeather[],
  cropParams: CropParams,
  soilParams: SoilParams,
  sowingDay: number = 1
): { crop: SimulationStep[]; water: WaterStep[] } => {
  const p = { ...cropParams };
  const sp = { ...soilParams };
  const TBD = p.Tbase;
  const TP1D = p.TP1D ?? p.TP1RUE;
  const TP2D = p.TP2D ?? p.TP2RUE;
  const TCD = p.TCD ?? p.TCRUE;
  const WSSG = p.WSSG ?? 0.25;
  const CN = sp.CN ?? 0;

  let CTU = 0;
  let NDS = 0;
  let LAI = 0;
  let B = p.B0;
  let W = sp.W0;
  const TTSW = Math.max(sp.W_fc - sp.W_wp, 1e-6);

  const cropResults: SimulationStep[] = [];
  const waterResults: WaterStep[] = [];

  for (let i = 0; i < weather.length; i++) {
    const w = weather[i];
    const isCropPhase = i >= sowingDay - 1;

    if (i === sowingDay - 1) {
      LAI = p.LAI0;
      CTU = 0;
      NDS = 0;
    }

    const ATSW = Math.max(W - sp.W_wp, 0);
    const FTSW = Math.min(ATSW / TTSW, 1.5);
    const WSFG_val = isCropPhase ? wsfg(FTSW, WSSG) : 1;

    let DTU = 0;
    if (isCropPhase) {
      DTU = dttWithTempfun(w.TMIN, w.TMAX, TBD, TP1D, TP2D, TCD);
      CTU += DTU;
      NDS = clamp(CTU / p.tuHAR, 0, 1);
    }

    let tf = 0;
    const tavg = (w.TMIN + w.TMAX) / 2;
    if (isCropPhase) {
      if (tavg <= p.TBRUE || tavg >= p.TCRUE) tf = 0;
      else if (tavg < p.TP1RUE) tf = (tavg - p.TBRUE) / (p.TP1RUE - p.TBRUE);
      else if (tavg > p.TP2RUE) tf = (p.TCRUE - tavg) / (p.TCRUE - p.TP2RUE);
      else tf = 1;
    }

    if (isCropPhase) {
      const { lai: newLAI } = laiStep(LAI, NDS, p);
      LAI = newLAI;

      const tmaxHeat = (p as CropParams & { TmaxHeat?: number }).TmaxHeat ?? 35;
      const textHeat = (p as CropParams & { TextHeat?: number }).TextHeat ?? 45;
      const heatFactor = fHeat(w.TMAX, tmaxHeat, textHeat);
      const dB = NDS >= 1 ? 0 : ddmp(w.SRAD, LAI, p.KPAR, p.RUE, tf * heatFactor, WSFG_val);
      B += dB;

      cropResults.push({ ...w, DTU, CTU, NDS, LAI, dB, B, FTSW, WSFG: WSFG_val });

      if (NDS >= 1) {
        const f_cover = clamp(LAI / sp.LAI_full_cover, 0, 1);
        const eto = sp.ET0;
        const Tpot = eto * f_cover;
        const Epot = eto * (1 - f_cover);
        const aw = Math.max(W - sp.W_wp, 0);
        const Tact = Math.min(Tpot, sp.alpha * aw);
        const Eact = Math.min(Epot, sp.gamma * aw);
        const D = Math.max(W - sp.W_fc, 0) * sp.beta;
        const RO = (CN != null && CN > 0) ? runoffSCS(w.RAIN, CN) : Math.max(w.RAIN - sp.inf_cap, 0);
        W = clamp(W + (w.RAIN - RO - Tact - Eact - D), 0, sp.W_sat);
        waterResults.push({ ...w, RO, ET0: eto, Tact, Eact, DRAIN: D, W, ARID: eto > 0 ? 1 - Tact / eto : 0, FTSW });
        break;
      }
    }

    const f_cover = clamp(LAI / sp.LAI_full_cover, 0, 1);
    const eto = sp.ET0;
    const Tpot = eto * f_cover;
    const Epot = eto * (1 - f_cover);
    const aw = Math.max(W - sp.W_wp, 0);
    const Tact = Math.min(Tpot, sp.alpha * aw);
    const Eact = Math.min(Epot, sp.gamma * aw);
    const D = Math.max(W - sp.W_fc, 0) * sp.beta;
    const RO = (CN != null && CN > 0) ? runoffSCS(w.RAIN, CN) : Math.max(w.RAIN - sp.inf_cap, 0);
    W = clamp(W + (w.RAIN - RO - Tact - Eact - D), 0, sp.W_sat);
    waterResults.push({ ...w, RO, ET0: eto, Tact, Eact, DRAIN: D, W, ARID: eto > 0 ? 1 - Tact / eto : 0, FTSW });
  }
  return { crop: cropResults, water: waterResults };
};

/** Crop standalone (senza accoppiamento acqua) - usa FTSW=1 */
export const simulateCrop = (weather: DailyWeather[], params: CropParams): SimulationStep[] => {
  const neutralSoil: SoilParams = {
    W0: 160,
    W_wp: 60,
    W_fc: 160,
    W_sat: 250,
    ET0: 4,
    alpha: 0.25,
    beta: 0.2,
    gamma: 0.15,
    inf_cap: 25,
    LAI_full_cover: 3,
    soil_depth: 30,
    initial_soc: 50,
    clay_percent: 25
  };
  return simulateCropAndWater(weather, params, neutralSoil).crop;
};

/** Water standalone (con LAI esterno, es. SeedEmergenceView) - include SCS e FTSW */
export const simulateSoilWater = (weather: DailyWeather[], soilPar: SoilParams, laiSeries: number[]): WaterStep[] => {
  let W = soilPar.W0;
  const results: WaterStep[] = [];
  const CN = soilPar.CN ?? 0;
  const TTSW = Math.max(soilPar.W_fc - soilPar.W_wp, 1e-6);

  for (let i = 0; i < weather.length; i++) {
    const w = weather[i];
    const lai = i < laiSeries.length ? laiSeries[i] : laiSeries[laiSeries.length - 1] || 0;

    const ATSW = Math.max(W - soilPar.W_wp, 0);
    const FTSW = Math.min(ATSW / TTSW, 1.5);

    const eto = soilPar.ET0;
    const f_cover = clamp(lai / soilPar.LAI_full_cover, 0, 1);
    const Tpot = eto * f_cover;
    const Epot = eto * (1 - f_cover);

    const aw = Math.max(W - soilPar.W_wp, 0);
    const Tact = Math.min(Tpot, soilPar.alpha * aw);
    const Eact = Math.min(Epot, soilPar.gamma * aw);

    const D = Math.max(W - soilPar.W_fc, 0) * soilPar.beta;
    const RO = (CN != null && CN > 0) ? runoffSCS(w.RAIN, CN) : Math.max(w.RAIN - soilPar.inf_cap, 0);

    W = clamp(W + (w.RAIN - RO - Tact - Eact - D), 0, soilPar.W_sat);

    const ARID = eto > 0 ? 1 - Tact / eto : 0;

    results.push({
      ...w,
      RO,
      ET0: eto,
      Tact,
      Eact,
      DRAIN: D,
      W,
      ARID,
      FTSW
    });
  }
  return results;
};
