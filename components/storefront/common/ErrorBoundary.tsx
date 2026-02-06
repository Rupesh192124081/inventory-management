import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-rose-600" />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">Something went wrong</h2>
                        <p className="text-slate-500 mb-6">We encountered an error loading this content.</p>
                        <button
                            onClick={this.handleRetry}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" /> Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
