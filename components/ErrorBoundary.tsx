
import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (typeof console !== 'undefined') {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error, this.reset);
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F0F9FF] text-center">
          <div className="text-7xl mb-4">🐝💥</div>
          <h2 className="text-2xl font-black text-blue-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-blue-400 font-bold text-sm max-w-sm mb-6">
            Chú Ong gặp sự cố. Hãy thử tải lại trang nhé!
          </p>
          <div className="flex gap-3">
            <button
              onClick={this.reset}
              className="px-6 py-3 bg-white border-2 border-blue-200 text-blue-600 font-black rounded-2xl shadow-sm active:scale-95 transition-all"
            >
              Thử lại
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-500 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all"
            >
              Tải lại trang
            </button>
          </div>
          {this.state.error?.message && (
            <pre className="mt-6 text-xs text-blue-300 max-w-md overflow-x-auto bg-white/50 p-3 rounded-xl">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
