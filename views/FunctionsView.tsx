import React from 'react';
import { Card } from '../components/UI';
import { Code, CloudRain, Sun, Droplet, Sprout, Recycle, Calendar, Zap } from 'lucide-react';

const CodeBlock: React.FC<{ title: string; code: string; icon?: React.ReactNode; description: string }> = ({ title, code, icon, description }) => (
  <Card title={title} headerAction={icon}>
    <p className="text-sm text-gray-600 mb-4 italic border-l-2 border-brand-300 pl-3">
      {description}
    </p>
    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
      <pre className="text-xs md:text-sm font-mono text-blue-100 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  </Card>
);

export const FunctionsView: React.FC = () => {
  
  const CODE_WEATHER = `// Generatore Meteo Stocastico (Semplificato)
// Simula l'andamento stagionale sinusoidale per T e Radiazione.

export const makeWeather = (params: WeatherParams): DailyWeather[] => {
  const { n_days, tmean, tamp, srad, rain_mean } = params;
  const weather: DailyWeather[] = [];

  for (let i = 1; i <= n_days; i++) {
    const doy = i; // Day of Year
    
    // 1. Temperatura: Sinusoide annuale + rumore
    // (doy - 30) sposta il picco freddo a Gennaio/Febbraio
    const tmp = tmean + tamp * Math.sin(2 * Math.PI * (doy - 30) / 365);
    const tmin = tmp - 5; // Escursione fissa semplificata
    const tmax = tmp + 5;

    // 2. Radiazione: Segue la stagionalità (più alta in estate)
    // Math.max(0, ...) assicura valori non negativi
    const srad_d = Math.max(0, srad + 6 * Math.sin(2 * Math.PI * (doy - 80) / 365));

    // 3. Pioggia: Generatore esponenziale (pochi eventi intensi, molti nulli)
    // -Math.log(Math.random()) genera una distribuzione esponenziale
    const rain = -Math.log(Math.random()) * rain_mean;

    weather.push({ day: doy, TMIN: tmin, TMAX: tmax, SRAD: srad_d, RAIN: rain });
  }
  return weather;
};`;

  const CODE_PHENOLOGY = `// Tempo Termico (GDD - Growing Degree Days)
// Misura "l'orologio biologico" della pianta basato sulla temperatura.

// 1. Calcolo Unità Termiche Giornaliere (DTU)
const dtt = (tmin: number, tmax: number, tbase: number) => {
  const tavg = (tmin + tmax) / 2;
  // Se la temperatura media è sopra la base, accumula gradi giorno
  // Se è sotto, la crescita si arresta (0)
  return Math.max(tavg - tbase, 0);
};

// 2. Accumulo nel ciclo (CTU)
// Eseguito ogni giorno nel loop di simulazione:
let CTU = 0;
// params.tuHAR è la somma termica necessaria per la raccolta (es. 1400 °C·d)

for (const day of weather) {
   const DTU = dtt(day.TMIN, day.TMAX, params.Tbase);
   CTU += DTU; // Accumulo cumulativo

   // 3. Calcolo Stadio di Sviluppo (NDS)
   // Normalizzato da 0 (Emergenza) a 1 (Maturità)
   // clamp assicura che resti tra 0 e 1
   const NDS = Math.min(CTU / params.tuHAR, 1);
   
   if (NDS >= 1) break; // Ciclo concluso
}`;

  const CODE_LAI = `// Dinamica Area Fogliare (LAI)
// Crescita logistica limitata da LAI massimo + Senescenza finale.

const laiStep = (lai: number, nds: number, p: CropParams) => {
  const { frEMR, frBLS, LAIMX, ALPHA, SENRATE } = p;
  let dlai = 0;

  // Fase 1: Crescita (da Emergenza a Inizio Senescenza)
  if (nds >= frEMR && nds < frBLS) {
    // Equazione differenziale logistica:
    // Tasso * LAI corrente * (Spazio disponibile per crescere)
    dlai = ALPHA * lai * Math.max(LAIMX - lai, 0);
  } 
  // Fase 2: Senescenza (da Inizio Senescenza a Maturità)
  else if (nds >= frBLS && nds < 1) {
    // Decadimento lineare proporzionale al LAI corrente
    dlai = -SENRATE * lai;
  }

  // Aggiorna stato (non scendere sotto zero)
  return Math.max(lai + dlai, 0);
};`;

  const CODE_BIOMASS = `// Accumulo Biomassa (Radiation Use Efficiency)
// B = RUE * Radiazione Intercettata * Fattore Temperatura

// 1. Legge di Beer-Lambert per l'intercettazione
const fint = (lai: number, k: number) => 1 - Math.exp(-k * lai);

// 2. Calcolo crescita giornaliera (Delta Dry Matter Production)
const ddmp = (srad: number, lai: number, k: number, rue: number, tempFactor = 1) => {
  // 0.48 è la frazione di radiazione fotosinteticamente attiva (PAR)
  return srad * 0.48 * fint(lai, k) * rue * tempFactor;
};

// Nota: tempFactor è 0 se T < Tbase o T > Tmax, e 1 se T è ottimale.`;

  const CODE_WATER = `// Bilancio Idrico del Suolo ("Tipping Bucket")
// W(t+1) = W(t) + Pioggia - Ruscellamento - Evap - Drenaggio

export const simulateSoilWater = (weather, soilPar, laiSeries) => {
  let W = soilPar.W0; // Acqua iniziale (mm)

  for (let i = 0; i < weather.length; i++) {
    const w = weather[i];
    const lai = laiSeries[i];
    const et0 = soilPar.ET0; // Evapotraspirazione Potenziale

    // 1. Partizione ET0 in Tpot (Transpirazione) e Epot (Evaporazione suolo)
    const f_cover = Math.min(lai / soilPar.LAI_full_cover, 1);
    const Tpot = et0 * f_cover;
    const Epot = eto * (1 - f_cover);

    // 2. Calcolo flussi reali (limitati dall'acqua disponibile AW)
    const aw = Math.max(W - soilPar.W_wp, 0); // Acqua disponibile sopra p.to appassimento
    
    // Tasso decrescente al diminuire dell'acqua (alpha)
    const Tact = Math.min(Tpot, soilPar.alpha * aw); 
    const Eact = Math.min(Epot, soilPar.gamma * aw);

    // 3. Ingressi e Uscite
    const RO = Math.max(w.RAIN - soilPar.inf_cap, 0); // Ruscellamento
    const D = Math.max(W - soilPar.W_fc, 0) * soilPar.beta; // Drenaggio profondo

    // 4. Aggiornamento Stato
    W = W + (w.RAIN - RO - Tact - Eact - D);
    W = Math.min(W, soilPar.W_sat); // Non superare saturazione

    // 5. Indice di Stress (ARID)
    // 0 = Nessuno stress, 1 = Stress totale (morte)
    const ARID = et0 > 0 ? 1 - (Tact / eto) : 0;
  }
};`;

  const CODE_ROTHC = `// Decomposizione Carbonio (Modello RothC Semplificato)
// C(t+1) = C(t) * exp(-k * Modificatori * dt)

export const runRothCStep = (pools, inputs, modifiers) => {
  const tstep = 1 / 12; // Passo mensile
  
  // Modificatori ambientali combinati
  // Temp: aumenta decomposizione col caldo
  // Moisture: rallenta se troppo secco
  // Cover: rallenta se c'è copertura vegetale (suolo meno esposto)
  const combinedMod = modifiers.temp * modifiers.moisture * modifiers.cover;

  // Funzione di decadimento primo ordine per ogni pool (DPM, RPM, BIO, HUM)
  const decompose = (poolName, amount) => {
    const rate = RATE_CONSTANTS[poolName]; // es. DPM=10, HUM=0.02
    
    // Calcolo quantità decomposta
    const decomposed = amount * (1 - Math.exp(-rate * combinedMod * tstep));
    return decomposed;
  };

  // ... logica di ripartizione tra CO2, BIO e HUM basata sull'argilla ...
  
  return updatedPools; // Restituisce i nuovi valori di C nel suolo
};`;

  const CODE_ENERGY = `// Bilancio Energetico (Penman-Monteith & Aerodinamica)
// Simulazione oraria che risolve temperatura di chioma e suolo.

// 1. Resistenza Aerodinamica (r_a) con Correzione di Stabilità
// Basata sulla teoria della similarità di Monin-Obukhov
const calc_ra = (u_wind, h_canopy, H_flux) => {
  // Lunghezza di Monin-Obukhov (L): determina la stabilità
  // L > 0 (Stabile), L < 0 (Instabile/Turbolento)
  const L = calc_monin_obukhov(u_star, H_flux);
  
  // Fattori di correzione (psi) per momento e calore
  const psi_m = calc_stability_correction(L);
  
  // Legge logaritmica del vento corretta
  return (Math.log((z - d) / z0) - psi_m) / (k * u_star);
};

// 2. Resistenza Stomatica (r_s) - Modello Jarvis
// Regola la traspirazione in base a luce e acqua
const calc_rs = (par, soil_water) => {
  const f_light = par / (par + k_par); // Saturazione luce
  const f_water = (soil_water - wp) / (fc - wp); // Stress idrico
  const g_s = g_max * f_light * f_water;
  return 1 / g_s;
};

// 3. Risolutore Energetico (Iterativo)
// Bilancio: Rn (Netta) = H (Sensibile) + LE (Latente) + G (Suolo)
// H dipende da (T_leaf - T_air) / r_a
// LE dipende da Penman-Monteith(r_a, r_s)

// Il sistema cerca T_leaf che chiude il bilancio energetico:
do {
   // La resistenza aerodinamica r_a cambia con la temperatura (stabilità)
   update_stability(T_leaf); 
   
   // I flussi H e LE cambiano con r_a e T_leaf
   calc_fluxes(r_a, r_s, T_leaf);      
   
   // Nuova stima di temperatura basata sul residuo
   new_temp = solve_temperature();
} while (abs(new_temp - old_temp) > tolerance);`;

  return (
    <div className="space-y-8">
       <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <h2 className="text-xl font-bold text-blue-900">Logica Interna del Modello</h2>
          <p className="text-blue-700 mt-1">
            Qui sotto sono mostrate le funzioni TypeScript reali utilizzate in questa applicazione. 
            Analizzarle aiuta a capire come i concetti teorici (equazioni differenziali, leggi fisiche) 
            vengono tradotti in algoritmi discreti.
          </p>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <CodeBlock 
            title="1. Generatore Meteo" 
            icon={<CloudRain className="text-blue-500"/>}
            description="Crea dati sintetici giornalieri usando funzioni sinusoidali per la temperatura e stocastiche per la pioggia."
            code={CODE_WEATHER} 
          />
          
          <CodeBlock 
            title="2. Fenologia (Tempo Termico)" 
            icon={<Calendar className="text-purple-500"/>}
            description="Calcola l'accumulo di gradi giorno (CTU) per determinare lo stadio di sviluppo (NDS) da 0 a 1."
            code={CODE_PHENOLOGY} 
          />

          <CodeBlock 
            title="3. Sviluppo Area Fogliare (LAI)" 
            icon={<Sprout className="text-green-500"/>}
            description="Il motore della crescita. Combina una fase esponenziale iniziale con una fase di senescenza guidata dallo stadio fenologico (NDS)."
            code={CODE_LAI} 
          />

          <CodeBlock 
            title="4. Produzione Biomassa" 
            icon={<Sun className="text-orange-500"/>}
            description="Implementazione della RUE (Radiation Use Efficiency). La biomassa è l'integrale della luce intercettata convertita in materia secca."
            code={CODE_BIOMASS} 
          />

          <CodeBlock 
            title="5. Bilancio Idrico a Secchio" 
            icon={<Droplet className="text-cyan-500"/>}
            description="Un modello 'tipping bucket' (a secchio). Calcola quanta acqua entra e quanta ne esce, determinando lo stress idrico (ARID)."
            code={CODE_WATER} 
          />
          
           <CodeBlock 
            title="6. Bilancio Energetico (Agrivoltaico)" 
            icon={<Zap className="text-yellow-600"/>}
            description="Risolve l'equazione del bilancio energetico (Penman-Monteith) considerando la resistenza aerodinamica e stomatica."
            code={CODE_ENERGY} 
          />

          <div className="xl:col-span-2">
            <CodeBlock 
              title="7. Dinamica del Carbonio (RothC)" 
              icon={<Recycle className="text-emerald-500"/>}
              description="La logica 'core' del modello RothC. Mostra come i pool di carbonio decadono nel tempo basandosi su cinetiche di primo ordine modificate dal clima."
              code={CODE_ROTHC} 
            />
          </div>
       </div>
    </div>
  );
};