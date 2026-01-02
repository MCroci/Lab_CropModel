
import React, { useState } from 'react';
import { 
  Compass, BookOpen, Calendar, Leaf, Activity, Droplet, 
  Download, Info, Menu, X, CloudRain, Code, Sun, Sliders, Zap, Microscope, Sprout,
  GraduationCap, FileCheck, CheckCircle2, Library, Database, GitCompare
} from 'lucide-react';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    // === INTRODUZIONE ===
    { id: 'overview', label: 'Panoramica', icon: Compass },
    { id: 'learning_path', label: 'Percorso Didattico', icon: GraduationCap },
    { id: 'exercises', label: 'Esercizi', icon: FileCheck },
    { id: 'concepts', label: 'Concetti Base', icon: BookOpen },
    
    // === INPUT E FONDAMENTI ===
    { id: 'weather', label: 'Generatore Meteo', icon: CloudRain },
    { id: 'weather_management', label: 'Gestione Dati Meteo', icon: Database },
    
            // === PROCESSI FISIOLOGICI (Ordine del percorso didattico) ===
            { id: 'crop_comparison', label: 'Confronto Colture', icon: GitCompare },
            { id: 'emergence', label: 'Emergenza Seme', icon: Sprout },
    { id: 'phenology', label: 'Fenologia', icon: Calendar },
    { id: 'lai', label: 'LAI & Radiazione', icon: Leaf },
    { id: 'biomass', label: 'Biomassa', icon: Activity },
    { id: 'water', label: 'Bilancio Idrico', icon: Droplet },
    { id: 'photosynthesis', label: 'Fotosintesi (Farquhar)', icon: Microscope },
    
    // === ANALISI E VALIDAZIONE ===
    { id: 'scenario', label: 'Analisi Scenario', icon: Sliders },
    { id: 'validation', label: 'Validazione', icon: CheckCircle2 },
    
    // === APPLICAZIONI AVANZATE ===
    { id: 'agrivoltaics', label: 'Riduzione Radiazione', icon: Sun },
    { id: 'energy_balance', label: 'Bilancio Energetico', icon: Zap },
    
    // === INFO ===
    { id: 'about', label: 'Info & Crediti', icon: Info },
    { id: 'functions', label: 'Logica & Codice', icon: Code },
    { id: 'bibliography', label: 'Bibliografia', icon: Library },
    { id: 'export', label: 'Esportazione Dati', icon: Download },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-brand-700 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-bold text-lg">Crop mod lab</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 transition-transform transform 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:block
      `}>
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-brand-500">Crop mod lab</h1>
          <p className="text-xs text-slate-400 mt-1">Modellistica delle colture erbacee</p>
        </div>
        <nav className="mt-4 px-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          {/* INTRODUZIONE */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Introduzione
            </div>
            {menuItems.filter(item => ['overview', 'learning_path', 'exercises', 'concepts'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-colors
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* INPUT E FONDAMENTI */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Input e Fondamenti
            </div>
            {menuItems.filter(item => ['weather', 'weather_management'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-colors
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* PROCESSI FISIOLOGICI */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Processi Fisiologici
            </div>
            {menuItems.filter(item => ['crop_comparison', 'emergence', 'phenology', 'lai', 'biomass', 'water', 'photosynthesis'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-colors
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* ANALISI E VALIDAZIONE */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Analisi e Validazione
            </div>
            {menuItems.filter(item => ['scenario', 'validation'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-colors
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* APPLICAZIONI AVANZATE */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Applicazioni Avanzate
            </div>
            {menuItems.filter(item => ['agrivoltaics', 'energy_balance'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-colors
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* INFO */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Info
            </div>
            {menuItems.filter(item => ['about', 'functions', 'bibliography', 'export'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg transition-colors
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
