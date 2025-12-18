
// Costanti Fisiche
export const CONSTANTS = {
  von_karman: 0.41,
  air_density: 1.225,  // kg/m^3
  air_specific_heat_capacity: 1013,  // J/kg/K
  latent_heat_of_vaporization: 2.45e6,  // J/kg
  absolute_zero: -273.15,  // °C
  stefan_boltzmann: 5.67e-8,  // W m^-2 K^-4
  gravitational_acceleration: 9.81,  // m/s^2
};

// Utilities Meteo
export const WeatherOps = {
  convert_celsius_to_kelvin: (t: number) => t - CONSTANTS.absolute_zero,
  convert_kelvin_to_celsius: (t: number) => t + CONSTANTS.absolute_zero,
  
  calc_saturated_air_vapor_pressure: (temp_c: number) => {
    return 0.6108 * Math.exp((17.27 * temp_c) / (temp_c + 237.3));
  },
  
  calc_vapor_pressure_deficit: (temp_air_c: number, rh: number) => {
    return WeatherOps.calc_saturated_air_vapor_pressure(temp_air_c) * (1 - rh / 100.0);
  },
  
  calc_psychrometric_constant: (p_atm: number) => {
    return (CONSTANTS.air_specific_heat_capacity * p_atm) / (CONSTANTS.latent_heat_of_vaporization * 0.622);
  },
  
  calc_vapor_pressure_slope: (temp_c: number) => {
    return (4098 * WeatherOps.calc_saturated_air_vapor_pressure(temp_c)) / Math.pow((temp_c + 237.3), 2);
  }
};

// Fisica della Chioma
export const CanopyOps = {
  calc_zero_displacement_height: (h: number, lai: number, cd: number) => {
    return h > 0 ? 1.1 * h * Math.log(1.0 + Math.pow(cd * lai, 0.25)) : 0;
  },
  
  calc_roughness_length: (z0s: number, d: number, h: number, lai: number, cd: number) => {
    if (h <= 0 || d >= h) return z0s;
    return Math.min(z0s + 0.3 * h * Math.pow(cd * lai, 0.5), 0.3 * h * (1 - d / h));
  },
  
  calc_friction_velocity: (u: number, zm: number, d: number, z0m: number, phi_m: number) => {
    return (CONSTANTS.von_karman * u) / (Math.log((zm - d) / z0m) - phi_m);
  },
  
  calc_monin_obukhov_length: (t_k: number, u_star: number, h_flux: number) => {
    if (Math.abs(u_star) < 1e-6 || Math.abs(h_flux) < 1e-6) return Infinity;
    const buoyancy = (CONSTANTS.gravitational_acceleration / t_k) * (h_flux / (CONSTANTS.air_density * CONSTANTS.air_specific_heat_capacity));
    if (buoyancy === 0) return Infinity;
    return -(Math.pow(u_star, 3)) / (CONSTANTS.von_karman * buoyancy);
  },
  
  calc_stability_correction: (zeta: number) => {
    if (zeta < 0) { // Instabile
      const x = Math.pow(1.0 - 16.0 * zeta, 0.25);
      const phi_h = 2.0 * Math.log((1 + x * x) / 2);
      const phi_m = 2.0 * Math.log((1 + x) / 2) + Math.log((1 + x * x) / 2) - 2 * Math.atan(x) + Math.PI / 2;
      return { phi_m, phi_h };
    } else { // Stabile
      const val = -5.0 * zeta;
      return { phi_m: val, phi_h: val };
    }
  }
};

// Fisica del Suolo
export const SoilOps = {
  calc_surface_resistance: (soil_sat_ratio: number) => Math.exp(8.206 - 4.255 * soil_sat_ratio),
  calc_heat_flux: (rn: number, is_diurnal: boolean) => (is_diurnal ? 0.1 : 0.5) * rn
};

// Solver Class
export class EnergySolver {
  inputs: any;
  params: any;
  leaves_category: 'Lumped' | 'Sunlit-Shaded';
  crop: any;

  constructor(leaves_category: 'Lumped' | 'Sunlit-Shaded', inputs: any, params: any) {
    this.inputs = inputs;
    this.params = params;
    this.leaves_category = leaves_category;
    this.crop = this.create_crop_objects();
  }

  create_crop_objects() {
    const lai = this.inputs.leaf_layers;
    const h = this.inputs.canopy_height;
    const cd = this.params.simulation.drag_coefficient;
    
    const d = CanopyOps.calc_zero_displacement_height(h, lai, cd);
    const z0m = CanopyOps.calc_roughness_length(
      this.params.simulation.soil_roughness_length_for_momentum, d, h, lai, cd
    );
    
    const state = { d, z0m, lai, h, r_a: null, sensible_heat_flux: 0 };
    const components = [];

    if (this.leaves_category === 'Lumped') {
      components.push({ type: 'LumpedLeaf', lai: lai, temp: this.inputs.air_temperature, A: 0, et_energy: 0, h_flux: 0, r_s: 0 });
    } else {
      const k_b = this.params.simulation.direct_black_extinction_coefficient;
      const lai_sunlit = k_b > 0 ? (1 - Math.exp(-k_b * lai)) / k_b : lai;
      const lai_shaded = lai - lai_sunlit;
      components.push({ type: 'SunlitLeaf', lai: lai_sunlit, temp: this.inputs.air_temperature, A: 0, et_energy: 0, h_flux: 0, r_s: 0 });
      components.push({ type: 'ShadedLeaf', lai: lai_shaded, temp: this.inputs.air_temperature, A: 0, et_energy: 0, h_flux: 0, r_s: 0 });
    }
    
    components.push({ type: 'Soil', lai: 0, temp: this.inputs.air_temperature, A: 0, et_energy: 0, h_flux: 0, r_s: 0 });
    
    return { state, components };
  }

  run(is_stability_considered = true) {
    this.solve_transient_energy_balance();
    
    if (is_stability_considered) {
      const max_iter = this.params.numerical_resolution.maximum_iteration_number;
      for (let i = 0; i < max_iter; i++) {
        const h_old = this.crop.state.sensible_heat_flux || 0;
        this.update_stability_and_ra();
        this.solve_transient_energy_balance();
        if (Math.abs(h_old - this.crop.state.sensible_heat_flux) < 1.0) break;
      }
    }
  }

  solve_transient_energy_balance() {
    const max_iter = this.params.numerical_resolution.maximum_iteration_number;
    for (let i = 0; i < max_iter; i++) {
      const temps_old = this.crop.components.map((c: any) => c.temp);
      this.update_state_variables();
      const temps_new = this.crop.components.map((c: any) => c.temp);
      
      const diff = temps_new.reduce((acc: number, val: number, idx: number) => acc + Math.abs(val - temps_old[idx]), 0);
      
      if (diff < this.params.numerical_resolution.acceptable_temperature_error) break;
    }
  }

  update_stability_and_ra() {
    const state = this.crop.state;
    const h_flux = state.sensible_heat_flux || 0;
    let phi_m = 0;
    let phi_h = 0;

    for (let i = 0; i < 10; i++) {
      const u_star = CanopyOps.calc_friction_velocity(this.inputs.wind_speed, this.inputs.measurement_height, state.d, state.z0m, phi_m);
      const L = CanopyOps.calc_monin_obukhov_length(this.inputs.air_temperature, u_star, h_flux);
      
      if (!isFinite(L)) break;
      
      const zeta = (this.inputs.measurement_height - state.d) / L;
      const corrections = CanopyOps.calc_stability_correction(zeta);
      
      if (Math.abs(corrections.phi_m - phi_m) < 0.01) break;
      
      phi_m = corrections.phi_m;
      phi_h = corrections.phi_h;
    }

    const u_star_final = CanopyOps.calc_friction_velocity(this.inputs.wind_speed, this.inputs.measurement_height, state.d, state.z0m, phi_m);
    const r_a = (Math.log((this.inputs.measurement_height - state.d) / state.z0m) - phi_h) / (u_star_final * CONSTANTS.von_karman);
    
    this.crop.state.r_a = Math.max(r_a, 1e-6);
  }

  update_state_variables() {
    const state = this.crop.state;
    const components = this.crop.components;
    
    const temp_air_c = WeatherOps.convert_kelvin_to_celsius(this.inputs.air_temperature);
    const delta = WeatherOps.calc_vapor_pressure_slope(temp_air_c);
    const gamma = WeatherOps.calc_psychrometric_constant(this.inputs.atmospheric_pressure * 1000); 
    const vpd = WeatherOps.calc_vapor_pressure_deficit(temp_air_c, this.inputs.relative_humidity);

    if (state.r_a === null) this.update_stability_and_ra();
    const r_a = state.r_a;

    const albedo = this.params.simulation.albedo !== undefined ? this.params.simulation.albedo : 0.23;
    const inc_rad_par = this.inputs.incident_par.direct + this.inputs.incident_par.diffuse;
    const inc_rad_global = inc_rad_par / 0.48;
    const is_diurnal = inc_rad_global > 0;

    const sw_net = (1 - albedo) * inc_rad_global;
    
    const lw_net = -CONSTANTS.stefan_boltzmann * Math.pow(this.inputs.air_temperature, 4) * 
                   (0.34 - 0.14 * Math.pow(this.inputs.vapor_pressure, 0.5)) * 
                   (1 - this.params.simulation.atmospheric_emissivity);

    const rn_total = sw_net + lw_net;
    const g_flux = SoilOps.calc_heat_flux(rn_total, is_diurnal);
    const a_total = rn_total - g_flux;

    let total_et_energy = 0;
    let total_h_flux = 0;

    const clip = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

    components.forEach((c: any) => {
      const water_stress = clip(
        (this.inputs.soil_water_content - this.params.simulation.wilting_point) / 
        (this.params.simulation.field_capacity - this.params.simulation.wilting_point), 
        0, 1
      );
      const k_b = this.params.simulation.direct_black_extinction_coefficient;

      if (c.type === 'Soil') {
        const sat_ratio = water_stress;
        c.r_s = SoilOps.calc_surface_resistance(sat_ratio);
        c.A = a_total * Math.exp(-k_b * state.lai);
      } else {
        let rad_gs = 0;
        if (c.type === 'LumpedLeaf') {
          rad_gs = (k_b * state.lai > 0) ? (inc_rad_par * (1 - Math.exp(-k_b * state.lai)) / (k_b * state.lai)) : inc_rad_par;
          c.A = a_total * (1 - Math.exp(-k_b * state.lai));
        } else {
           const lai_frac = state.lai > 0 ? c.lai / state.lai : 0;
           c.A = a_total * (1 - Math.exp(-k_b * state.lai)) * lai_frac;
           if (c.type === 'SunlitLeaf') {
             rad_gs = this.inputs.incident_par.direct + this.inputs.incident_par.diffuse;
           } else {
             rad_gs = this.inputs.incident_par.diffuse;
           }
        }

        const g_s = this.params.simulation.maximum_stomatal_conductance / 3600 * 
                    (rad_gs / (this.params.simulation.absorbed_par_50 + rad_gs)) * water_stress;
        
        c.r_s = (g_s * c.lai > 0) ? 1 / (g_s * c.lai) : 1e9;
      }

      const num = delta * c.A + (CONSTANTS.air_density * CONSTANTS.air_specific_heat_capacity * vpd / r_a);
      const den = delta + gamma * (1 + c.r_s / r_a);
      
      c.et_energy = den > 0 ? num / den : 0; 
      c.h_flux = c.A - c.et_energy; 
      
      c.temp = this.inputs.air_temperature + (c.h_flux * r_a) / (CONSTANTS.air_density * CONSTANTS.air_specific_heat_capacity);

      total_et_energy += c.et_energy;
      total_h_flux += c.h_flux;
    });

    this.crop.state.total_et_energy = total_et_energy;
    this.crop.state.sensible_heat_flux = total_h_flux;
  }
}

// Funzione di simulazione oraria
export const runEnergySimulation = (days: number, shadingPercent: number, overrides: any = {}) => {
  const defaults = {
    lai: 4.0,
    canopy_height: 0.8,
    max_conductance: 0.01, // m/s
    drag_coeff: 0.2,
    albedo: 0.23
  };

  const cfg = { ...defaults, ...overrides };

  const params = {
    simulation: {
      drag_coefficient: cfg.drag_coeff, 
      soil_roughness_length_for_momentum: 0.01,
      atmospheric_emissivity: 0.85, wilting_point: 0.15, field_capacity: 0.35,
      maximum_stomatal_conductance: cfg.max_conductance * 3600, // converte m/s in m/h
      absorbed_par_50: 100, direct_black_extinction_coefficient: 0.6,
      albedo: cfg.albedo
    },
    numerical_resolution: { acceptable_temperature_error: 0.01, maximum_iteration_number: 50 }
  };

  const results = [];
  const hours = Array.from({ length: days * 24 * 2 }, (_, i) => i * 0.5); // 0.5h steps

  let soil_water = 0.22;

  for (let t of hours) {
    const hour_of_day = t % 24;
    
    // Meteo
    const sin_rad = Math.sin(Math.PI * (hour_of_day - 6) / 13);
    let rad_global = Math.max(0, 1050 * sin_rad);
    if (rad_global < 0) rad_global = 0;

    let rad_direct = rad_global * 0.85;
    let rad_diffuse = rad_global * 0.15;
    
    if (rad_global > 0) {
        const factor = 1 - (shadingPercent / 100);
        rad_direct *= factor;
        rad_diffuse *= factor;
    }

    const temp_c = 22 + 15 * Math.sin(Math.PI * (hour_of_day - 9) / 15);
    const rh = Math.max(20, Math.min(85, 75 - 55 * Math.sin(Math.PI * (hour_of_day - 9) / 15)));

    const inputs = {
      measurement_height: Math.max(2.0, cfg.canopy_height + 1.5), // Ensure meas height > canopy
      canopy_height: cfg.canopy_height,
      soil_water_content: soil_water,
      air_temperature: WeatherOps.convert_celsius_to_kelvin(temp_c),
      wind_speed: 2.0,
      relative_humidity: rh,
      atmospheric_pressure: 101.3,
      leaf_layers: cfg.lai,
      vapor_pressure: WeatherOps.calc_saturated_air_vapor_pressure(temp_c) * rh / 100, 
      incident_par: {
        direct: rad_direct * 0.48, 
        diffuse: rad_diffuse * 0.48
      }
    };

    const solver = new EnergySolver('Sunlit-Shaded', inputs, params);
    solver.run();

    const leaf_comps = solver.crop.components.filter((c: any) => c.type.includes('Leaf'));
    const soil_comp = solver.crop.components.find((c: any) => c.type === 'Soil');
    
    let avg_leaf_temp_k = inputs.air_temperature;
    let total_lai = 0;
    let weighted_temp_sum = 0;
    
    leaf_comps.forEach((c: any) => {
        total_lai += c.lai;
        weighted_temp_sum += c.temp * c.lai;
    });
    if (total_lai > 0) avg_leaf_temp_k = weighted_temp_sum / total_lai;

    const et_energy = solver.crop.state.total_et_energy; 
    const et_mm_h = (et_energy * 3600) / CONSTANTS.latent_heat_of_vaporization;

    const soil_depth_m = 0.4;
    const delta_swc = (et_mm_h / 1000) / soil_depth_m * 0.5;
    soil_water = Math.max(params.simulation.wilting_point, soil_water - delta_swc);

    results.push({
        time: t,
        hour: hour_of_day,
        rad: rad_direct + rad_diffuse,
        temp_air: temp_c,
        temp_canopy: WeatherOps.convert_kelvin_to_celsius(avg_leaf_temp_k),
        temp_soil: WeatherOps.convert_kelvin_to_celsius(soil_comp.temp),
        et_mm_h: et_mm_h,
        soil_water: soil_water,
        vpd: WeatherOps.calc_vapor_pressure_deficit(temp_c, rh)
    });
  }

  return results;
};
