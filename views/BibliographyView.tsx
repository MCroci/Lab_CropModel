import React from 'react';
import { Card } from '../components/UI';
import { ExternalLink, Book, FileText, Globe } from 'lucide-react';

interface Reference {
  id: string;
  authors: string;
  year: number;
  title: string;
  journal?: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
  type: 'book' | 'article' | 'chapter' | 'report';
  category: string;
  description?: string;
}

export const BibliographyView: React.FC = () => {
  const references: Reference[] = [
    {
      id: 'wallach2014',
      authors: 'Wallach, D., Makowski, D., Jones, J.W., Brun, F.',
      year: 2014,
      title: 'Working with Dynamic Crop Models: Methods, Tools and Examples for Agriculture and Environment',
      journal: 'Academic Press',
      type: 'book',
      category: 'Modellistica Generale',
      description: 'Testo fondamentale sulla modellistica delle colture, copre metodi, strumenti e applicazioni pratiche.'
    },
    {
      id: 'jones2003',
      authors: 'Jones, J.W., Hoogenboom, G., Porter, C.H., Boote, K.J., Batchelor, W.D., Hunt, L.A., ... & Ritchie, J.T.',
      year: 2003,
      title: 'The DSSAT cropping system model',
      journal: 'European Journal of Agronomy',
      volume: '18',
      pages: '235-265',
      doi: '10.1016/S1161-0301(02)00107-7',
      type: 'article',
      category: 'Modelli Specifici',
      description: 'Descrizione completa del sistema di modellistica DSSAT, uno dei modelli più utilizzati a livello mondiale.'
    },
    {
      id: 'keating2003',
      authors: 'Keating, B.A., Carberry, P.S., Hammer, G.L., Probert, M.E., Robertson, M.J., Holzworth, D., ... & Smith, C.J.',
      year: 2003,
      title: 'An overview of APSIM, a model designed for farming systems simulation',
      journal: 'European Journal of Agronomy',
      volume: '18',
      pages: '267-288',
      doi: '10.1016/S1161-0301(02)00108-9',
      type: 'article',
      category: 'Modelli Specifici',
      description: 'Presentazione del modello APSIM, utilizzato per simulazioni a livello di sistema agricolo.'
    },
    {
      id: 'monteith1977',
      authors: 'Monteith, J.L.',
      year: 1977,
      title: 'Climate and the efficiency of crop production in Britain',
      journal: 'Philosophical Transactions of the Royal Society of London. B, Biological Sciences',
      volume: '281',
      pages: '277-294',
      type: 'article',
      category: 'Fisiologia',
      description: 'Fondamentale lavoro che introduce il concetto di Radiation Use Efficiency (RUE).'
    },
    {
      id: 'farquhar1980',
      authors: 'Farquhar, G.D., von Caemmerer, S., Berry, J.A.',
      year: 1980,
      title: 'A biochemical model of photosynthetic CO₂ assimilation in leaves of C₃ species',
      journal: 'Planta',
      volume: '149',
      pages: '78-90',
      doi: '10.1007/BF00386231',
      type: 'article',
      category: 'Fotosintesi',
      description: 'Modello biochimico classico della fotosintesi per piante C3, ancora ampiamente utilizzato.'
    },
    {
      id: 'rothamsted1999',
      authors: 'Coleman, K., Jenkinson, D.S.',
      year: 1999,
      title: 'RothC-26.3 - A Model for the turnover of carbon in soil',
      journal: 'Rothamsted Research',
      type: 'report',
      category: 'Carbonio nel Suolo',
      description: 'Documentazione del modello RothC per la simulazione del turnover del carbonio organico nel suolo.'
    },
    {
      id: 'penman1948',
      authors: 'Penman, H.L.',
      year: 1948,
      title: 'Natural evaporation from open water, bare soil and grass',
      journal: 'Proceedings of the Royal Society of London. Series A',
      volume: '193',
      pages: '120-145',
      type: 'article',
      category: 'Evapotraspirazione',
      description: 'Lavoro fondamentale che introduce l\'equazione di Penman per il calcolo dell\'evapotraspirazione.'
    },
    {
      id: 'monteith1965',
      authors: 'Monteith, J.L.',
      year: 1965,
      title: 'Evaporation and environment',
      journal: 'Symposia of the Society for Experimental Biology',
      volume: '19',
      pages: '205-234',
      type: 'article',
      category: 'Evapotraspirazione',
      description: 'Introduzione del metodo Penman-Monteith per il calcolo dell\'evapotraspirazione delle colture.'
    },
    {
      id: 'beer1852',
      authors: 'Beer, A.',
      year: 1852,
      title: 'Bestimmung der Absorption des rothen Lichts in farbigen Flüssigkeiten',
      journal: 'Annalen der Physik und Chemie',
      volume: '86',
      pages: '78-88',
      type: 'article',
      category: 'Intercettazione Radiativa',
      description: 'Lavoro originale che descrive la legge di Beer-Lambert, fondamentale per il calcolo dell\'intercettazione radiativa.'
    },
    {
      id: 'richards1931',
      authors: 'Richards, F.J.',
      year: 1931,
      title: 'Quantitative analysis of growth',
      journal: 'Annals of Botany',
      volume: '45',
      pages: '545-561',
      type: 'article',
      category: 'Crescita',
      description: 'Introduzione dell\'equazione di crescita logistica (equazione di Richards), utilizzata per modellare la crescita del LAI.'
    },
    {
      id: 'wang1960',
      authors: 'Wang, J.Y.',
      year: 1960,
      title: 'A critique of the heat unit approach to plant response studies',
      journal: 'Ecology',
      volume: '41',
      pages: '785-790',
      type: 'article',
      category: 'Fenologia',
      description: 'Critica e miglioramento dell\'approccio delle unità termiche (Growing Degree Days) per la modellazione fenologica.'
    },
    {
      id: 'stocker2019',
      authors: 'Stocker, T.F., Qin, D., Plattner, G.K., Tignor, M., Allen, S.K., Boschung, J., ... & Midgley, P.M.',
      year: 2019,
      title: 'Climate Change 2013: The Physical Science Basis. Contribution of Working Group I to the Fifth Assessment Report of the Intergovernmental Panel on Climate Change',
      journal: 'Cambridge University Press',
      type: 'report',
      category: 'Cambiamenti Climatici',
      description: 'Rapporto IPCC che fornisce basi scientifiche per l\'analisi degli impatti del cambiamento climatico sull\'agricoltura.'
    },
    {
      id: 'marrou2013',
      authors: 'Marrou, H., Guilioni, L., Dufour, L., Dupraz, C., Wery, J.',
      year: 2013,
      title: 'Microclimate under agrivoltaic systems: Is crop growth rate affected in the partial shade of solar panels?',
      journal: 'Agricultural and Forest Meteorology',
      volume: '177',
      pages: '117-132',
      doi: '10.1016/j.agrformet.2013.04.012',
      type: 'article',
      category: 'Agrivoltaico',
      description: 'Studio fondamentale sul microclima e la crescita delle colture sotto sistemi agrivoltaici. Introduce il concetto di sviluppo-crescita decoupling.'
    },
    {
      id: 'dupraz2011',
      authors: 'Dupraz, C., Marrou, H., Talbot, G., Dufour, L., Nogier, A., Ferard, Y.',
      year: 2011,
      title: 'Combining solar photovoltaic panels and food crops for optimising land use: Towards new agrivoltaic schemes',
      journal: 'Renewable Energy',
      volume: '36',
      pages: '2725-2732',
      doi: '10.1016/j.renene.2011.03.005',
      type: 'article',
      category: 'Agrivoltaico',
      description: 'Lavoro pionieristico che introduce il concetto di agrivoltaico e propone schemi per ottimizzare l\'uso del suolo.'
    },
    {
      id: 'barron2019',
      authors: 'Barron-Gafford, G.A., Pavao-Zuckerman, M.A., Minor, R.L., Sutter, L.F., Barnett-Moreno, I., Blackett, D.T., ... & Macknick, J.E.',
      year: 2019,
      title: 'Agrivoltaics provide mutual benefits across the food–energy–water nexus in drylands',
      journal: 'Nature Sustainability',
      volume: '2',
      pages: '848-855',
      doi: '10.1038/s41893-019-0364-5',
      type: 'article',
      category: 'Agrivoltaico',
      description: 'Dimostra i benefici reciproci dell\'agrivoltaico nel nexus cibo-energia-acqua, con particolare attenzione alle zone aride.'
    },
    {
      id: 'soltani2012',
      authors: 'Soltani, A., Sinclair, T.R.',
      year: 2012,
      title: 'Modeling Physiology of Crop Development, Growth and Yield',
      journal: 'CABI, Wallingford',
      type: 'book',
      category: 'Modellistica Generale',
      description: 'Testo completo sulla modellistica fisiologica delle colture, copre sviluppo, crescita e formazione della resa.'
    },
    {
      id: 'poorter2019',
      authors: 'Poorter, H., Niinemets, Ü., Ntagkas, N., Siebenkäs, A., Mäenpää, M., Matsubara, S., & Pons, T.L.',
      year: 2019,
      title: 'A meta-analysis of plant responses to light intensity for 70 traits ranging from molecules to whole plant performance',
      journal: 'New Phytologist',
      volume: '223',
      pages: '1073-1105',
      doi: '10.1111/nph.15754',
      type: 'article',
      category: 'Fisiologia',
      description: 'Meta-analisi completa sulle risposte delle piante all\'intensità luminosa, rilevante per la comprensione degli effetti dell\'ombreggiamento in APV.'
    }
  ];

  const categories = Array.from(new Set(references.map(r => r.category)));

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'book': return <Book size={16} />;
      case 'article': return <FileText size={16} />;
      case 'report': return <FileText size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const formatCitation = (ref: Reference) => {
    let citation = `${ref.authors} (${ref.year}). ${ref.title}.`;
    if (ref.journal) {
      citation += ` ${ref.journal}`;
    }
    if (ref.volume) {
      citation += `, ${ref.volume}`;
    }
    if (ref.pages) {
      citation += `, ${ref.pages}`;
    }
    if (ref.doi) {
      citation += `. DOI: ${ref.doi}`;
    }
    return citation;
  };

  return (
    <div className="space-y-6">
      <Card title="Bibliografia - Modellistica delle Colture Erbacee">
        <p className="text-gray-700 mb-4">
          Riferimenti bibliografici essenziali per lo studio della modellistica delle colture erbacee.
          Questa bibliografia copre i principali argomenti trattati nell'applicazione.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> I riferimenti sono organizzati per categoria. Clicca sui link DOI o URL per accedere alle pubblicazioni originali.
          </p>
        </div>
      </Card>

      {categories.map(category => (
        <Card key={category} title={category}>
          <div className="space-y-4">
            {references
              .filter(ref => ref.category === category)
              .map(ref => (
                <div key={ref.id} className="border-l-4 border-brand-500 pl-4 py-3 bg-gray-50 rounded-r">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="mt-1 text-brand-600">
                      {getTypeIcon(ref.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
                        {ref.authors} ({ref.year})
                      </div>
                      <div className="text-gray-700 italic mb-2">
                        {ref.title}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {formatCitation(ref)}
                      </div>
                      {ref.description && (
                        <div className="text-sm text-gray-600 italic mb-2">
                          {ref.description}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {ref.doi && (
                          <a
                            href={`https://doi.org/${ref.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800"
                          >
                            <Globe size={14} />
                            DOI
                          </a>
                        )}
                        {ref.url && (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800"
                          >
                            <ExternalLink size={14} />
                            Link
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      ))}

      {/* Note sulla Citazione */}
      <Card title="Note sulla Citazione" className="bg-gray-50">
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>Formato:</strong> Le citazioni seguono lo stile APA (American Psychological Association).
          </p>
          <p>
            <strong>DOI:</strong> Digital Object Identifier - identificatore univoco per pubblicazioni scientifiche.
          </p>
          <p>
            <strong>Uso Accademico:</strong> Quando utilizzi questi riferimenti in relazioni o tesi, assicurati di seguire le linee guida del tuo ateneo per le citazioni bibliografiche.
          </p>
        </div>
      </Card>
    </div>
  );
};

