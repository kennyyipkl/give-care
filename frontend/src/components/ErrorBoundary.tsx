import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "50vh",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💥</div>
          <h1 style={{ marginBottom: "0.5rem" }}>Something went wrong</h1>
          <p
            style={{
              color: "var(--color-text-light)",
              marginBottom: "2rem",
              maxWidth: 500,
              lineHeight: 1.7,
            }}
          >
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            className="btn btn-primary"
            onClick={this.handleReset}
          >
            🔄 Try Again
          </button>
          <button
            className="btn btn-outline"
            style={{ marginTop: "0.75rem" }}
            onClick={() => window.location.reload()}
          >
            🔁 Refresh Page
          </button>
          {this.state.error && (
            <details
              style={{
                marginTop: "2rem",
                color: "var(--color-text-muted)",
                fontSize: "0.8rem",
                textAlign: "left",
                maxWidth: 500,
              }}
            >
              <summary>Error Details</summary>
              <pre style={{ marginTop: "0.5rem", whiteSpace: "pre-wrap" }}>
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}