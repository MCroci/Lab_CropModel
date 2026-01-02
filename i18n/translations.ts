export type Language = 'it' | 'en';

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    load: string;
    close: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    reset: string;
    apply: string;
    export: string;
    import: string;
    download: string;
    upload: string;
    edit: string;
    view: string;
    show: string;
    hide: string;
    yes: string;
    no: string;
    ok: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    loading: string;
    noData: string;
  };

  // App & Layout
  app: {
    title: string;
    subtitle: string;
    language: string;
    italian: string;
    english: string;
  };

  // Menu sections
  menu: {
    introduction: string;
    inputAndFundamentals: string;
    physiologicalProcesses: string;
    analysisAndValidation: string;
    advancedApplications: string;
    info: string;
  };

  // Menu items
  menuItems: {
    overview: string;
    learningPath: string;
    exercises: string;
    concepts: string;
    weatherGenerator: string;
    weatherManagement: string;
    cropComparison: string;
    emergence: string;
    phenology: string;
    lai: string;
    biomass: string;
    water: string;
    photosynthesis: string;
    scenario: string;
    validation: string;
    radiationReduction: string;
    energyBalance: string;
    about: string;
    code: string;
    bibliography: string;
    export: string;
  };

  // Overview
  overview: {
    title: string;
    learningObjectives: string;
    quickConfig: string;
    selectCrop: string;
    sowingDate: string;
    sowingDateNote: string;
    day: string;
    of: string;
    available: string;
    simulationAlways365: string;
    day1: string;
    season10: string;
    season30: string;
    activeParams: string;
    quickGuide: string;
    quickGuideSteps: string[];
    compareCrops: string;
    compareCropsDesc: string;
    saveConfig: string;
    configName: string;
    savedConfigs: string;
    configSaved: string;
    configLoaded: string;
    configDeleted: string;
    errorSaving: string;
    errorLoading: string;
    errorDeleting: string;
    enterConfigName: string;
    simulating: string;
    objectives: string[];
    note: string;
  };

  // Learning Path
  learningPath: {
    title: string;
    progress: string;
    description: string;
    estimatedTime: string;
    prerequisites: string;
    objectives: string;
    startModule: string;
    markComplete: string;
    completed: string;
    allComplete: string;
    allCompleteMessage: string;
    allCompleteSubmessage: string;
    module: string;
  };

  // Exercises
  exercises: {
    title: string;
    description: string;
    base: string;
    intermediate: string;
    advanced: string;
    module: string;
    showSolution: string;
    hideSolution: string;
    markComplete: string;
    solution: string;
    hint: string;
    step: string;
    answer: string;
  };

  // Validation
  validation: {
    title: string;
    description: string;
    note: string;
    variableToValidate: string;
    noiseLevel: string;
    metrics: string;
    rmse: string;
    r2: string;
    nrmse: string;
    mae: string;
    bias: string;
    excellent: string;
    good: string;
    acceptable: string;
    poor: string;
    temporalComparison: string;
    scatterPlot: string;
    observed: string;
    simulated: string;
    interpretation: string;
    rmseDesc: string;
    r2Desc: string;
    nrmseDesc: string;
    biasDesc: string;
    sowingDay: string;
    biomass: string;
    scatterPlotDesc: string;
  };

  // Concepts
  concepts: {
    state: string;
    flow: string;
    param: string;
    forcing: string;
    stateDesc: string;
    flowDesc: string;
    paramDesc: string;
    forcingDesc: string;
    interactiveSimulator: string;
    stateVsFlow: string;
    play: string;
    pause: string;
    reset: string;
    speed: string;
    day: string;
    examples: string;
    comparison: string;
    currentDay: string;
    classification: string;
    relation: string;
    decoupling: string;
    decouplingTitle: string;
    decouplingDesc: string;
    speedDesc: string;
  };

  // Crop Comparison
  cropComparison: {
    title: string;
    selectCrops: string;
    selectAll: string;
    deselectAll: string;
    compare: string;
    keyParams: string;
    finalResults: string;
    finalBiomass: string;
    maturityDay: string;
    maxLAI: string;
    biomass: string;
    lai: string;
    nds: string;
    noCropsSelected: string;
    noWeatherData: string;
    goToWeatherGenerator: string;
    howItWorks: string;
    selectCropsDesc: string;
    parallelSimulations: string;
    sameWeather: string;
    overlappedResults: string;
    simulationsCompleted: string;
    comparativeParams: string;
  };

  // Bibliography
  bibliography: {
    title: string;
    description: string;
    note: string;
    citationNotes: string;
    format: string;
    doi: string;
    academicUse: string;
  };

  // Error Boundary
  error: {
    title: string;
    message: string;
    reload: string;
    technicalDetails: string;
  };

  // Toast messages
  toast: {
    noDataToDownload: string;
    configSaved: string;
    configLoaded: string;
    configDeleted: string;
    errorSaving: string;
    errorLoading: string;
    errorDeleting: string;
  };
}

export const translations: Record<Language, Translations> = {
  it: {
    common: {
      save: 'Salva',
      cancel: 'Annulla',
      delete: 'Elimina',
      load: 'Carica',
      close: 'Chiudi',
      confirm: 'Conferma',
      back: 'Indietro',
      next: 'Avanti',
      previous: 'Precedente',
      search: 'Cerca',
      filter: 'Filtra',
      reset: 'Reset',
      apply: 'Applica',
      export: 'Esporta',
      import: 'Importa',
      download: 'Scarica',
      upload: 'Carica',
      edit: 'Modifica',
      view: 'Visualizza',
      show: 'Mostra',
      hide: 'Nascondi',
      yes: 'Sì',
      no: 'No',
      ok: 'OK',
      error: 'Errore',
      success: 'Successo',
      warning: 'Avviso',
      info: 'Info',
      loading: 'Caricamento...',
      noData: 'Nessun dato disponibile',
    },
    app: {
      title: 'Crop mod lab',
      subtitle: 'Modellistica delle colture erbacee',
      language: 'Lingua',
      italian: 'Italiano',
      english: 'English',
    },
    menu: {
      introduction: 'Introduzione',
      inputAndFundamentals: 'Input e Fondamenti',
      physiologicalProcesses: 'Processi Fisiologici',
      analysisAndValidation: 'Analisi e Validazione',
      advancedApplications: 'Applicazioni Avanzate',
      info: 'Info',
    },
    menuItems: {
      overview: 'Panoramica',
      learningPath: 'Percorso Didattico',
      exercises: 'Esercizi',
      concepts: 'Concetti Base',
      weatherGenerator: 'Generatore Meteo',
      weatherManagement: 'Gestione Dati Meteo',
      cropComparison: 'Confronto Colture',
      emergence: 'Emergenza Seme',
      phenology: 'Fenologia',
      lai: 'LAI & Radiazione',
      biomass: 'Biomassa',
      water: 'Bilancio Idrico',
      photosynthesis: 'Fotosintesi (Farquhar)',
      scenario: 'Analisi Scenario',
      validation: 'Validazione',
      radiationReduction: 'Riduzione Radiazione',
      energyBalance: 'Bilancio Energetico',
      about: 'Info & Crediti',
      code: 'Logica & Codice',
      bibliography: 'Bibliografia',
      export: 'Esportazione Dati',
    },
    overview: {
      title: 'Panoramica',
      learningObjectives: 'Obiettivi di Apprendimento',
      quickConfig: 'Configurazione Rapida',
      selectCrop: 'Seleziona Coltura (Preset)',
      sowingDate: 'Data di Semina/Trapianto',
      sowingDateNote: 'Ogni coltura può avere una data di semina diversa. La data impostata qui si applica solo alla coltura selezionata.',
      day: 'Giorno',
      of: 'di',
      available: 'disponibili',
      simulationAlways365: 'La simulazione è sempre di un anno completo (365 giorni).',
      day1: 'Giorno 1',
      season10: '10% stagione',
      season30: '30% stagione',
      activeParams: 'Parametri Chiave Attivi:',
      quickGuide: 'Guida Rapida',
      quickGuideSteps: [
        'Scegli un preset qui sopra.',
        'Vai su Generatore Meteo per definire il clima.',
        'Analizza la Biomassa per vedere l\'accumulo.',
        'Controlla Bilancio Idrico per lo stress (ARID).',
      ],
      compareCrops: '💡 Confronta più colture',
      compareCropsDesc: 'Vuoi confrontare più colture contemporaneamente? Vai su Confronto Colture nel menu per eseguire simulazioni parallele!',
      saveConfig: 'Salva Configurazione',
      configName: 'Nome configurazione...',
      savedConfigs: 'Configurazioni Salvate:',
      configSaved: 'Configurazione salvata con successo!',
      configLoaded: 'Configurazione caricata con successo!',
      configDeleted: 'Configurazione eliminata',
      errorSaving: 'Errore nel salvataggio',
      errorLoading: 'Errore nel caricamento',
      errorDeleting: 'Errore nell\'eliminazione',
      enterConfigName: 'Inserisci un nome per la configurazione',
      simulating: 'Simulazione in corso...',
      objectives: [
        'Distinguere tra variabili di stato, variabili di flusso, parametri e variabili forzanti.',
        'Comprendere il ciclo giornaliero: Meteo → Fenologia → LAI → Intercettazione → Biomassa.',
        'Introduzione all\'accoppiamento con il bilancio idrico del suolo e gli indici di stress.',
        'Visualizzare l\'impatto dei parametri fisiologici (es. RUE, KPAR) sulla produttività.',
      ],
      note: 'Nota: Il modello implementato qui è semplificato a scopi didattici. Si concentra sui principi fisici fondamentali (Radiazione, Temperatura, Acqua) tralasciando aspetti complessi come i nutrienti o i parassiti.',
    },
    learningPath: {
      title: 'Percorso Didattico - Modellistica delle Colture Erbacee',
      progress: 'Progresso Complessivo',
      description: 'Questo percorso ti guiderà attraverso i concetti fondamentali della modellistica delle colture erbacee. Completa i moduli in sequenza per costruire una comprensione solida e progressiva.',
      estimatedTime: 'Tempo Stimato',
      prerequisites: 'Prerequisiti',
      objectives: 'Obiettivi di Apprendimento',
      startModule: 'Inizia Modulo',
      markComplete: 'Segna come Completato',
      completed: 'Completato',
      allComplete: '🎉 Percorso Completato!',
      allCompleteMessage: 'Complimenti! Hai completato tutti i moduli del percorso didattico.',
      allCompleteSubmessage: 'Ora sei pronto per applicare le conoscenze acquisite in esercizi pratici e casi studio avanzati.',
      module: 'Moduli',
    },
    exercises: {
      title: 'Esercizi Pratici - Modellistica delle Colture Erbacee',
      description: 'Questa sezione contiene esercizi pratici organizzati per difficoltà e modulo didattico. Completa gli esercizi per consolidare la comprensione dei concetti teorici.',
      base: 'Esercizi Base',
      intermediate: 'Esercizi Intermedi',
      advanced: 'Esercizi Avanzati',
      module: 'Modulo:',
      showSolution: 'Mostra Soluzione',
      hideSolution: 'Nascondi Soluzione',
      markComplete: 'Segna come Completato',
      solution: 'Soluzione',
      hint: 'Suggerimento:',
      step: 'Step',
      answer: 'Inserisci la tua risposta qui...',
    },
    validation: {
      title: 'Validazione del Modello',
      description: 'Questa sezione permette di validare le simulazioni confrontandole con dati osservati. I dati "osservati" sono generati sinteticamente aggiungendo rumore ai risultati simulati.',
      note: 'Nota: In un contesto reale, i dati osservati provengono da esperimenti di campo o letteratura scientifica.',
      variableToValidate: 'Variabile da Validare',
      noiseLevel: 'Livello di Rumore (σ)',
      metrics: 'Metriche di Validazione',
      rmse: 'RMSE:',
      r2: 'R²:',
      nrmse: 'nRMSE:',
      mae: 'MAE:',
      bias: 'Bias:',
      excellent: 'Eccellente',
      good: 'Buono',
      acceptable: 'Accettabile',
      poor: 'Scarso',
      temporalComparison: 'Confronto Temporale:',
      scatterPlot: 'Scatter Plot: Osservato vs Simulato',
      observed: 'Osservato',
      simulated: 'Simulato',
      interpretation: 'Interpretazione delle Metriche',
      rmseDesc: 'Misura l\'errore medio tra osservazioni e simulazioni. Valori più bassi indicano migliore adattamento.',
      r2Desc: 'Indica la proporzione di varianza spiegata dal modello. R² > 0.7 è generalmente considerato buono.',
      nrmseDesc: 'RMSE normalizzato rispetto alla media. nRMSE < 20% è generalmente accettabile per modelli colturali.',
      biasDesc: 'Differenza sistematica tra simulazioni e osservazioni. Bias positivo = sovrastima, negativo = sottostima.',
      sowingDay: 'Giorno (Semina: giorno',
      biomass: 'Biomassa',
      scatterPlotDesc: 'La linea rossa tratteggiata rappresenta la perfetta corrispondenza (1:1). I punti dovrebbero distribuirsi lungo questa linea per un buon adattamento.',
    },
    concepts: {
      state: 'Variabili di Stato (State)',
      flow: 'Variabili di Flusso (Rate)',
      param: 'Parametri',
      forcing: 'Variabili Forzanti (Forcing)',
      stateDesc: 'Descrivono lo stato del sistema in un dato momento. Si accumulano nel tempo.',
      flowDesc: 'Rappresentano la velocità di cambiamento delle variabili di stato. Sono derivate giornaliere.',
      paramDesc: 'Proprietà costanti del sistema o della cultivar durante la simulazione.',
      forcingDesc: 'Input esterni che guidano il sistema. Cambiano ogni giorno.',
      interactiveSimulator: 'Simulatore Interattivo: Stato vs Flusso',
      stateVsFlow: 'Osserva come le variabili di stato (accumulano) si differenziano dalle variabili di flusso (variazioni giornaliere).',
      play: 'Avvia',
      pause: 'Pausa',
      reset: 'Reset',
      speed: 'Velocità Simulazione',
      day: 'Giorno',
      examples: 'Esempi dal Modello:',
      comparison: 'Confronto Stato vs Flusso',
      currentDay: 'Giorno Corrente',
      classification: 'Classificazione Variabili',
      relation: 'Relazioni Stato-Flusso',
      decoupling: 'Decoupling Sviluppo-Crescita',
      decouplingTitle: 'Decoupling Sviluppo-Crescita in Sistemi Agrivoltaici',
      decouplingDesc: 'In sistemi agrivoltaici, la riduzione della radiazione può causare un "decoupling" tra sviluppo fenologico (velocità) e crescita (accumulo biomassa). Il modello può svilupparsi più velocemente (meno stress termico) ma crescere più lentamente (meno radiazione intercettata).',
      speedDesc: 'Tempo tra un giorno e il successivo',
    },
    cropComparison: {
      title: 'Confronto Colture',
      selectCrops: 'Seleziona Colture da Confrontare',
      selectAll: 'Seleziona Tutto',
      deselectAll: 'Deseleziona Tutto',
      compare: 'Confronta',
      keyParams: 'Parametri Chiave',
      finalResults: 'Risultati Finali',
      finalBiomass: 'Biomassa Finale',
      maturityDay: 'Giorno Maturazione',
      maxLAI: 'LAI Massimo',
      biomass: 'Biomassa',
      lai: 'LAI',
      nds: 'NDS',
      noCropsSelected: 'Nessuna coltura selezionata. Seleziona almeno una coltura per confrontare.',
      noWeatherData: 'Dati meteorologici mancanti. Per eseguire simulazioni parallele, devi prima generare i dati meteorologici.',
      goToWeatherGenerator: 'Vai alla sezione Generatore Meteo nel menu laterale e genera i dati meteo. Poi torna qui per confrontare le colture!',
      howItWorks: 'Come funziona:',
      selectCropsDesc: 'che vuoi confrontare usando le checkbox qui sotto',
      parallelSimulations: 'Le simulazioni vengono eseguite automaticamente in parallelo per tutte le colture selezionate',
      sameWeather: 'Ogni coltura usa le stesse condizioni meteorologiche (dalla sezione Generatore Meteo)',
      overlappedResults: 'I risultati vengono mostrati sovrapposti nei grafici per un confronto diretto',
      simulationsCompleted: 'Simulazioni Eseguite',
      comparativeParams: 'Parametri Comparativi',
    },
    bibliography: {
      title: 'Bibliografia - Modellistica delle Colture Erbacee',
      description: 'Riferimenti bibliografici essenziali per lo studio della modellistica delle colture erbacee. Questa bibliografia copre i principali argomenti trattati nell\'applicazione.',
      note: 'Nota: I riferimenti sono organizzati per categoria. Clicca sui link DOI o URL per accedere alle pubblicazioni originali.',
      citationNotes: 'Note sulla Citazione',
      format: 'Formato: Le citazioni seguono lo stile APA (American Psychological Association).',
      doi: 'DOI: Digital Object Identifier - identificatore univoco per pubblicazioni scientifiche.',
      academicUse: 'Uso Accademico: Quando utilizzi questi riferimenti in relazioni o tesi, assicurati di seguire le linee guida del tuo ateneo per le citazioni bibliografiche.',
    },
    error: {
      title: 'Errore nell\'applicazione',
      message: 'Si è verificato un errore imprevisto. Per favore, ricarica la pagina.',
      reload: 'Ricarica pagina',
      technicalDetails: 'Dettagli tecnici',
    },
    toast: {
      noDataToDownload: 'Nessun dato da scaricare.',
      configSaved: 'Configurazione salvata con successo!',
      configLoaded: 'Configurazione caricata con successo!',
      configDeleted: 'Configurazione eliminata',
      errorSaving: 'Errore nel salvataggio',
      errorLoading: 'Errore nel caricamento',
      errorDeleting: 'Errore nell\'eliminazione',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      load: 'Load',
      close: 'Close',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      filter: 'Filter',
      reset: 'Reset',
      apply: 'Apply',
      export: 'Export',
      import: 'Import',
      download: 'Download',
      upload: 'Upload',
      edit: 'Edit',
      view: 'View',
      show: 'Show',
      hide: 'Hide',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info',
      loading: 'Loading...',
      noData: 'No data available',
    },
    app: {
      title: 'Crop mod lab',
      subtitle: 'Herbaceous Crop Modeling',
      language: 'Language',
      italian: 'Italiano',
      english: 'English',
    },
    menu: {
      introduction: 'Introduction',
      inputAndFundamentals: 'Input and Fundamentals',
      physiologicalProcesses: 'Physiological Processes',
      analysisAndValidation: 'Analysis and Validation',
      advancedApplications: 'Advanced Applications',
      info: 'Info',
    },
    menuItems: {
      overview: 'Overview',
      learningPath: 'Learning Path',
      exercises: 'Exercises',
      concepts: 'Basic Concepts',
      weatherGenerator: 'Weather Generator',
      weatherManagement: 'Weather Data Management',
      cropComparison: 'Crop Comparison',
      emergence: 'Seed Emergence',
      phenology: 'Phenology',
      lai: 'LAI & Radiation',
      biomass: 'Biomass',
      water: 'Water Balance',
      photosynthesis: 'Photosynthesis (Farquhar)',
      scenario: 'Scenario Analysis',
      validation: 'Validation',
      radiationReduction: 'Radiation Reduction',
      energyBalance: 'Energy Balance',
      about: 'Info & Credits',
      code: 'Logic & Code',
      bibliography: 'Bibliography',
      export: 'Data Export',
    },
    overview: {
      title: 'Overview',
      learningObjectives: 'Learning Objectives',
      quickConfig: 'Quick Configuration',
      selectCrop: 'Select Crop (Preset)',
      sowingDate: 'Sowing/Transplanting Date',
      sowingDateNote: 'Each crop can have a different sowing date. The date set here applies only to the selected crop.',
      day: 'Day',
      of: 'of',
      available: 'available',
      simulationAlways365: 'The simulation is always a full year (365 days).',
      day1: 'Day 1',
      season10: '10% season',
      season30: '30% season',
      activeParams: 'Active Key Parameters:',
      quickGuide: 'Quick Guide',
      quickGuideSteps: [
        'Choose a preset above.',
        'Go to Weather Generator to define the climate.',
        'Analyze Biomass to see accumulation.',
        'Check Water Balance for stress (ARID).',
      ],
      compareCrops: '💡 Compare multiple crops',
      compareCropsDesc: 'Want to compare multiple crops simultaneously? Go to Crop Comparison in the menu to run parallel simulations!',
      saveConfig: 'Save Configuration',
      configName: 'Configuration name...',
      savedConfigs: 'Saved Configurations:',
      configSaved: 'Configuration saved successfully!',
      configLoaded: 'Configuration loaded successfully!',
      configDeleted: 'Configuration deleted',
      errorSaving: 'Error saving',
      errorLoading: 'Error loading',
      errorDeleting: 'Error deleting',
      enterConfigName: 'Enter a name for the configuration',
      simulating: 'Simulation in progress...',
      objectives: [
        'Distinguish between state variables, flow variables, parameters, and forcing variables.',
        'Understand the daily cycle: Weather → Phenology → LAI → Interception → Biomass.',
        'Introduction to coupling with soil water balance and stress indices.',
        'Visualize the impact of physiological parameters (e.g., RUE, KPAR) on productivity.',
      ],
      note: 'Note: The model implemented here is simplified for educational purposes. It focuses on fundamental physical principles (Radiation, Temperature, Water) while omitting complex aspects such as nutrients or pests.',
    },
    learningPath: {
      title: 'Learning Path - Herbaceous Crop Modeling',
      progress: 'Overall Progress',
      description: 'This path will guide you through the fundamental concepts of herbaceous crop modeling. Complete the modules sequentially to build a solid and progressive understanding.',
      estimatedTime: 'Estimated Time',
      prerequisites: 'Prerequisites',
      objectives: 'Learning Objectives',
      startModule: 'Start Module',
      markComplete: 'Mark as Complete',
      completed: 'Completed',
      allComplete: '🎉 Path Completed!',
      allCompleteMessage: 'Congratulations! You have completed all modules in the learning path.',
      allCompleteSubmessage: 'You are now ready to apply the knowledge gained in practical exercises and advanced case studies.',
      module: 'Modules',
    },
    exercises: {
      title: 'Practical Exercises - Herbaceous Crop Modeling',
      description: 'This section contains practical exercises organized by difficulty and teaching module. Complete the exercises to consolidate understanding of theoretical concepts.',
      base: 'Basic Exercises',
      intermediate: 'Intermediate Exercises',
      advanced: 'Advanced Exercises',
      module: 'Module:',
      showSolution: 'Show Solution',
      hideSolution: 'Hide Solution',
      markComplete: 'Mark as Complete',
      solution: 'Solution',
      hint: 'Hint:',
      step: 'Step',
      answer: 'Enter your answer here...',
    },
    validation: {
      title: 'Model Validation',
      description: 'This section allows you to validate simulations by comparing them with observed data. "Observed" data are synthetically generated by adding noise to simulated results.',
      note: 'Note: In a real context, observed data come from field experiments or scientific literature.',
      variableToValidate: 'Variable to Validate',
      noiseLevel: 'Noise Level (σ)',
      metrics: 'Validation Metrics',
      rmse: 'RMSE:',
      r2: 'R²:',
      nrmse: 'nRMSE:',
      mae: 'MAE:',
      bias: 'Bias:',
      excellent: 'Excellent',
      good: 'Good',
      acceptable: 'Acceptable',
      poor: 'Poor',
      temporalComparison: 'Temporal Comparison:',
      scatterPlot: 'Scatter Plot: Observed vs Simulated',
      observed: 'Observed',
      simulated: 'Simulated',
      interpretation: 'Metrics Interpretation',
      rmseDesc: 'Measures the average error between observations and simulations. Lower values indicate better fit.',
      r2Desc: 'Indicates the proportion of variance explained by the model. R² > 0.7 is generally considered good.',
      nrmseDesc: 'RMSE normalized relative to the mean. nRMSE < 20% is generally acceptable for crop models.',
      biasDesc: 'Systematic difference between simulations and observations. Positive bias = overestimation, negative = underestimation.',
      sowingDay: 'Day (Sowing: day',
      biomass: 'Biomass',
      scatterPlotDesc: 'The red dashed line represents perfect correspondence (1:1). Points should distribute along this line for a good fit.',
    },
    concepts: {
      state: 'State Variables',
      flow: 'Flow Variables (Rate)',
      param: 'Parameters',
      forcing: 'Forcing Variables',
      stateDesc: 'Describe the state of the system at a given time. They accumulate over time.',
      flowDesc: 'Represent the rate of change of state variables. They are daily derivatives.',
      paramDesc: 'Constant properties of the system or cultivar during simulation.',
      forcingDesc: 'External inputs that drive the system. They change every day.',
      interactiveSimulator: 'Interactive Simulator: State vs Flow',
      stateVsFlow: 'Observe how state variables (accumulate) differ from flow variables (daily changes).',
      play: 'Play',
      pause: 'Pause',
      reset: 'Reset',
      speed: 'Simulation Speed',
      day: 'Day',
      examples: 'Examples from Model:',
      comparison: 'State vs Flow Comparison',
      currentDay: 'Current Day',
      classification: 'Variable Classification',
      relation: 'State-Flow Relations',
      decoupling: 'Development-Growth Decoupling',
      decouplingTitle: 'Development-Growth Decoupling in Agrivoltaic Systems',
      decouplingDesc: 'In agrivoltaic systems, radiation reduction can cause "decoupling" between phenological development (rate) and growth (biomass accumulation). The model may develop faster (less thermal stress) but grow slower (less intercepted radiation).',
      speedDesc: 'Time between one day and the next',
    },
    cropComparison: {
      title: 'Crop Comparison',
      selectCrops: 'Select Crops to Compare',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      compare: 'Compare',
      keyParams: 'Key Parameters',
      finalResults: 'Final Results',
      finalBiomass: 'Final Biomass',
      maturityDay: 'Maturity Day',
      maxLAI: 'Max LAI',
      biomass: 'Biomass',
      lai: 'LAI',
      nds: 'NDS',
      noCropsSelected: 'No crops selected. Select at least one crop to compare.',
      noWeatherData: 'Missing weather data. To run parallel simulations, you must first generate weather data.',
      goToWeatherGenerator: 'Go to the Weather Generator section in the sidebar menu and generate weather data. Then come back here to compare crops!',
      howItWorks: 'How it works:',
      selectCropsDesc: 'you want to compare using the checkboxes below',
      parallelSimulations: 'Simulations are automatically executed in parallel for all selected crops',
      sameWeather: 'Each crop uses the same weather conditions (from the Weather Generator section)',
      overlappedResults: 'Results are shown overlapped in charts for direct comparison',
      simulationsCompleted: 'Simulations Completed',
      comparativeParams: 'Comparative Parameters',
    },
    bibliography: {
      title: 'Bibliography - Herbaceous Crop Modeling',
      description: 'Essential bibliographic references for the study of herbaceous crop modeling. This bibliography covers the main topics addressed in the application.',
      note: 'Note: References are organized by category. Click on DOI or URL links to access original publications.',
      citationNotes: 'Citation Notes',
      format: 'Format: Citations follow APA (American Psychological Association) style.',
      doi: 'DOI: Digital Object Identifier - unique identifier for scientific publications.',
      academicUse: 'Academic Use: When using these references in reports or theses, make sure to follow your institution\'s guidelines for bibliographic citations.',
    },
    error: {
      title: 'Application Error',
      message: 'An unexpected error occurred. Please reload the page.',
      reload: 'Reload page',
      technicalDetails: 'Technical details',
    },
    toast: {
      noDataToDownload: 'No data to download.',
      configSaved: 'Configuration saved successfully!',
      configLoaded: 'Configuration loaded successfully!',
      configDeleted: 'Configuration deleted',
      errorSaving: 'Error saving',
      errorLoading: 'Error loading',
      errorDeleting: 'Error deleting',
    },
  },
};

