import React, { useState, useEffect } from 'react';
import { Card, Select, Button, LoadingSpinner } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { CropParams } from '../types';
import { GitCompare, Save, FolderOpen, Trash2, CheckCircle, BookOpen, Leaf, Activity, Droplet, Code, Library, Calendar, Layers, LineChart } from 'lucide-react';
import { useToast } from '../components/Toast';

// Preset Data - Completi con tutti i parametri necessari
const CROP_PRESETS: Record<string, Partial<CropParams>> = {
  'generica': {
    Tbase: 8, tuHAR: 1400, LAI0: 0.02, LAIMX: 5, ALPHA: 0.02,
    SENRATE: 0.02, frEMR: 0.05, frBLS: 0.65, KPAR: 0.6, RUE: 2.5,
    TBRUE: 8, TP1RUE: 18, TP2RUE: 28, TCRUE: 40, WSSG: 0.25, B0: 0
  },
  'mais': {
    Tbase: 10, tuHAR: 1600, LAI0: 0.015, LAIMX: 6, ALPHA: 0.025,
    SENRATE: 0.03, frEMR: 0.05, frBLS: 0.7, KPAR: 0.65, RUE: 3.8,
    TBRUE: 10, TP1RUE: 22, TP2RUE: 32, TCRUE: 45, WSSG: 0.25, B0: 0
  },
  'frumento': {
    Tbase: 0, tuHAR: 1900, LAI0: 0.02, LAIMX: 7, ALPHA: 0.015,
    SENRATE: 0.01, frEMR: 0.05, frBLS: 0.6, KPAR: 0.5, RUE: 2.2,
    TBRUE: 0, TP1RUE: 15, TP2RUE: 25, TCRUE: 35, WSSG: 0.25, B0: 0
  },
  'pomodoro': {
    Tbase: 12, tuHAR: 1800, LAI0: 0.01, LAIMX: 4, ALPHA: 0.03,
    SENRATE: 0.02, frEMR: 0.05, frBLS: 0.8, KPAR: 0.7, RUE: 2.0,
    TBRUE: 12, TP1RUE: 20, TP2RUE: 30, TCRUE: 42, WSSG: 0.25, B0: 0
  }
};

interface OverviewViewProps {
  onNavigate?: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const { 
    cropParams, setCropParams, 
    sowingDays, setSowingDays, 
    weatherParams,
    saveConfiguration,
    getAllSavedConfigurations,
    loadSavedConfiguration,
    deleteSavedConfiguration,
    isSimulating
  } = useSimulation();
  const { showToast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<string>('generica');
  const [configName, setConfigName] = useState('');
  const [savedConfigs, setSavedConfigs] = useState(getAllSavedConfigurations());
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Rileva quale preset corrisponde ai parametri attuali (per mostrarlo nel Select)
  useEffect(() => {
    const currentPreset = Object.entries(CROP_PRESETS).find(([_, preset]) => {
      return preset.Tbase === cropParams.Tbase && 
             preset.RUE === cropParams.RUE &&
             preset.KPAR === cropParams.KPAR;
    });
    if (currentPreset) {
      setSelectedPreset(currentPreset[0]);
    }
  }, [cropParams]);

  const handlePresetChange = (value: string) => {
    const preset = CROP_PRESETS[value];
    if (preset) {
      setSelectedPreset(value);
      setCropParams(prev => ({
        ...prev,
        ...preset
      }));
    }
  };

  const handleSaveConfiguration = () => {
    if (!configName.trim()) {
      showToast('Inserisci un nome per la configurazione', 'error');
      return;
    }
    try {
      saveConfiguration(configName);
      setSavedConfigs(getAllSavedConfigurations());
      setConfigName('');
      setShowSaveDialog(false);
      showToast('Configurazione salvata con successo!', 'success');
    } catch (error) {
      showToast('Errore nel salvataggio', 'error');
    }
  };

  const handleLoadConfiguration = (id: string) => {
    if (loadSavedConfiguration(id)) {
      showToast('Configurazione caricata con successo!', 'success');
      setSavedConfigs(getAllSavedConfigurations());
    } else {
      showToast('Errore nel caricamento', 'error');
    }
  };

  const handleDeleteConfiguration = (id: string) => {
    if (deleteSavedConfiguration(id)) {
      setSavedConfigs(getAllSavedConfigurations());
      showToast('Configurazione eliminata', 'success');
    } else {
      showToast('Errore nell\'eliminazione', 'error');
    }
  };

  useEffect(() => {
    setSavedConfigs(getAllSavedConfigurations());
  }, []);

  return (
    <div className="space-y-6">
      {isSimulating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
          <LoadingSpinner size="sm" />
          <span className="text-sm text-blue-800">Simulazione in corso...</span>
        </div>
      )}

      {/* Guida ai nuovi concetti teorici */}
      <Card title="Nuovi concetti teorici" className="border-l-4 border-l-cyan-500 bg-cyan-50/30">
        <p className="text-gray-700 mb-4">
          Sono stati aggiunti nuovi concetti ed equazioni in diverse sezioni. Clicca sui link per esplorarli:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {onNavigate ? (
            <>
              <button onClick={() => onNavigate('concepts')} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-cyan-200 hover:bg-cyan-50 text-left transition-colors">
                <BookOpen size={18} className="text-cyan-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Concetti Base</div>
                  <div className="text-xs text-gray-600">Expolinear, Bilancio di Massa</div>
                </div>
              </button>
              <button onClick={() => onNavigate('response_functions')} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-cyan-200 hover:bg-cyan-50 text-left transition-colors">
                <LineChart size={18} className="text-cyan-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Funzioni di Risposta</div>
                  <div className="text-xs text-gray-600">tempfun, FTSW, Beer-Lambert, SCS</div>
                </div>
              </button>
              <button onClick={() => onNavigate('phenology')} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-cyan-200 hover:bg-cyan-50 text-left transition-colors">
                <Calendar size={18} className="text-cyan-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Fenologia</div>
                  <div className="text-xs text-gray-600">Fillocrono (PHYL, INODE)</div>
                </div>
              </button>
              <button onClick={() => onNavigate('lai')} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-cyan-200 hover:bg-cyan-50 text-left transition-colors">
                <Leaf size={18} className="text-cyan-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">LAI & Radiazione</div>
                  <div className="text-xs text-gray-600">SLA, modello allometrico PLA</div>
                </div>
              </button>
              <button onClick={() => onNavigate('biomass')} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-cyan-200 hover:bg-cyan-50 text-left transition-colors">
                <Activity size={18} className="text-cyan-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Biomassa</div>
                  <div className="text-xs text-gray-600">Effetto CO₂ sulla RUE</div>
                </div>
              </button>
              <button onClick={() => onNavigate('water')} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-cyan-200 hover:bg-cyan-50 text-left transition-colors">
                <Droplet size={18} className="text-cyan-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Bilancio Idrico</div>
                  <div className="text-xs text-gray-600">FTSW (frazione acqua transpirabile)</div>
                </div>
              </button>
              <button onClick={() => onNavigate('soil')} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-cyan-200 hover:bg-cyan-50 text-left transition-colors">
                <Layers size={18} className="text-cyan-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Suolo e Aggregati</div>
                  <div className="text-xs text-gray-600">Porosità, box counting, capillari</div>
                </div>
              </button>
              <button onClick={() => onNavigate('functions')} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-cyan-200 hover:bg-cyan-50 text-left transition-colors">
                <Code size={18} className="text-cyan-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Logica & Codice</div>
                  <div className="text-xs text-gray-600">Funzione Expolinear</div>
                </div>
              </button>
              <button onClick={() => onNavigate('bibliography')} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-cyan-200 hover:bg-cyan-50 text-left transition-colors">
                <Library size={18} className="text-cyan-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Bibliografia</div>
                  <div className="text-xs text-gray-600">Goudriaan & Monteith, Arnold</div>
                </div>
              </button>
              <button onClick={() => onNavigate('manuale')} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-cyan-200 hover:bg-cyan-50 text-left transition-colors">
                <BookOpen size={18} className="text-cyan-600 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-gray-900">Manuale Teoria</div>
                  <div className="text-xs text-gray-600">Documento completo con tutte le equazioni</div>
                </div>
              </button>
            </>
          ) : (
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              <li>Concetti Base: Expolinear, Bilancio di Massa</li>
              <li>Fenologia: Fillocrono (PHYL, INODE)</li>
              <li>LAI & Radiazione: SLA, modello allometrico PLA</li>
              <li>Biomassa: Effetto CO₂ sulla RUE</li>
              <li>Bilancio Idrico: FTSW</li>
              <li>Suolo e Aggregati: Porosità, box counting, capillari</li>
              <li>Logica & Codice: Funzione Expolinear</li>
              <li>Bibliografia: Goudriaan & Monteith, Arnold</li>
              <li>Manuale Teoria: documento completo con tutte le equazioni</li>
            </ul>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2">
        <Card title="Obiettivi di Apprendimento" className="h-full">
          <p className="text-gray-600 mb-4">
            Questa applicazione è progettata per esercizi didattici sulla modellazione delle colture erbacee.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            <li>Distinguere tra <span className="font-semibold text-brand-600">variabili di stato</span>, <span className="font-semibold text-brand-600">variabili di flusso</span>, parametri e variabili forzanti.</li>
            <li>Comprendere il ciclo giornaliero: Meteo → Fenologia → LAI → Intercettazione → Biomassa.</li>
            <li>Introduzione all'accoppiamento con il bilancio idrico del suolo e gli indici di stress.</li>
            <li>Visualizzare l'impatto dei parametri fisiologici (es. RUE, KPAR) sulla produttività.</li>
          </ul>
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Il modello implementato qui è semplificato a scopi didattici. Si concentra sui principi fisici fondamentali (Radiazione, Temperatura, Acqua) tralasciando aspetti complessi come i nutrienti o i parassiti.
            </p>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card title="Configurazione Rapida" className="h-full bg-blue-50 border-blue-100">
          <p className="text-sm text-blue-900 mb-3">
            Gli <strong>input colturali</strong> (preset, data di semina e parametri) sono stati spostati nella pagina dedicata
            <strong> Input Colturali</strong>, per tenere la Panoramica più pulita.
          </p>
          <div className="space-y-2 text-sm text-blue-800 mb-4">
            <p>Da lì puoi modificare direttamente fenologia, LAI, RUE, risposta termica e soglia di stress idrico.</p>
            <p>In Panoramica trovi solo il quadro generale e i collegamenti rapidi alle sezioni del modello.</p>
          </div>
          {onNavigate && (
            <Button onClick={() => onNavigate('crop_inputs')} variant="primary" className="w-full">
              Apri Input Colturali
            </Button>
          )}
        </Card>
      </div>
      </div>
    </div>
  );
};