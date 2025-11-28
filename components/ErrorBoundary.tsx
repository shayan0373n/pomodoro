import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        localStorage.clear();
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 text-center">
                    <h1 className="text-3xl font-bold text-rose-500 mb-4">Something went wrong.</h1>
                    <p className="text-gray-300 mb-6 max-w-md">
                        An error occurred in the application.
                    </p>
                    
                    <div className="bg-gray-800 p-4 rounded-lg text-left overflow-auto max-w-2xl w-full mb-6 border border-gray-700">
                        <p className="text-red-400 font-mono text-sm mb-2">
                            {this.state.error && this.state.error.toString()}
                        </p>
                        <pre className="text-gray-500 font-mono text-xs">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold transition-colors"
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={this.handleReset}
                            className="px-6 py-2 bg-rose-600 hover:bg-rose-500 rounded-full font-bold transition-colors"
                        >
                            Reset All Data
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
