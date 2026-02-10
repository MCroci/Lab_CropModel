import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Card, Button } from '../components/UI';
import { BookOpen, FileCheck } from 'lucide-react';

import manualeContent from '../MANUALE_TEORIA.md?raw';

interface ManualeViewProps {
  onNavigate?: (tab: string) => void;
}

const slugify = (text: string) => String(text).toLowerCase().replace(/\s+/g, '-').replace(/[^\w\u00C0-\u017F-]+/g, '');

// Converte \( \) e \[ \] in $ $ e $$ $$ per remark-math
const convertLatexDelimiters = (text: string): string => {
  let out = text;
  // Block: \[ ... \] → $$ ... $$
  out = out.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
  // Inline: \( ... \) → $ ... $
  out = out.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  return out;
};

export const ManualeView: React.FC<ManualeViewProps> = ({ onNavigate }) => {
  const processed = convertLatexDelimiters(manualeContent);

  return (
    <div className="space-y-6">
      <Card title="Manuale di Teoria" className="border-l-4 border-l-brand-500" headerAction={<BookOpen className="text-brand-500" size={24} />}>
        <p className="text-gray-600 mb-4">
          Documento completo sulla teoria della modellistica delle colture erbacee, con equazioni e concetti fondamentali.
        </p>
        {onNavigate && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Button variant="outline" className="text-sm" onClick={() => onNavigate('exercises')}>
              <FileCheck size={16} />
              Vai agli Esercizi
            </Button>
            <Button variant="outline" className="text-sm" onClick={() => onNavigate('concepts')}>
              <BookOpen size={16} />
              Concetti Base
            </Button>
            <Button variant="outline" className="text-sm" onClick={() => onNavigate('functions')}>
              Logica & Codice
            </Button>
          </div>
        )}
      </Card>
      <Card>
        <div className="prose prose-slate prose-sm max-w-none prose-headings:text-brand-800 prose-headings:font-semibold prose-a:text-brand-600 prose-strong:text-gray-900 prose-table:text-sm">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={{
              h1: ({ children }) => <h1 id={slugify(String(children))} className="text-2xl font-bold border-b border-gray-200 pb-2 mt-8 mb-4 first:mt-0 scroll-mt-4">{children}</h1>,
              h2: ({ children }) => <h2 id={slugify(String(children))} className="text-xl font-bold border-b border-gray-100 pb-2 mt-6 mb-3 scroll-mt-4">{children}</h2>,
              h3: ({ children }) => <h3 id={slugify(String(children))} className="text-lg font-semibold mt-4 mb-2 scroll-mt-4">{children}</h3>,
              p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 text-gray-700">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-700">{children}</ol>,
              li: ({ children }) => <li className="ml-2">{children}</li>,
              table: ({ children }) => <div className="overflow-x-auto my-4"><table className="min-w-full border border-gray-200 rounded-lg">{children}</table></div>,
              th: ({ children }) => <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold">{children}</th>,
              td: ({ children }) => <td className="border border-gray-200 px-3 py-2">{children}</td>,
              tr: ({ children }) => <tr className="hover:bg-gray-50">{children}</tr>,
              code: ({ className, children }) => <code className={(className || '').includes('language') ? 'block p-3 bg-slate-900 text-slate-100 rounded text-xs overflow-x-auto' : 'px-1 py-0.5 bg-slate-200 rounded text-slate-800 font-mono text-sm'}>{children}</code>,
              blockquote: ({ children }) => <blockquote className="border-l-4 border-brand-500 pl-4 my-3 text-gray-600 italic">{children}</blockquote>,
              hr: () => <hr className="my-6 border-gray-200" />,
              a: ({ href, children }) => (
                <a href={href || '#'} className="text-brand-600 hover:text-brand-800 hover:underline" {...(href?.startsWith('#') ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>{children}</a>
              ),
            }}
          >
            {processed}
          </ReactMarkdown>
        </div>
      </Card>
    </div>
  );
};
