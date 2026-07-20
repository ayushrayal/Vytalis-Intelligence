import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught an error]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/20 backdrop-blur-xl text-slate-200 my-4 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">
                {this.props.fallbackTitle || 'Something went wrong rendering this component'}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {this.props.fallbackMessage || this.state.error?.message || 'An unexpected rendering error occurred.'}
              </p>
              <button
                onClick={this.handleReset}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-200 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
