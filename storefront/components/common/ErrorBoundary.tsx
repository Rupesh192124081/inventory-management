import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = { hasError: false, error: null };

    constructor(props: Props) {
        super(props);
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-rose-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-rose-600" />
                        </div>
                        <h2 className="text-2xl font-black mb-3">Something Went Wrong</h2>
                        <p className="text-slate-500 mb-6">
                            We encountered an unexpected error. Please try again or refresh the page.
                        </p>
                        <button
                            onClick={this.handleRetry}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left bg-slate-100 rounded-xl p-4">
                                <summary className="font-bold text-sm cursor-pointer">Error Details</summary>
                                <pre className="mt-2 text-xs text-rose-600 overflow-auto">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
