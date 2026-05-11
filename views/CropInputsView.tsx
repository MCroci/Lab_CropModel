import React, { useEffect, useState } from 'react';
import { Card, Select, Slider, Button } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { CropParams } from '../types';
import { Save, FolderOpen, Trash2, CheckCircle, Sprout } from 'lucide-react';
import { useToast } from '../components/Toast';

const CROP_PRESETS: Record<string, Partial<CropParams>> = {
  generica: {
    Tbase: 8, tuHAR: 1400, LAI0: 0.02, LAIMX: 5, ALPHA: 0.02,
    SENRATE: 0.02, frEMR: 0.05, frBLS: 0.65, KPAR: 0.6, RUE: 2.5,
    TBRUE: 8, TP1RUE: 18, TP2RUE: 28, TCRUE: 40, WSSG: 0.25, B0: 0
  },
  mais: {
    Tbase: 10, tuHAR: 1600, LAI0: 0.015, LAIMX: 6, ALPHA: 0.025,
    SENRATE: 0.03, frEMR: 0.05, frBLS: 0.7, KPAR: 0.65, RUE: 3.8,
    TBRUE: 10, TP1RUE: 22, TP2RUE: 32, TCRUE: 45, WSSG: 0.25, B0: 0
  },
  frumento: {
    Tbase: 0, tuHAR: 1900, LAI0: 0.02, LAIMX: 7, ALPHA: 0.015,
    SENRATE: 0.01, frEMR: 0.05, frBLS: 0.6, KPAR: 0.5, RUE: 2.2,
    TBRUE: 0, TP1RUE: 15, TP2RUE: 25, TCRUE: 35, WSSG: 0.25, B0: 0
  },
  pomodoro: {
    Tbase: 12, tuHAR: 1800, LAI0: 0.01, LAIMX: 4, ALPHA: 0.03,
    SENRATE: 0.02, frEMR: 0.05, frBLS: 0.8, KPAR: 0.7, RUE: 2.0,
    TBRUE: 12, TP1RUE: 20, TP2RUE: 30, TCRUE: 42, WSSG: 0.25, B0: 0
  }
};

const PRESET_LABELS: Record<string, string> = {
  generica: 'Coltura Generica',
  mais: 'Mais (C4)',
  frumento: 'Frumento (C3)',
  pomodoro: 'Pomodoro'
};

export const CropInputsView: React.FC = () => {
  const {
    cropParams, setCropParams,
    sowingDays, setSowingDays,
    saveConfiguration,
    getAllSavedConfigurations,
    loadSavedConfiguration,
    deleteSavedConfiguration
  } = useSimulation();

  const { showToast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<string>('generica');
  const [configName, setConfigName] = useState('');
  const [savedConfigs, setSavedConfigs] = useState(getAllSavedConfigurations());
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    const currentPreset = Object.entries(CROP_PRESETS).find(([_, preset]) => {
      return preset.Tbase === cropParams.Tbase &&
             preset.RUE === cropParams.RUE &&
             preset.KPAR === cropParams.KPAR;
    });
    if (currentPreset) setSelectedPreset(currentPreset[0]);
  }, [cropParams]);

  useEffect(() => {
    setSavedConfigs(getAllSavedConfigurations());
  }, [getAllSavedConfigurations]);

  const handlePresetChange = (value: string) => {
    const preset = CROP_PRESETS[value];
    if (!preset) return;
    setSelectedPreset(value);
    setCropParams(prev => ({ ...prev, ...preset }));
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
    } catch {
      showToast('Errore nel salvataggio', 'error');
    }
  };

  const handleLoadConfiguration = (id: string) => {
    if (loadSavedConfiguration(id)) {
      setSavedConfigs(getAllSavedConfigurations());
      showToast('Configurazione caricata con successo!', 'success');
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

  return (
    <div className="space-y-6">
      <Card title="Input Colturali (Preset + Parametri)" className="border-l-4 border-l-green-600">
        <p className="text-sm text-gray-700 mb-4">
          In questa pagina puoi impostare la coltura (preset), la data di semina e modificare tutti i principali parametri fisiologici.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Select
              label="Seleziona Coltura (Preset)"
              value={selectedPreset}
              options={[
                { value: 'generica', label: 'Coltura Generica' },
                { value: 'mais', label: 'Mais (C4)' },
                { value: 'frumento', label: 'Frumento (C3)' },
                { value: 'pomodoro', label: 'Pomodoro' }
              ]}
              onChange={handlePresetChange}
              description="Carica un set tipico di parametri; puoi poi rifinirli manualmente sotto."
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data di Semina/Trapianto - {PRESET_LABELS[selectedPreset] ?? 'Coltura Selezionata'}
              </label>
              <input
                type="number"
                min="1"
                max={365}
                value={sowingDays[selectedPreset] || 1}
                onChange={(e) => {
                  const day = parseInt(e.target.value, 10) || 1;
                  setSowingDays(prev => ({ ...prev, [selectedPreset]: Math.max(1, Math.min(day, 365)) }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            <div className="font-semibold text-green-900 mb-2 flex items-center gap-2">
              <Sprout size={16} />
              Parametri attivi (riepilogo rapido)
            </div>
            <div className="grid grid-cols-2 gap-2 text-green-900/90">
              <div>Tbase: <strong>{cropParams.Tbase}</strong> °C</div>
              <div>tuHAR: <strong>{cropParams.tuHAR}</strong> °C·d</div>
              <div>RUE: <strong>{cropParams.RUE}</strong> g/MJ</div>
              <div>KPAR: <strong>{cropParams.KPAR}</strong></div>
              <div>LAIMX: <strong>{cropParams.LAIMX}</strong></div>
              <div>WSSG: <strong>{cropParams.WSSG}</strong></div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Fenologia e Sviluppo">
          <Slider
            label="Tbase"
            value={cropParams.Tbase}
            min={0}
            max={15}
            step={0.5}
            unit="°C"
            onChange={v => setCropParams(p => ({ ...p, Tbase: v }))}
            description="Temperatura base: sotto questo valore lo sviluppo fenologico (accumulo di unità termiche) è nullo o trascurabile."
            hintMode="tooltip"
          />
          <Slider
            label="tuHAR"
            value={cropParams.tuHAR}
            min={800}
            max={2200}
            step={50}
            unit="°C·d"
            onChange={v => setCropParams(p => ({ ...p, tuHAR: v }))}
            description="Somma termica (unità termiche) richiesta per arrivare alla maturazione/raccolta. Determina la durata del ciclo."
            hintMode="tooltip"
          />
          <Slider
            label="frEMR"
            value={cropParams.frEMR}
            min={0}
            max={0.2}
            step={0.01}
            onChange={v => setCropParams(p => ({ ...p, frEMR: v }))}
            description="Frazione di sviluppo (0–1) a cui inizia l’emergenza/inizio crescita rapida della chioma."
            hintMode="tooltip"
          />
          <Slider
            label="frBLS"
            value={cropParams.frBLS}
            min={0.2}
            max={0.9}
            step={0.01}
            onChange={v => setCropParams(p => ({ ...p, frBLS: v }))}
            description="Frazione di sviluppo (0–1) a cui inizia la senescenza (declino del LAI)."
            hintMode="tooltip"
          />
        </Card>

        <Card title="LAI e Architettura Chioma">
          <Slider
            label="LAI0"
            value={cropParams.LAI0}
            min={0.001}
            max={0.5}
            step={0.005}
            onChange={v => setCropParams(p => ({ ...p, LAI0: v }))}
            description="LAI iniziale: area fogliare per unità di suolo all’inizio della simulazione (post-emergenza)."
            hintMode="tooltip"
          />
          <Slider
            label="LAIMX"
            value={cropParams.LAIMX}
            min={1}
            max={9}
            step={0.1}
            onChange={v => setCropParams(p => ({ ...p, LAIMX: v }))}
            description="LAI massimo raggiungibile in condizioni ottimali. Controlla la copertura e l’intercettazione della radiazione."
            hintMode="tooltip"
          />
          <Slider
            label="ALPHA"
            value={cropParams.ALPHA}
            min={0.001}
            max={0.08}
            step={0.001}
            onChange={v => setCropParams(p => ({ ...p, ALPHA: v }))}
            description="Tasso relativo di espansione fogliare (fase di crescita del LAI). Valori maggiori = chiusura più rapida della chioma."
            hintMode="tooltip"
          />
          <Slider
            label="SENRATE"
            value={cropParams.SENRATE}
            min={0.001}
            max={0.08}
            step={0.001}
            onChange={v => setCropParams(p => ({ ...p, SENRATE: v }))}
            description="Tasso di senescenza fogliare. Valori maggiori = perdita di LAI più rapida nella fase finale."
            hintMode="tooltip"
          />
          <Slider
            label="KPAR"
            value={cropParams.KPAR}
            min={0.2}
            max={1.2}
            step={0.05}
            onChange={v => setCropParams(p => ({ ...p, KPAR: v }))}
            description="Coefficiente di estinzione della radiazione (Beer-Lambert). Valori maggiori = più intercettazione a parità di LAI."
            hintMode="tooltip"
          />
        </Card>

        <Card title="Biomassa e Risposta Termica">
          <Slider
            label="RUE"
            value={cropParams.RUE}
            min={0.5}
            max={5.0}
            step={0.1}
            unit="g/MJ"
            onChange={v => setCropParams(p => ({ ...p, RUE: v }))}
            description="Radiation Use Efficiency: biomassa prodotta per energia PAR intercettata (in condizioni non limitanti)."
            hintMode="tooltip"
          />
          <Slider
            label="TBRUE"
            value={cropParams.TBRUE}
            min={0}
            max={20}
            step={0.5}
            unit="°C"
            onChange={v => setCropParams(p => ({ ...p, TBRUE: v }))}
            description="Temperatura base della funzione termica che modula la RUE (sotto questo valore l’efficienza si riduce fortemente)."
            hintMode="tooltip"
          />
          <Slider
            label="TP1RUE"
            value={cropParams.TP1RUE}
            min={10}
            max={30}
            step={0.5}
            unit="°C"
            onChange={v => setCropParams(p => ({ ...p, TP1RUE: v }))}
            description="Temperatura cardinale inferiore ottimale per la RUE: oltre TP1 l’efficienza aumenta fino all’optimum."
            hintMode="tooltip"
          />
          <Slider
            label="TP2RUE"
            value={cropParams.TP2RUE}
            min={15}
            max={40}
            step={0.5}
            unit="°C"
            onChange={v => setCropParams(p => ({ ...p, TP2RUE: v }))}
            description="Temperatura cardinale superiore ottimale per la RUE: oltre TP2 l’efficienza inizia a diminuire."
            hintMode="tooltip"
          />
          <Slider
            label="TCRUE"
            value={cropParams.TCRUE}
            min={20}
            max={50}
            step={0.5}
            unit="°C"
            onChange={v => setCropParams(p => ({ ...p, TCRUE: v }))}
            description="Temperatura critica/superiore: vicino a TCRUE la RUE tende a zero (stress termico elevato)."
            hintMode="tooltip"
          />
          <Slider
            label="WSSG"
            value={cropParams.WSSG ?? 0.25}
            min={0.1}
            max={0.5}
            step={0.05}
            onChange={v => setCropParams(p => ({ ...p, WSSG: v }))}
            description="Soglia di stress idrico (FTSW) per la crescita: sotto questa frazione di acqua disponibile la crescita viene penalizzata."
            hintMode="tooltip"
          />
          <Slider
            label="B0"
            value={cropParams.B0 ?? 0}
            min={0}
            max={400}
            step={5}
            onChange={v => setCropParams(p => ({ ...p, B0: v }))}
            description="Biomassa iniziale (condizione al tempo 0). Utile per simulare trapianto o una fase già avviata."
            hintMode="tooltip"
          />
        </Card>

        <Card title="Salva / Carica Configurazioni" className="bg-blue-50 border-blue-100">
          <div className="flex gap-2 mb-3">
            <Button onClick={() => setShowSaveDialog(true)} variant="primary" className="flex-1 text-sm">
              <Save size={16} />
              Salva Configurazione
            </Button>
          </div>
          {showSaveDialog && (
            <div className="bg-white border border-gray-300 rounded-lg p-3 mb-3">
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="Nome configurazione..."
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveConfiguration()}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveConfiguration} variant="primary" className="flex-1 text-xs">
                  <CheckCircle size={14} />
                  Salva
                </Button>
                <Button onClick={() => { setShowSaveDialog(false); setConfigName(''); }} variant="outline" className="flex-1 text-xs">
                  Annulla
                </Button>
              </div>
            </div>
          )}
          {savedConfigs.length > 0 && (
            <div className="space-y-1 max-h-56 overflow-y-auto">
              {savedConfigs.map((config) => (
                <div key={config.id} className="flex items-center justify-between bg-white border border-gray-200 rounded px-2 py-1 text-xs">
                  <div className="flex-1">
                    <div className="font-medium text-gray-700">{config.name}</div>
                    <div className="text-gray-500">{new Date(config.timestamp).toLocaleDateString('it-IT')}</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleLoadConfiguration(config.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Carica">
                      <FolderOpen size={14} />
                    </button>
                    <button onClick={() => handleDeleteConfiguration(config.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Elimina">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

