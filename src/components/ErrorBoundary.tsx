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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white dark:bg-[#171717] border border-[#E8DFC8] dark:border-[#2E2E2E] rounded-2xl p-6 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-300 mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-[#171717] dark:text-[#FFFDF7] mb-2">
              Unable to complete request
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5 break-words">
              {friendlyMessage}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#171717] dark:bg-[#D6A84F] text-white dark:text-[#171717] text-sm font-medium hover:bg-[#262626] dark:hover:brightness-110 transition-colors flex items-center justify-center gap-2"
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
