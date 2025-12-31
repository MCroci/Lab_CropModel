import { DailyWeather } from '../types';

export interface WeatherFilter {
  minTemp?: number;
  maxTemp?: number;
  minRain?: number;
  maxRain?: number;
  minSrad?: number;
  maxSrad?: number;
  startDay?: number;
  endDay?: number;
}

export interface ConsistencyCheck {
  check: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  affectedDays?: number[];
}

export interface WeatherStatistics {
  meanTemp: number;
  minTemp: number;
  maxTemp: number;
  meanRain: number;
  totalRain: number;
  meanSrad: number;
  minSrad: number;
  maxSrad: number;
  rainyDays: number;
  dryDays: number;
  extremeTempDays: number;
}

// Filtra i dati meteo
export const filterWeatherData = (data: DailyWeather[], filters: WeatherFilter): DailyWeather[] => {
  return data.filter(day => {
    const tavg = (day.TMIN + day.TMAX) / 2;
    
    if (filters.minTemp !== undefined && tavg < filters.minTemp) return false;
    if (filters.maxTemp !== undefined && tavg > filters.maxTemp) return false;
    if (filters.minRain !== undefined && day.RAIN < filters.minRain) return false;
    if (filters.maxRain !== undefined && day.RAIN > filters.maxRain) return false;
    if (filters.minSrad !== undefined && day.SRAD < filters.minSrad) return false;
    if (filters.maxSrad !== undefined && day.SRAD > filters.maxSrad) return false;
    if (filters.startDay !== undefined && day.day < filters.startDay) return false;
    if (filters.endDay !== undefined && day.day > filters.endDay) return false;
    
    return true;
  });
};

// Controlli di consistenza
export const checkWeatherConsistency = (data: DailyWeather[]): ConsistencyCheck[] => {
  const checks: ConsistencyCheck[] = [];
  const affectedDays: number[] = [];

  // 1. TMIN > TMAX
  const tempInversion = data.filter(d => d.TMIN > d.TMAX);
  if (tempInversion.length > 0) {
    checks.push({
      check: 'Inversione Temperatura',
      passed: false,
      message: `${tempInversion.length} giorni con TMIN > TMAX`,
      severity: 'error',
      affectedDays: tempInversion.map(d => d.day)
    });
  } else {
    checks.push({
      check: 'Inversione Temperatura',
      passed: true,
      message: 'Nessuna inversione temperatura rilevata',
      severity: 'info'
    });
  }

  // 2. Temperature estreme
  const extremeTemp = data.filter(d => d.TMAX > 45 || d.TMIN < -20);
  if (extremeTemp.length > 0) {
    checks.push({
      check: 'Temperature Estreme',
      passed: false,
      message: `${extremeTemp.length} giorni con temperature estreme (TMAX > 45°C o TMIN < -20°C)`,
      severity: 'warning',
      affectedDays: extremeTemp.map(d => d.day)
    });
  } else {
    checks.push({
      check: 'Temperature Estreme',
      passed: true,
      message: 'Nessuna temperatura estrema rilevata',
      severity: 'info'
    });
  }

  // 3. Radiazione negativa
  const negativeSrad = data.filter(d => d.SRAD < 0);
  if (negativeSrad.length > 0) {
    checks.push({
      check: 'Radiazione Negativa',
      passed: false,
      message: `${negativeSrad.length} giorni con radiazione negativa`,
      severity: 'error',
      affectedDays: negativeSrad.map(d => d.day)
    });
  } else {
    checks.push({
      check: 'Radiazione Negativa',
      passed: true,
      message: 'Nessuna radiazione negativa rilevata',
      severity: 'info'
    });
  }

  // 4. Pioggia negativa
  const negativeRain = data.filter(d => d.RAIN < 0);
  if (negativeRain.length > 0) {
    checks.push({
      check: 'Pioggia Negativa',
      passed: false,
      message: `${negativeRain.length} giorni con pioggia negativa`,
      severity: 'error',
      affectedDays: negativeRain.map(d => d.day)
    });
  } else {
    checks.push({
      check: 'Pioggia Negativa',
      passed: true,
      message: 'Nessuna pioggia negativa rilevata',
      severity: 'info'
    });
  }

  // 5. Valori mancanti o NaN
  const missingValues = data.filter(d => 
    isNaN(d.TMIN) || isNaN(d.TMAX) || isNaN(d.RAIN) || isNaN(d.SRAD) ||
    d.TMIN === null || d.TMAX === null || d.RAIN === null || d.SRAD === null
  );
  if (missingValues.length > 0) {
    checks.push({
      check: 'Valori Mancanti',
      passed: false,
      message: `${missingValues.length} giorni con valori mancanti o non validi`,
      severity: 'error',
      affectedDays: missingValues.map(d => d.day)
    });
  } else {
    checks.push({
      check: 'Valori Mancanti',
      passed: true,
      message: 'Nessun valore mancante rilevato',
      severity: 'info'
    });
  }

  // 6. Escursione termica eccessiva
  const highRange = data.filter(d => (d.TMAX - d.TMIN) > 30);
  if (highRange.length > 0) {
    checks.push({
      check: 'Escursione Termica',
      passed: false,
      message: `${highRange.length} giorni con escursione termica > 30°C`,
      severity: 'warning',
      affectedDays: highRange.map(d => d.day)
    });
  } else {
    checks.push({
      check: 'Escursione Termica',
      passed: true,
      message: 'Escursione termica nei range normali',
      severity: 'info'
    });
  }

  // 7. Pioggia eccessiva (outlier)
  const meanRain = data.reduce((sum, d) => sum + d.RAIN, 0) / data.length;
  const stdRain = Math.sqrt(
    data.reduce((sum, d) => sum + Math.pow(d.RAIN - meanRain, 2), 0) / data.length
  );
  const extremeRain = data.filter(d => d.RAIN > meanRain + 3 * stdRain);
  if (extremeRain.length > 0) {
    checks.push({
      check: 'Pioggia Estrema',
      passed: false,
      message: `${extremeRain.length} giorni con pioggia estrema (>3σ dalla media)`,
      severity: 'warning',
      affectedDays: extremeRain.map(d => d.day)
    });
  } else {
    checks.push({
      check: 'Pioggia Estrema',
      passed: true,
      message: 'Nessun evento di pioggia estrema rilevato',
      severity: 'info'
    });
  }

  // 8. Radiazione fuori range
  const extremeSrad = data.filter(d => d.SRAD > 40 || d.SRAD < 0);
  if (extremeSrad.length > 0) {
    checks.push({
      check: 'Radiazione Fuori Range',
      passed: false,
      message: `${extremeSrad.length} giorni con radiazione fuori range normale (0-40 MJ/m²)`,
      severity: 'warning',
      affectedDays: extremeSrad.map(d => d.day)
    });
  } else {
    checks.push({
      check: 'Radiazione Fuori Range',
      passed: true,
      message: 'Radiazione nei range normali',
      severity: 'info'
    });
  }

  return checks;
};

// Calcola statistiche
export const calculateWeatherStatistics = (data: DailyWeather[]): WeatherStatistics => {
  if (data.length === 0) {
    return {
      meanTemp: 0,
      minTemp: 0,
      maxTemp: 0,
      meanRain: 0,
      totalRain: 0,
      meanSrad: 0,
      minSrad: 0,
      maxSrad: 0,
      rainyDays: 0,
      dryDays: 0,
      extremeTempDays: 0
    };
  }

  const temps = data.map(d => (d.TMIN + d.TMAX) / 2);
  const rains = data.map(d => d.RAIN);
  const srads = data.map(d => d.SRAD);

  return {
    meanTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
    minTemp: Math.min(...data.map(d => d.TMIN)),
    maxTemp: Math.max(...data.map(d => d.TMAX)),
    meanRain: rains.reduce((a, b) => a + b, 0) / rains.length,
    totalRain: rains.reduce((a, b) => a + b, 0),
    meanSrad: srads.reduce((a, b) => a + b, 0) / srads.length,
    minSrad: Math.min(...srads),
    maxSrad: Math.max(...srads),
    rainyDays: data.filter(d => d.RAIN > 0.1).length,
    dryDays: data.filter(d => d.RAIN <= 0.1).length,
    extremeTempDays: data.filter(d => d.TMAX > 35 || d.TMIN < 0).length
  };
};

// Correggi valori anomali
export const correctAnomalies = (data: DailyWeather[], checks: ConsistencyCheck[]): DailyWeather[] => {
  let corrected = [...data];

  checks.forEach(check => {
    if (!check.passed && check.affectedDays) {
      check.affectedDays.forEach(dayNum => {
        const index = corrected.findIndex(d => d.day === dayNum);
        if (index === -1) return;

        const day = corrected[index];

        // Correzione inversione temperatura
        if (check.check === 'Inversione Temperatura' && day.TMIN > day.TMAX) {
          const temp = day.TMIN;
          corrected[index] = { ...day, TMIN: day.TMAX, TMAX: temp };
        }

        // Correzione radiazione negativa
        if (check.check === 'Radiazione Negativa' && day.SRAD < 0) {
          corrected[index] = { ...day, SRAD: 0 };
        }

        // Correzione pioggia negativa
        if (check.check === 'Pioggia Negativa' && day.RAIN < 0) {
          corrected[index] = { ...day, RAIN: 0 };
        }
      });
    }
  });

  return corrected;
};

