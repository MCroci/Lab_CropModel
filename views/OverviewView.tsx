import React, { useState, useEffect } from 'react';
import { Card, Select, Button, LoadingSpinner } from '../components/UI';
import { useSimulation } from '../context/SimulationContext';
import { CropParams } from '../types';
import { GitCompare, Save, FolderOpen, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useI18n } from '../i18n/I18nContext';

// Preset Data - Completi con tutti i parametri necessari
const CROP_PRESETS: Record<string, Partial<CropParams>> = {
  'generica': {
    Tbase: 8, tuHAR: 1400, LAI0: 0.02, LAIMX: 5, ALPHA: 0.02, 
    SENRATE: 0.02, frEMR: 0.05, frBLS: 0.65, KPAR: 0.6, RUE: 2.5,
    TBRUE: 8, TP1RUE: 18, TP2RUE: 28, TCRUE: 40, B0: 0
  },
  'mais': {
    Tbase: 10, tuHAR: 1600, LAI0: 0.015, LAIMX: 6, ALPHA: 0.025, 
    SENRATE: 0.03, frEMR: 0.05, frBLS: 0.7, KPAR: 0.65, RUE: 3.8,
    // Mais (C4): ottimo termico più alto, range più ampio
    TBRUE: 10, TP1RUE: 22, TP2RUE: 32, TCRUE: 45, B0: 0
  },
  'frumento': {
    Tbase: 0, tuHAR: 1900, LAI0: 0.02, LAIMX: 7, ALPHA: 0.015, 
    SENRATE: 0.01, frEMR: 0.05, frBLS: 0.6, KPAR: 0.5, RUE: 2.2,
    // Frumento (C3): ottimo termico più basso, range più stretto
    TBRUE: 0, TP1RUE: 15, TP2RUE: 25, TCRUE: 35, B0: 0
  },
  'pomodoro': {
    Tbase: 12, tuHAR: 1800, LAI0: 0.01, LAIMX: 4, ALPHA: 0.03, 
    SENRATE: 0.02, frEMR: 0.05, frBLS: 0.8, KPAR: 0.7, RUE: 2.0,
    // Pomodoro: pianta termofila, ottimo termico intermedio
    TBRUE: 12, TP1RUE: 20, TP2RUE: 30, TCRUE: 42, B0: 0
  }
};

export const OverviewView: React.FC = () => {
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
  const { t, language } = useI18n();
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
      showToast(t.overview.enterConfigName, 'error');
      return;
    }
    try {
      saveConfiguration(configName);
      setSavedConfigs(getAllSavedConfigurations());
      setConfigName('');
      setShowSaveDialog(false);
      showToast(t.toast.configSaved, 'success');
    } catch (error) {
      showToast(t.toast.errorSaving, 'error');
    }
  };

  const handleLoadConfiguration = (id: string) => {
    if (loadSavedConfiguration(id)) {
      showToast(t.toast.configLoaded, 'success');
      setSavedConfigs(getAllSavedConfigurations());
    } else {
      showToast(t.toast.errorLoading, 'error');
    }
  };

  const handleDeleteConfiguration = (id: string) => {
    if (deleteSavedConfiguration(id)) {
      setSavedConfigs(getAllSavedConfigurations());
      showToast(t.toast.configDeleted, 'success');
    } else {
      showToast(t.toast.errorDeleting, 'error');
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
          <span className="text-sm text-blue-800">{t.overview.simulating}</span>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <div className="lg:col-span-2">
        <Card title={t.overview.learningObjectives} className="h-full">
          <p className="text-gray-600 mb-4">
            {t.overview.title === 'Overview' ? 'This application is designed for educational exercises on herbaceous crop modeling.' : 'Questa applicazione è progettata per esercizi didattici sulla modellazione delle colture erbacee.'}
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-2">
            {t.overview.objectives.map((obj, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: obj }} />
            ))}
          </ul>
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>{t.common.warning}:</strong> {t.overview.note}
            </p>
          </div>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card title={t.overview.quickConfig} className="h-full bg-blue-50 border-blue-100">
          <div className="mb-6">
            <Select 
              label={t.overview.selectCrop}
              value={selectedPreset}
              options={[
                { value: 'generica', label: language === 'it' ? 'Coltura Generica' : 'Generic Crop' },
                { value: 'mais', label: 'Mais (C4)' },
                { value: 'frumento', label: 'Frumento (C3)' },
                { value: 'pomodoro', label: language === 'it' ? 'Pomodoro' : 'Tomato' },
              ]}
              onChange={handlePresetChange}
              description={language === 'it' ? "Carica automaticamente un set di parametri fisiologici tipici per la coltura selezionata. I parametri includono fenologia, LAI, RUE e risposta alla temperatura." : "Automatically loads a set of typical physiological parameters for the selected crop. Parameters include phenology, LAI, RUE and temperature response."}
            />

            {/* Data di Semina/Trapianto per la coltura selezionata */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.overview.sowingDate} - {CROP_PRESETS[selectedPreset] ? (language === 'it' ? ['Coltura Generica', 'Mais (C4)', 'Frumento (C3)', 'Pomodoro'] : ['Generic Crop', 'Maize (C4)', 'Wheat (C3)', 'Tomato'])[['generica', 'mais', 'frumento', 'pomodoro'].indexOf(selectedPreset)] : (language === 'it' ? 'Coltura Selezionata' : 'Selected Crop')}
              </label>
              <input
                type="number"
                min="1"
                max={365}
                value={sowingDays[selectedPreset] || 1}
                onChange={(e) => {
                  const day = parseInt(e.target.value) || 1;
                  setSowingDays(prev => ({
                    ...prev,
                    [selectedPreset]: Math.max(1, Math.min(day, 365))
                  }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t.overview.day} {sowingDays[selectedPreset] || 1} {t.overview.of} 365 {t.overview.available}. {t.overview.simulationAlways365}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setSowingDays(prev => ({ ...prev, [selectedPreset]: 1 }))}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  {t.overview.day1}
                </button>
                <button
                  onClick={() => setSowingDays(prev => ({ ...prev, [selectedPreset]: Math.floor(365 * 0.1) }))}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  {t.overview.season10}
                </button>
                <button
                  onClick={() => setSowingDays(prev => ({ ...prev, [selectedPreset]: Math.floor(365 * 0.3) }))}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  {t.overview.season30}
                </button>
              </div>
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <strong>{t.common.warning}:</strong> {t.overview.sowingDateNote}
              </div>
            </div>
            
            {/* Riepilogo Parametri Chiave */}
            {selectedPreset && CROP_PRESETS[selectedPreset] && (
              <div className="mt-4 bg-white border border-gray-200 rounded-lg p-3 text-xs">
                <div className="font-semibold text-gray-900 mb-2">{t.overview.activeParams}</div>
                <div className="grid grid-cols-2 gap-2 text-gray-700">
                  <div>
                    <span className="font-medium">RUE:</span> {CROP_PRESETS[selectedPreset].RUE} g/MJ
                  </div>
                  <div>
                    <span className="font-medium">KPAR:</span> {CROP_PRESETS[selectedPreset].KPAR}
                  </div>
                  <div>
                    <span className="font-medium">Tbase:</span> {CROP_PRESETS[selectedPreset].Tbase}°C
                  </div>
                  <div>
                    <span className="font-medium">tuHAR:</span> {CROP_PRESETS[selectedPreset].tuHAR}°C·d
                  </div>
                  <div>
                    <span className="font-medium">LAIMX:</span> {CROP_PRESETS[selectedPreset].LAIMX}
                  </div>
                  <div>
                    <span className="font-medium">TP1RUE:</span> {CROP_PRESETS[selectedPreset].TP1RUE}°C
                  </div>
                </div>
                {selectedPreset === 'mais' && (
                  <div className="mt-2 text-green-700 font-medium">
                    ✓ Mais (C4): Alta RUE, ottimo termico elevato
                  </div>
                )}
                {selectedPreset === 'frumento' && (
                  <div className="mt-2 text-blue-700 font-medium">
                    ✓ Frumento (C3): RUE moderata, ottimo termico basso
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">{t.overview.quickGuide}</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              {t.overview.quickGuideSteps.map((step, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: step }} />
              ))}
            </ol>
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-xs font-semibold text-purple-900 mb-1">{t.overview.compareCrops}</p>
              <p className="text-xs text-purple-700">
                {t.overview.compareCropsDesc}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-blue-200 mt-4">
            <div className="flex gap-2 mb-3">
              <Button 
                onClick={() => setShowSaveDialog(true)} 
                variant="primary" 
                className="flex-1 text-sm"
              >
                <Save size={16} />
                {t.overview.saveConfig}
              </Button>
            </div>
            {showSaveDialog && (
              <div className="bg-white border border-gray-300 rounded-lg p-3 mb-3">
                <input
                  type="text"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder={t.overview.configName}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveConfiguration()}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveConfiguration} variant="primary" className="flex-1 text-xs">
                    <CheckCircle size={14} />
                    {t.common.save}
                  </Button>
                  <Button onClick={() => { setShowSaveDialog(false); setConfigName(''); }} variant="outline" className="flex-1 text-xs">
                    {t.common.cancel}
                  </Button>
                </div>
              </div>
            )}
            {savedConfigs.length > 0 && (
              <div className="mt-3">
                <h5 className="text-xs font-semibold text-blue-900 mb-2">{t.overview.savedConfigs}</h5>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {savedConfigs.map((config) => (
                    <div key={config.id} className="flex items-center justify-between bg-white border border-gray-200 rounded px-2 py-1 text-xs">
                      <div className="flex-1">
                        <div className="font-medium text-gray-700">{config.name}</div>
                        <div className="text-gray-500 text-xs">
                          {new Date(config.timestamp).toLocaleDateString(language === 'it' ? 'it-IT' : 'en-US')}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLoadConfiguration(config.id)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title={t.common.load}
                        >
                          <FolderOpen size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteConfiguration(config.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title={t.common.delete}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
      </div>
    </div>
  );
};