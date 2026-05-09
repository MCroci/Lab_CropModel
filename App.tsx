
import React, { useState, Suspense, lazy } from 'react';
import { SimulationProvider } from './context/SimulationContext';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

// Lazy load views for code-splitting
const OverviewView = lazy(() => import('./views/OverviewView').then(m => ({ default: m.OverviewView })));
const ConceptsView = lazy(() => import('./views/ConceptsView').then(m => ({ default: m.ConceptsView })));
const PhenologyView = lazy(() => import('./views/PhenologyView').then(m => ({ default: m.PhenologyView })));
const LaiView = lazy(() => import('./views/LaiView').then(m => ({ default: m.LaiView })));
const BiomassView = lazy(() => import('./views/BiomassView').then(m => ({ default: m.BiomassView })));
const WaterView = lazy(() => import('./views/WaterView').then(m => ({ default: m.WaterView })));
const SoilAggregatesView = lazy(() => import('./views/SoilAggregatesView').then(m => ({ default: m.SoilAggregatesView })));
const ExportView = lazy(() => import('./views/ExportView').then(m => ({ default: m.ExportView })));
const AboutView = lazy(() => import('./views/AboutView').then(m => ({ default: m.AboutView })));
const WeatherGeneratorView = lazy(() => import('./views/WeatherGeneratorView').then(m => ({ default: m.WeatherGeneratorView })));
const FunctionsView = lazy(() => import('./views/FunctionsView').then(m => ({ default: m.FunctionsView })));
const ResponseFunctionsView = lazy(() => import('./views/ResponseFunctionsView').then(m => ({ default: m.ResponseFunctionsView })));
const AgrivoltaicsView = lazy(() => import('./views/AgrivoltaicsView').then(m => ({ default: m.AgrivoltaicsView })));
const ScenarioView = lazy(() => import('./views/ScenarioView').then(m => ({ default: m.ScenarioView })));
const AgriVoltaicEnergyView = lazy(() => import('./views/AgriVoltaicEnergyView').then(m => ({ default: m.AgriVoltaicEnergyView })));
const FarquharView = lazy(() => import('./views/FarquharView').then(m => ({ default: m.FarquharView })));
const SeedEmergenceView = lazy(() => import('./views/SeedEmergenceView').then(m => ({ default: m.SeedEmergenceView })));
const LearningPathView = lazy(() => import('./views/LearningPathView').then(m => ({ default: m.LearningPathView })));
const ExercisesView = lazy(() => import('./views/ExercisesView').then(m => ({ default: m.ExercisesView })));
const CourseExercisesView = lazy(() => import('./views/CourseExercisesView').then(m => ({ default: m.CourseExercisesView })));
const ValidationView = lazy(() => import('./views/ValidationView').then(m => ({ default: m.ValidationView })));
const CalibrationView = lazy(() => import('./views/CalibrationView').then(m => ({ default: m.CalibrationView })));
const BibliographyView = lazy(() => import('./views/BibliographyView').then(m => ({ default: m.BibliographyView })));
const ManualeView = lazy(() => import('./views/ManualeView').then(m => ({ default: m.ManualeView })));
const WeatherDataManagementView = lazy(() => import('./views/WeatherDataManagementView').then(m => ({ default: m.WeatherDataManagementView })));
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
  </div>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewView onNavigate={setActiveTab} />;
      case 'weather': return <WeatherGeneratorView />;
      case 'weather_management': return <WeatherDataManagementView />; 
      case 'concepts': return <ConceptsView />;
      case 'functions': return <FunctionsView />;
      case 'response_functions': return <ResponseFunctionsView />;
      case 'emergence': return <SeedEmergenceView />;
      case 'phenology': return <PhenologyView />;
      case 'lai': return <LaiView />;
      case 'photosynthesis': return <FarquharView />;
      case 'biomass': return <BiomassView />;
      case 'water': return <WaterView />;
      case 'soil': return <SoilAggregatesView onNavigate={setActiveTab} />;
      case 'scenario': return <ScenarioView />;
      case 'agrivoltaics': return <AgrivoltaicsView />;
      case 'energy_balance': return <AgriVoltaicEnergyView />;
      case 'export': return <ExportView />;
      case 'learning_path': return <LearningPathView onNavigate={setActiveTab} />;
      case 'exercises': return <ExercisesView />;
      case 'course_exercises': return <CourseExercisesView />;
      case 'validation': return <ValidationView />;
      case 'calibration': return <CalibrationView onNavigate={setActiveTab} />;
      case 'bibliography': return <BibliographyView />;
      case 'manuale': return <ManualeView onNavigate={setActiveTab} />;
      case 'about': return <AboutView />;
      default: return <OverviewView />;
    }
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <SimulationProvider>
          <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            <Suspense fallback={<LoadingFallback />}>
              {renderContent()}
            </Suspense>
          </Layout>
        </SimulationProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
