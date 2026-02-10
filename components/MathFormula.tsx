import React from 'react';
import katex from 'katex';

interface MathFormulaProps {
  formula: string;
  display?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ formula, display = false, className = '' }) => {
  try {
    const html = katex.renderToString(formula, {
      displayMode: display,
      throwOnError: false,
      output: 'html',
    });
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <span className={`font-mono text-sm ${className}`}>{formula}</span>;
  }
};
