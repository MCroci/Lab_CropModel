
// Farquhar-von Caemmerer-Berry model implementation
// Ported from provided R scripts

interface FarquharInput {
  V_max: number; // Maximum rubisco-limited rate (µmol m-2 s-1)
  J_max: number; // Maximum light-limited rate (µmol m-2 s-1)
  APAR: number;  // Absorbed PAR (µmol m-2 s-1)
  c_i: number;   // Intercellular CO2 partial pressure (Pa)
  temp_C: number; // Leaf temperature (°C)
}

export const calculateAn = ({ V_max, J_max, APAR, c_i, temp_C }: FarquharInput): number => {
  const p_sfc = 101325; // Surface air pressure (Pa)
  const O_i = 0.209 * p_sfc; // Oxygen partial pressure (Pa)

  // Temperature adjustments (Collatz et al 1991)
  const k_tau = (temp_C - 25) / 10;
  
  // CO2/O2 specificity ratio for rubisco
  const tau = 2600 * Math.pow(0.57, k_tau);
  
  // CO2 compensation point (Pa)
  const gamma = O_i / (2 * tau);
  
  // Michaelis constants (Pa)
  const K_c = 30 * Math.pow(2.1, k_tau);
  const K_o = 30000 * Math.pow(1.2, k_tau);

  // Temp-adjusted V_max
  const cold = 10;
  const hot = 40;
  const slope_cold = 0.25;
  const slope_heat = 0.4;
  
  const cold_inhibition = 1 + Math.exp(slope_cold * (cold - temp_C));
  const heat_inhibition = 1 + Math.exp(slope_heat * (temp_C - hot));
  
  const V_m = (V_max * Math.pow(2.1, k_tau)) / (cold_inhibition * heat_inhibition);

  // Temp-adjusted leaf respiration (Rd)
  const R_d = (0.015 * V_m * Math.pow(2.4, k_tau)) / (1 + Math.exp(1.3 * (temp_C - 55)));

  // Electron transport rate (J) - Quadratic solution
  // Theta (curvature) is 0.7 (standard value in Farquhar models)
  const a = 0.7;
  const b = -(J_max + 0.385 * APAR);
  const c = 0.385 * J_max * APAR;
  
  const sqrt_term = Math.sqrt(b * b - 4 * a * c);
  const J_1 = (-b + sqrt_term) / (2 * a);
  const J_2 = (-b - sqrt_term) / (2 * a);
  const J = Math.min(J_1, J_2);

  // 1. Rubisco-limited rate (wc)
  const w_c = (V_m * (c_i - gamma)) / (c_i + K_c * (1 + O_i / K_o));

  // 2. Light-limited rate (wj)
  const w_j = (J * (c_i - gamma)) / (4 * (c_i + 2 * gamma));

  // 3. Sink-limited rate (TPU) (ws)
  const w_s = V_m / 2;

  // Net Assimilation (An)
  const A_n = Math.min(w_c, w_j, w_s) - R_d;

  return A_n;
};

// Generators for Charts
export const generateCO2Response = (V_max: number, J_max: number, temp_C: number) => {
  const data = [];
  // Loop CO2 from 10 to 1000 ppm
  for (let co2 = 10; co2 <= 1000; co2 += 10) {
    // Convert ppm to Pa (approx / 10 as per R script logic provided)
    const c_i_Pa = co2 / 10;
    const An = calculateAn({
      V_max,
      J_max,
      temp_C,
      APAR: 500, // Standard light
      c_i: c_i_Pa
    });
    data.push({ x: co2, y: An });
  }
  return data;
};

export const generateLightResponse = (V_max: number, J_max: number, temp_C: number) => {
  const data = [];
  // Loop PPFD from 0 to 2000
  for (let apar = 0; apar <= 2000; apar += 20) {
    const An = calculateAn({
      V_max,
      J_max,
      temp_C,
      APAR: apar,
      c_i: 30 // Standard Ci ~300ppm -> 30Pa
    });
    data.push({ x: apar, y: An });
  }
  return data;
};
