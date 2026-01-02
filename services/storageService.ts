// Service per gestire il salvataggio e caricamento delle configurazioni

export interface SavedConfiguration {
  id: string;
  name: string;
  timestamp: number;
  weatherParams: any;
  cropParams: any;
  soilParams: any;
  carbonParams: any;
  sowingDays: Record<string, number>;
}

const STORAGE_KEY = 'cropModel_configurations';
const CURRENT_CONFIG_KEY = 'cropModel_current';

// Salva la configurazione corrente
export const saveCurrentConfiguration = (
  weatherParams: any,
  cropParams: any,
  soilParams: any,
  carbonParams: any,
  sowingDays: Record<string, number>
) => {
  try {
    const config = {
      weatherParams,
      cropParams,
      soilParams,
      carbonParams,
      sowingDays,
      timestamp: Date.now()
    };
    localStorage.setItem(CURRENT_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Errore nel salvataggio configurazione:', error);
  }
};

// Carica la configurazione corrente
export const loadCurrentConfiguration = (): Partial<SavedConfiguration> | null => {
  try {
    const stored = localStorage.getItem(CURRENT_CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Errore nel caricamento configurazione:', error);
  }
  return null;
};

// Salva una configurazione con nome
export const saveNamedConfiguration = (
  name: string,
  weatherParams: any,
  cropParams: any,
  soilParams: any,
  carbonParams: any,
  sowingDays: Record<string, number>
): string => {
  try {
    const configs = getAllSavedConfigurations();
    const newConfig: SavedConfiguration = {
      id: Math.random().toString(36).substring(7),
      name,
      timestamp: Date.now(),
      weatherParams,
      cropParams,
      soilParams,
      carbonParams,
      sowingDays
    };
    configs.push(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    return newConfig.id;
  } catch (error) {
    console.error('Errore nel salvataggio configurazione con nome:', error);
    throw error;
  }
};

// Ottieni tutte le configurazioni salvate
export const getAllSavedConfigurations = (): SavedConfiguration[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Errore nel caricamento configurazioni:', error);
  }
  return [];
};

// Carica una configurazione specifica
export const loadConfiguration = (id: string): SavedConfiguration | null => {
  try {
    const configs = getAllSavedConfigurations();
    const config = configs.find(c => c.id === id);
    return config || null;
  } catch (error) {
    console.error('Errore nel caricamento configurazione:', error);
    return null;
  }
};

// Elimina una configurazione
export const deleteConfiguration = (id: string): boolean => {
  try {
    const configs = getAllSavedConfigurations();
    const filtered = configs.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Errore nell\'eliminazione configurazione:', error);
    return false;
  }
};

// Elimina tutte le configurazioni
export const clearAllConfigurations = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_CONFIG_KEY);
  } catch (error) {
    console.error('Errore nella pulizia configurazioni:', error);
  }
};

