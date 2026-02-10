import React, { useState } from 'react';
import { Card, Slider, Button } from '../components/UI';
import { BookOpen, FileCheck, Layers } from 'lucide-react';

const RHO_S = 2650; // kg/m³ densità particelle
const RHO_L = 1000; // kg/m³ densità acqua

const PorosityCalculator: React.FC = () => {
  const [rhoB, setRhoB] = useState(1200);
  const [w, setW] = useState(0.20);
  const [hPrism, setHPrism] = useState(2);
  const phi = 1 - rhoB / RHO_S;
  const theta = w * (rhoB / RHO_L);
  const hW = theta * hPrism * 1000; // mm
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Slider label="ρ_b (kg/m³)" value={rhoB} min={800} max={1800} step={50} onChange={setRhoB} description="Densità apparente" />
        <Slider label="w (gravimetrico)" value={w} min={0.05} max={0.45} step={0.01} onChange={setW} description="0-1" />
        <Slider label="h_prism (m)" value={hPrism} min={0.5} max={3} step={0.1} onChange={setHPrism} description="Profondità prisma" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="bg-white p-2 rounded border border-amber-200">
          <div className="text-amber-700 font-medium">φ (porosità)</div>
          <div className="text-lg font-bold text-amber-900">{(phi * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-white p-2 rounded border border-amber-200">
          <div className="text-amber-700 font-medium">θ (volumetrico)</div>
          <div className="text-lg font-bold text-amber-900">{(theta * 100).toFixed(1)}%</div>
        </div>
        <div className="bg-white p-2 rounded border border-amber-200">
          <div className="text-amber-700 font-medium">h_w (mm)</div>
          <div className="text-lg font-bold text-amber-900">{hW.toFixed(0)}</div>
        </div>
        <div className="bg-white p-2 rounded border border-amber-200">
          <div className="text-amber-700 font-medium">Aria (φ-θ)</div>
          <div className="text-lg font-bold text-amber-900">{((phi - theta) * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

interface SoilAggregatesViewProps {
  onNavigate?: (tab: string) => void;
}

export const SoilAggregatesView: React.FC<SoilAggregatesViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card title="Struttura del Suolo" className="border-l-4 border-l-amber-500" headerAction={<Layers className="text-amber-600" size={24} />}>
            <p className="text-sm text-gray-700 mb-3">
              Il suolo agricolo è composto da <strong>aggregati</strong> (peds) – unità strutturali formate da particelle minerali e organiche – e da <strong>pori</strong> che contengono aria e acqua.
            </p>
            <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside">
              <li><strong>Macropori</strong> (&gt;75 μm): drenaggio, aerazione</li>
              <li><strong>Mesopori</strong>: ritenzione idrica</li>
              <li><strong>Micropori</strong>: acqua non disponibile</li>
            </ul>
            <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Lavorazione:</strong> L'aratura frammenta gli aggregati, aumentando temporaneamente la porosità. La compattazione da macchinari riduce i macropori.
              </p>
            </div>
          </Card>

          {onNavigate && (
            <Card title="Esercizi correlati">
              <p className="text-sm text-gray-600 mb-3">
                Esercizi pratici su questi concetti nella sezione Esercizi (modulo Fisica del Suolo).
              </p>
              <Button variant="outline" className="w-full text-sm" onClick={() => onNavigate('exercises')}>
                <FileCheck size={16} />
                Vai agli Esercizi
              </Button>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Porosità e densità */}
          <Card title="Porosità e Densità del Pedon" className="bg-slate-50 border-slate-200" headerAction={<BookOpen className="text-slate-400" />}>
            <div className="prose prose-sm max-w-none text-slate-700 mb-4">
              <p>
                La <strong>densità apparente</strong> (ρ<sub>b</sub>) è il rapporto massa/volume del suolo in condizioni naturali. 
                Suoli lavorati di fresco hanno ρ<sub>b</sub> basse (900–1200 kg/m³); suoli compattati arrivano a 1600 kg/m³.
              </p>
              <div className="bg-white p-4 rounded border border-slate-200 text-sm space-y-2 my-3" style={{ fontFamily: 'serif' }}>
                <div className="flex flex-wrap items-baseline gap-1">φ = 1 − (ρ<sub>b</sub>/ρ<sub>s</sub>) <span className="text-gray-500 text-xs ml-1">porosità totale</span></div>
                <div className="flex flex-wrap items-baseline gap-1">θ = w · (ρ<sub>b</sub>/ρ<sub>l</sub>) <span className="text-gray-500 text-xs ml-1">contenuto volumetrico</span></div>
                <div className="flex flex-wrap items-baseline gap-1">h<sub>w</sub> = θ · h<sub>prism</sub> <span className="text-gray-500 text-xs ml-1">altezza equivalente acqua (m → mm)</span></div>
              </div>
              <p className="text-xs text-gray-600">
                ρ<sub>s</sub> ≈ 2650 kg/m³ (particelle), ρ<sub>l</sub> = 1000 kg/m³ (acqua), w = contenuto gravimetrico (0–1).
              </p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <h4 className="font-semibold text-amber-900 mb-3">Calcolatore interattivo</h4>
              <PorosityCalculator />
            </div>
          </Card>

          {/* Box counting */}
          <Card title="Box Counting e Dimensione Frattale" className="border-l-4 border-l-amber-400 bg-amber-50/30">
            <div className="prose prose-sm max-w-none text-slate-700">
              <p>
                La geometria dei pori negli aggregati può essere descritta con la <strong>dimensione frattale</strong> (D). 
                La tecnica del <strong>box counting</strong> conta quanti "box" di lato L contengono pori, al variare di L.
              </p>
              <p className="text-sm">
                Relazione: N(L) ∝ L<sup>−D</sup>, da cui D = −log(N₂/N₁) / log(L₂/L₁). 
                Una lavorazione che frammenta gli aggregati aumenta D (rete di pori più ramificata) e la porosità rilevata.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Implementazione:</strong> caricare un'immagine di sezione sottile, binarizzare con soglia RGB per distinguere pori (chiari) da matrice (scura), applicare griglie a scale diverse.
              </p>
            </div>
          </Card>

          {/* Fascio di capillari */}
          <Card title="Modello a Fascio di Capillari" className="border-l-4 border-l-amber-400 bg-amber-50/30">
            <div className="prose prose-sm max-w-none text-slate-700">
              <p>
                Per simulare ritenzione idrica e conducibilità, il suolo viene modellato come un <strong>fascio di tubi capillari</strong> 
                con raggi (r) distribuiti casualmente. La legge di Jurin: h ∝ 1/r (altezza di risalita capillare).
              </p>
              <p className="text-sm">
                In un suolo compattato i raggi massimi diminuiscono: si usano distribuzioni troncate o con media più bassa. 
                Meno macropori → più ritenzione a bassa tensione, meno drenaggio.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Implementazione:</strong> generare n capillari con (r, x, z) casuali, verificare non-sovrapposizione, visualizzare con VPython (visual.cylinder).
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
