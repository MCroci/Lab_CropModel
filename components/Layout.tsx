
import React, { useState } from 'react';
import { 
  Compass, BookOpen, Calendar, Leaf, Activity, Droplet, 
  Download, Info, Menu, X, CloudRain, Code, Sun, Sliders, Zap, Microscope, Sprout 
} from 'lucide-react';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Panoramica', icon: Compass },
    { id: 'weather', label: 'Generatore Meteo', icon: CloudRain },
    { id: 'concepts', label: 'Concetti Base', icon: BookOpen },
    { id: 'functions', label: 'Logica & Codice', icon: Code },
    { id: 'emergence', label: 'Emergenza Seme', icon: Sprout }, // New Item
    { id: 'phenology', label: 'Fenologia', icon: Calendar },
    { id: 'lai', label: 'LAI & Radiazione', icon: Leaf },
    { id: 'photosynthesis', label: 'Fotosintesi (Farquhar)', icon: Microscope },
    { id: 'biomass', label: 'Biomassa', icon: Activity },
    { id: 'water', label: 'Bilancio Idrico', icon: Droplet },
    { id: 'scenario', label: 'Analisi Scenario', icon: Sliders },
    { id: 'agrivoltaics', label: 'Agrivoltaico (Semplice)', icon: Sun },
    { id: 'energy_balance', label: 'Bilancio Energetico', icon: Zap },
    { id: 'export', label: 'Esporta Dati', icon: Download },
    { id: 'about', label: 'Info & Crediti', icon: Info },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-brand-700 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-bold text-lg">Crop Lab</h1>
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
          <h1 className="text-2xl font-bold text-brand-500">Crop Lab</h1>
          <p className="text-xs text-slate-400 mt-1">Modellistica Agraria Didattica</p>
        </div>
        <nav className="mt-4 px-2">
          {menuItems.map((item) => {
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
