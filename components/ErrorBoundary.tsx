import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { I18nProvider, useI18n } from '../i18n/I18nContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<Props, State> {
  public state: State;
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} />;
    }

    return this.props.children;
  }
}

const ErrorDisplay: React.FC<{ error: Error | null }> = ({ error }) => {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-600" size={32} />
          <h1 className="text-2xl font-bold text-gray-900">{t.error.title}</h1>
        </div>
        <p className="text-gray-700 mb-4">
          {t.error.message}
        </p>
        {error && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-gray-600 mb-2">
              {t.error.technicalDetails}
            </summary>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-48">
              {error.toString()}
              {error.stack}
            </pre>
          </details>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          {t.error.reload}
        </button>
      </div>
    </div>
  );
};

export const ErrorBoundary: React.FC<Props> = ({ children }) => {
  return (
    <I18nProvider>
      <ErrorBoundaryInner>{children}</ErrorBoundaryInner>
    </I18nProvider>
  );
};

