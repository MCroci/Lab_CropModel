import React, { memo } from 'react';
import { Download, ChevronDown } from 'lucide-react';
export { LoadingSpinner } from './LoadingSpinner';

export const Card: React.FC<{ title: string; children: React.ReactNode; className?: string, headerAction?: React.ReactNode }> = memo(({ title, children, className = "", headerAction }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{title}</h3>
      {headerAction && <div>{headerAction}</div>}
    </div>
    <div className="p-4 sm:p-6">
      {children}
    </div>
  </div>
));

Card.displayName = 'Card';

export const DownloadAction: React.FC<{ data: unknown[], filename: string }> = ({ data, filename }) => {
  const handleDownload = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn("Nessun dato da scaricare.");
      return;
    }
    const headers = Object.keys(data[0] as Record<string, unknown>);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const val = (row as Record<string, unknown>)[header];
        return val === null || val === undefined ? '' : String(val);
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Fix memory leak
  };

  return (
    <button 
      onClick={handleDownload} 
      className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-2 py-1 rounded transition-colors" 
      title="Scarica dati CSV"
    >
      <Download size={14} />
      <span>CSV</span>
    </button>
  );
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
  unit?: string;
  description?: string;
  hintMode?: 'text' | 'tooltip' | 'both';
}

export const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange, unit, description, hintMode = 'text' }) => {
  const showTooltip = Boolean(description) && (hintMode === 'tooltip' || hintMode === 'both');
  const showText = Boolean(description) && (hintMode === 'text' || hintMode === 'both');

  return (
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <label className="text-sm md:text-base font-medium text-gray-700 truncate">{label}</label>
          {showTooltip && (
            <span className="relative group inline-flex">
              <button
                type="button"
                className="w-5 h-5 inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-600 text-xs font-semibold bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                aria-label={`Info: ${label}`}
              >
                i
              </button>
              <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                {description}
              </span>
            </span>
          )}
        </div>
        <span className="text-sm md:text-base font-bold text-brand-600">{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-3 md:h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 touch-manipulation"
        style={{ WebkitAppearance: 'none', appearance: 'none' }}
      />
      {showText && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
};

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary', className = "", disabled = false }) => {
  const baseClasses = "px-4 py-3 md:py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation min-h-[44px] md:min-h-0";
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 focus:ring-brand-500",
    secondary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-300",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

interface SelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  description?: string;
}

export const Select: React.FC<SelectProps> = ({ label, value, options, onChange, description }) => {
  return (
    <div className="mb-5">
      <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-3 md:py-2 px-3 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-base md:text-sm touch-manipulation min-h-[44px] md:min-h-0"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <ChevronDown size={16} />
        </div>
      </div>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
};