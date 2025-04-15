import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryInnerProps {
  children: ReactNode;
  onError: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryInnerState {
  hasError: boolean;
}

// Inner component that uses the class component error boundary API
class ErrorBoundaryInner extends Component<ErrorBoundaryInnerProps, ErrorBoundaryInnerState> {
  constructor(props: ErrorBoundaryInnerProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryInnerState {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error and call the onError callback
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.props.onError(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return null; // Return null to let the functional wrapper handle the fallback UI
    }

    return this.props.children;
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Functional wrapper component with hooks for state management
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children, fallback }) => {
  const [hasError, setHasError] = React.useState(false);

  const handleError = React.useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <h3 className="font-medium">Something went wrong</h3>
        <p>Please try loading the projection again or refresh the page.</p>
      </div>
    );
  }

  return (
    <ErrorBoundaryInner onError={handleError}>
      {children}
    </ErrorBoundaryInner>
  );
};

export default ErrorBoundary;