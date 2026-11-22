import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      let friendlyMessage =
        'Something went wrong while syncing with Your Need. Please try again.';
      try {
        const parsed = JSON.parse(this.state.errorMessage);
        if (parsed?.error) {
          friendlyMessage = `Action blocked (${parsed.operationType || 'operation'}): ${parsed.error}`;
        }
      } catch {
        if (this.state.errorMessage) {
          friendlyMessage = this.state.errorMessage;
        }
      }

      return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#07130F] flex items-center justify-center p-6">
          <div className="w-full max-w-md yn-glass-card yn-tricolor-border rounded-2xl p-6 shadow-xl">
            <div className="w-11 h-11 rounded-xl bg-[#FF9933]/15 border border-[#FF9933]/35 flex items-center justify-center text-[#E87516] dark:text-[#FFB866] mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-[#18231E] dark:text-[#FFFDF8] mb-2">
              Unable to complete request
            </h2>
            <p className="text-sm text-[#43564D] dark:text-[#9CB0A6] leading-relaxed mb-5 break-words">
              {friendlyMessage}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl yn-btn-saffron text-sm font-medium flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Return to Your Need</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
