
import React, { useState } from 'react';
import { 
  Compass, BookOpen, Calendar, Leaf, Activity, Droplet, 
  Download, Info, Menu, X, CloudRain, Code, Sun, Sliders, Zap, Microscope, Sprout,
  GraduationCap, FileCheck, CheckCircle2, Library, Database, GitCompare, Globe
} from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t, language, setLanguage } = useI18n();

  const menuItems = [
    // === INTRODUZIONE ===
    { id: 'overview', label: t.menuItems.overview, icon: Compass },
    { id: 'learning_path', label: t.menuItems.learningPath, icon: GraduationCap },
    { id: 'exercises', label: t.menuItems.exercises, icon: FileCheck },
    { id: 'concepts', label: t.menuItems.concepts, icon: BookOpen },
    
    // === INPUT E FONDAMENTI ===
    { id: 'weather', label: t.menuItems.weatherGenerator, icon: CloudRain },
    { id: 'weather_management', label: t.menuItems.weatherManagement, icon: Database },
    
            // === PROCESSI FISIOLOGICI (Ordine del percorso didattico) ===
            { id: 'crop_comparison', label: t.menuItems.cropComparison, icon: GitCompare },
            { id: 'emergence', label: t.menuItems.emergence, icon: Sprout },
    { id: 'phenology', label: t.menuItems.phenology, icon: Calendar },
    { id: 'lai', label: t.menuItems.lai, icon: Leaf },
    { id: 'biomass', label: t.menuItems.biomass, icon: Activity },
    { id: 'water', label: t.menuItems.water, icon: Droplet },
    { id: 'photosynthesis', label: t.menuItems.photosynthesis, icon: Microscope },
    
    // === ANALISI E VALIDAZIONE ===
    { id: 'scenario', label: t.menuItems.scenario, icon: Sliders },
    { id: 'validation', label: t.menuItems.validation, icon: CheckCircle2 },
    
    // === APPLICAZIONI AVANZATE ===
    { id: 'agrivoltaics', label: t.menuItems.radiationReduction, icon: Sun },
    { id: 'energy_balance', label: t.menuItems.energyBalance, icon: Zap },
    
    // === INFO ===
    { id: 'about', label: t.menuItems.about, icon: Info },
    { id: 'functions', label: t.menuItems.code, icon: Code },
    { id: 'bibliography', label: t.menuItems.bibliography, icon: Library },
    { id: 'export', label: t.menuItems.export, icon: Download },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-brand-700 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <h1 className="font-bold text-lg">{t.app.title}</h1>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'it' | 'en')}
            className="bg-brand-600 text-white text-xs px-2 py-1 rounded border-0 focus:ring-0"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="it">IT</option>
            <option value="en">EN</option>
          </select>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -mr-2 touch-manipulation"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 sm:w-64 bg-slate-900 text-slate-100 transition-transform transform 
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 md:static md:block
        shadow-xl md:shadow-none
      `}>
        <div className="p-4 md:p-6 border-b border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl md:text-2xl font-bold text-brand-500">{t.app.title}</h1>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'it' | 'en')}
              className="bg-slate-800 text-slate-100 text-xs px-2 py-1 rounded border border-slate-600 focus:ring-1 focus:ring-brand-500"
            >
              <option value="it">IT</option>
              <option value="en">EN</option>
            </select>
          </div>
          <p className="text-xs text-slate-400 mt-1">{t.app.subtitle}</p>
        </div>
        <nav className="mt-4 px-2 overflow-y-auto max-h-[calc(100vh-120px)] pb-4">
          {/* INTRODUZIONE */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.menu.introduction}
            </div>
            {menuItems.filter(item => ['overview', 'learning_path', 'exercises', 'concepts'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3.5 mb-1 rounded-lg transition-colors touch-manipulation
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'}
                    min-h-[44px] text-left
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* INPUT E FONDAMENTI */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.menu.inputAndFundamentals}
            </div>
            {menuItems.filter(item => ['weather', 'weather_management'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3.5 mb-1 rounded-lg transition-colors touch-manipulation
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'}
                    min-h-[44px] text-left
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* PROCESSI FISIOLOGICI */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.menu.physiologicalProcesses}
            </div>
            {menuItems.filter(item => ['crop_comparison', 'emergence', 'phenology', 'lai', 'biomass', 'water', 'photosynthesis'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3.5 mb-1 rounded-lg transition-colors touch-manipulation
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'}
                    min-h-[44px] text-left
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* ANALISI E VALIDAZIONE */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.menu.analysisAndValidation}
            </div>
            {menuItems.filter(item => ['scenario', 'validation'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3.5 mb-1 rounded-lg transition-colors touch-manipulation
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'}
                    min-h-[44px] text-left
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* APPLICAZIONI AVANZATE */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.menu.advancedApplications}
            </div>
            {menuItems.filter(item => ['agrivoltaics', 'energy_balance'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3.5 mb-1 rounded-lg transition-colors touch-manipulation
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'}
                    min-h-[44px] text-left
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* INFO */}
          <div className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {t.menu.info}
            </div>
            {menuItems.filter(item => ['about', 'functions', 'bibliography', 'export'].includes(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3.5 mb-1 rounded-lg transition-colors touch-manipulation
                    ${isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'}
                    min-h-[44px] text-left
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="font-medium text-sm md:text-base">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-8 overflow-y-auto min-h-screen md:h-screen">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
