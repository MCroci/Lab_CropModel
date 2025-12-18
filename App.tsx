
import React, { useState } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { Layout } from './components/Layout';
import { OverviewView } from './views/OverviewView';
import { ConceptsView } from './views/ConceptsView';
import { PhenologyView } from './views/PhenologyView';
import { LaiView } from './views/LaiView';
import { BiomassView } from './views/BiomassView';
import { WaterView } from './views/WaterView';
import { ExportView } from './views/ExportView';
import { AboutView } from './views/AboutView';
import { WeatherGeneratorView } from './views/WeatherGeneratorView';
import { FunctionsView } from './views/FunctionsView';
import { AgrivoltaicsView } from './views/AgrivoltaicsView';
import { ScenarioView } from './views/ScenarioView'; 
import { AgriVoltaicEnergyView } from './views/AgriVoltaicEnergyView';
import { FarquharView } from './views/FarquharView';
import { SeedEmergenceView } from './views/SeedEmergenceView'; // Import new view

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewView />;
      case 'weather': return <WeatherGeneratorView />; 
      case 'concepts': return <ConceptsView />;
      case 'functions': return <FunctionsView />;
      case 'emergence': return <SeedEmergenceView />; // Add case
      case 'phenology': return <PhenologyView />;
      case 'lai': return <LaiView />;
      case 'photosynthesis': return <FarquharView />;
      case 'biomass': return <BiomassView />;
      case 'water': return <WaterView />;
      case 'scenario': return <ScenarioView />;
      case 'agrivoltaics': return <AgrivoltaicsView />;
      case 'energy_balance': return <AgriVoltaicEnergyView />;
      case 'export': return <ExportView />;
      case 'about': return <AboutView />;
      default: return <OverviewView />;
    }
  };

  return (
    <SimulationProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </SimulationProvider>
  );
};

export default App;
