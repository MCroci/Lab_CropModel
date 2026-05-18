import React, { useMemo, useState } from 'react';
import { Card, Button } from '../components/UI';
import {
  OPEN_QUESTIONS,
  CLOSED_QUESTIONS,
  QUIZ_SECTIONS,
  QuizSection,
  ClosedQuestion,
} from '../data/quizData';
import { CheckCircle, ChevronLeft, ChevronRight, HelpCircle, BookOpen, ListChecks } from 'lucide-react';

type Part = 'A' | 'B';

const SECTION_COLORS: Record<QuizSection, string> = {
  'Introduzione alla Modellistica': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Fenologia e Sviluppo': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Assimilazione – RUE e Fotosintesi': 'bg-amber-100 text-amber-800 border-amber-200',
  'Traspirazione e ETP': 'bg-sky-100 text-sky-800 border-sky-200',
  'Acqua nel Suolo': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'Azoto nel Suolo': 'bg-lime-100 text-lime-800 border-lime-200',
  'Ripartizione dei Fotosintetati e Senescenza': 'bg-orange-100 text-orange-800 border-orange-200',
  'Simulazione degli Stress e SOM': 'bg-rose-100 text-rose-800 border-rose-200',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

export const QuizView: React.FC = () => {
  const [part, setPart] = useState<Part>('A');
  const [sectionFilter, setSectionFilter] = useState<QuizSection | 'tutte'>('tutte');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [checkedClosed, setCheckedClosed] = useState<Record<string, boolean>>({});

  const openFiltered = useMemo(
    () => (sectionFilter === 'tutte' ? OPEN_QUESTIONS : OPEN_QUESTIONS.filter(q => q.section === sectionFilter)),
    [sectionFilter]
  );

  const closedFiltered = useMemo(
    () => (sectionFilter === 'tutte' ? CLOSED_QUESTIONS : CLOSED_QUESTIONS.filter(q => q.section === sectionFilter)),
    [sectionFilter]
  );

  const questions = part === 'A' ? openFiltered : closedFiltered;
  const current = questions[currentIndex];
  const totalQuestions = OPEN_QUESTIONS.length + CLOSED_QUESTIONS.length;

  const closedScore = useMemo(() => {
    let correct = 0;
    let answered = 0;
    CLOSED_QUESTIONS.forEach(q => {
      if (checkedClosed[q.id] && selectedOptions[q.id] !== undefined) {
        answered++;
        if (selectedOptions[q.id] === q.correctIndex) correct++;
      }
    });
    return { correct, answered, total: CLOSED_QUESTIONS.length };
  }, [selectedOptions, checkedClosed]);

  const resetIndexOnFilter = (nextPart: Part, nextSection: QuizSection | 'tutte') => {
    setPart(nextPart);
    setSectionFilter(nextSection);
    setCurrentIndex(0);
  };

  const goPrev = () => setCurrentIndex(i => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex(i => Math.min(questions.length - 1, i + 1));

  const handleCheckClosed = (q: ClosedQuestion) => {
    if (selectedOptions[q.id] === undefined) return;
    setCheckedClosed(prev => ({ ...prev, [q.id]: true }));
  };

  if (!current) {
    return (
      <div className="space-y-6">
        <Card title="Quiz e Autovalutazione">
          <p className="text-gray-600">Nessuna domanda per il filtro selezionato.</p>
        </Card>
      </div>
    );
  }

  const sectionClass = SECTION_COLORS[current.section];

  return (
    <div className="space-y-6">
      <Card title="Quiz e Autovalutazione">
        <QuizHeader />

        <QuizStats totalQuestions={totalQuestions} closedScore={closedScore} />

        <QuizControls
          part={part}
          sectionFilter={sectionFilter}
          onPartChange={p => resetIndexOnFilter(p, sectionFilter)}
          onSectionChange={s => resetIndexOnFilter(part, s)}
        />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-sm text-gray-600">
          <span>
            {part === 'A' ? 'Parte A — Risposta aperta' : 'Parte B — Risposta chiusa'} · Domanda{' '}
            <strong>{current.id}</strong> ({currentIndex + 1} di {questions.length}
            {sectionFilter !== 'tutte' ? ' nel modulo' : ''})
          </span>
          <div className="flex gap-1">
            <Button variant="secondary" onClick={goPrev} disabled={currentIndex === 0}>
              <ChevronLeft size={16} />
            </Button>
            <Button variant="secondary" onClick={goNext} disabled={currentIndex >= questions.length - 1}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        <div className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border mb-3 ${sectionClass}`}>
          {current.section}
        </div>

        <p className="text-gray-900 font-medium mb-4 leading-relaxed">{current.text}</p>

        {part === 'A' ? (
          <OpenAnswerBlock
            questionId={current.id}
            value={openAnswers[current.id] ?? ''}
            onChange={v => setOpenAnswers(prev => ({ ...prev, [current.id]: v }))}
          />
        ) : (
          <ClosedAnswerBlock
            question={current as ClosedQuestion}
            selected={selectedOptions[current.id]}
            checked={checkedClosed[current.id] ?? false}
            onSelect={idx => {
              setSelectedOptions(prev => ({ ...prev, [current.id]: idx }));
              setCheckedClosed(prev => ({ ...prev, [current.id]: false }));
            }}
            onCheck={() => handleCheckClosed(current as ClosedQuestion)}
          />
        )}

        <QuestionIndex
          questions={questions}
          currentIndex={currentIndex}
          part={part}
          selectedOptions={selectedOptions}
          checkedClosed={checkedClosed}
          openAnswers={openAnswers}
          onSelect={setCurrentIndex}
        />
      </Card>
    </div>
  );
};

const QuizHeader: React.FC = () => (
  <div className="mb-6 pb-4 border-b border-gray-100">
    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
      Università Cattolica del Sacro Cuore · Facoltà di Scienze Agrarie, Alimentari e Ambientali
    </p>
    <h2 className="text-lg font-semibold text-gray-900">
      Modellistica Applicata alle Produzioni Vegetali
    </h2>
    <p className="text-sm text-gray-600 mt-1">
      Modulo Coltivazioni Erbacee — Prof. Stefano Amaducci · Prova di valutazione (100 domande)
    </p>
    <p className="text-sm text-gray-500 mt-2">
      <strong>Parte A (D1–D50):</strong> risposta aperta ·{' '}
      <strong>Parte B (D51–D100):</strong> una sola risposta corretta per domanda
    </p>
    <p className="text-xs text-gray-500 mt-2 italic">
      Nota: i valori parametrici (es. temperature cardinali di mais e frumento) seguono il
      materiale del corso e possono differire dai preset usati nel simulatore. In sede di prova
      fa fede il materiale del corso.
    </p>
  </div>
);

const QuizStats: React.FC<{
  totalQuestions: number;
  closedScore: { correct: number; answered: number; total: number };
}> = ({ totalQuestions, closedScore }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
      <div className="text-2xl font-bold text-indigo-700">{totalQuestions}</div>
      <div className="text-sm text-indigo-700">Domande disponibili</div>
    </div>
    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
      <div className="text-2xl font-bold text-emerald-700">
        {closedScore.answered > 0 ? `${closedScore.correct}/${closedScore.answered}` : '—'}
      </div>
      <div className="text-sm text-emerald-700">Corrette (Parte B verificate)</div>
    </div>
    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex items-center gap-2">
      <HelpCircle size={16} className="text-amber-700 shrink-0" />
      <span className="text-sm text-amber-800">
        Usa l&apos;indice in fondo per saltare tra le domande del modulo selezionato.
      </span>
    </div>
  </div>
);

const QuizControls: React.FC<{
  part: Part;
  sectionFilter: QuizSection | 'tutte';
  onPartChange: (p: Part) => void;
  onSectionChange: (s: QuizSection | 'tutte') => void;
}> = ({ part, sectionFilter, onPartChange, onSectionChange }) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-6">
    <div className="flex rounded-lg border border-gray-200 overflow-hidden shrink-0">
      <button
        type="button"
        onClick={() => onPartChange('A')}
        className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 ${
          part === 'A' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <BookOpen size={15} />
        Parte A (D1–D50)
      </button>
      <button
        type="button"
        onClick={() => onPartChange('B')}
        className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 border-l border-gray-200 ${
          part === 'B' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <ListChecks size={15} />
        Parte B (D51–D100)
      </button>
    </div>
    <select
      value={sectionFilter}
      onChange={e => onSectionChange(e.target.value as QuizSection | 'tutte')}
      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-800"
      aria-label="Filtra per modulo"
    >
      <option value="tutte">Tutti i moduli</option>
      {QUIZ_SECTIONS.map(s => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  </div>
);

const OpenAnswerBlock: React.FC<{
  questionId: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ questionId, value, onChange }) => (
  <div>
    <label htmlFor={`answer-${questionId}`} className="block text-sm font-medium text-gray-700 mb-2">
      La tua risposta
    </label>
    <textarea
      id={`answer-${questionId}`}
      rows={6}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Scrivi la risposta qui (o su foglio separato)..."
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y min-h-[120px]"
    />
    <p className="text-xs text-gray-500 mt-2">
      Le risposte aperte non vengono valutate automaticamente: confronta con gli appunti del corso.
    </p>
  </div>
);

const ClosedAnswerBlock: React.FC<{
  question: ClosedQuestion;
  selected: number | undefined;
  checked: boolean;
  onSelect: (idx: number) => void;
  onCheck: () => void;
}> = ({ question, selected, checked, onSelect, onCheck }) => {
  const isCorrect = checked && selected === question.correctIndex;
  const isWrong = checked && selected !== undefined && selected !== question.correctIndex;

  return (
    <div className="space-y-3">
      <fieldset className="space-y-2">
        {question.options.map((opt, idx) => {
          const label = OPTION_LABELS[idx];
          const isSelected = selected === idx;
          const showCorrect = checked && idx === question.correctIndex;
          const showWrong = checked && isSelected && idx !== question.correctIndex;

          let ring = 'border-gray-200 hover:border-indigo-300';
          if (isSelected && !checked) ring = 'border-indigo-500 bg-indigo-50';
          if (showCorrect) ring = 'border-emerald-500 bg-emerald-50';
          if (showWrong) ring = 'border-red-400 bg-red-50';

          return (
            <label
              key={label}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${ring}`}
            >
              <input
                type="radio"
                name={question.id}
                checked={isSelected}
                onChange={() => onSelect(idx)}
                className="mt-1 shrink-0"
                disabled={checked}
              />
              <span className="text-sm text-gray-800">
                <strong className="mr-1.5">{label})</strong>
                {opt}
              </span>
              {showCorrect && <CheckCircle size={18} className="text-emerald-600 shrink-0 ml-auto" />}
            </label>
          );
        })}
      </fieldset>

      {!checked && (
        <Button onClick={onCheck} disabled={selected === undefined}>
          Verifica risposta
        </Button>
      )}

      {isCorrect && (
        <p className="text-sm text-emerald-700 font-medium flex items-center gap-1.5">
          <CheckCircle size={16} /> Risposta corretta.
        </p>
      )}
      {isWrong && (
        <p className="text-sm text-red-700">
          Risposta errata. Quella corretta è <strong>{OPTION_LABELS[question.correctIndex]}</strong>.
        </p>
      )}
    </div>
  );
};

const QuestionIndex: React.FC<{
  questions: { id: string }[];
  currentIndex: number;
  part: Part;
  selectedOptions: Record<string, number>;
  checkedClosed: Record<string, boolean>;
  openAnswers: Record<string, string>;
  onSelect: (i: number) => void;
}> = ({ questions, currentIndex, part, selectedOptions, checkedClosed, openAnswers, onSelect }) => (
  <div className="mt-8 pt-6 border-t border-gray-100">
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Indice domande</p>
    <div className="flex flex-wrap gap-1.5">
      {questions.map((q, i) => {
        const closedQ = CLOSED_QUESTIONS.find(c => c.id === q.id);
        const isClosedVerified = part === 'B' && checkedClosed[q.id] && closedQ !== undefined;
        const verifiedCorrect = isClosedVerified && selectedOptions[q.id] === closedQ!.correctIndex;
        const verifiedWrong = isClosedVerified && selectedOptions[q.id] !== closedQ!.correctIndex;
        const openAnswered = part === 'A' && Boolean(openAnswers[q.id]?.trim());
        const selectedNotVerified =
          part === 'B' && selectedOptions[q.id] !== undefined && !checkedClosed[q.id];

        let btnClass = 'bg-white text-gray-700 border-gray-200 hover:border-indigo-400';
        if (i === currentIndex) btnClass = 'bg-indigo-600 text-white border-indigo-600';
        else if (verifiedCorrect || openAnswered) btnClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        else if (verifiedWrong) btnClass = 'bg-red-100 text-red-800 border-red-300';
        else if (selectedNotVerified) btnClass = 'bg-amber-50 text-amber-800 border-amber-200';

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => onSelect(i)}
            className={`w-9 h-9 text-xs font-medium rounded border transition-colors ${btnClass}`}
            title={q.id}
          >
            {q.id.replace('D', '')}
          </button>
        );
      })}
    </div>
    {part === 'B' && (
      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
          corretta
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-red-100 border border-red-300" />
          sbagliata
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-amber-50 border border-amber-200" />
          selezionata, non verificata
        </span>
      </div>
    )}
  </div>
);


