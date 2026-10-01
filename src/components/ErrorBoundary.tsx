import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Rendered instead of the children once they have thrown. */
  fallback?: ReactNode;
  /** Prefixes the console report so the failing area is identifiable. */
  label?: string;
}

interface State {
  failed: boolean;
}

/**
 * Stops one broken subtree from taking the page with it.
 *
 * React 18 unmounts the WHOLE tree when a render or an effect throws and no
 * boundary catches it, so without one of these a decorative background that
 * fails on an unusual machine blanks the entire site. That is not a
 * hypothetical: ogl's Renderer throws inside its own constructor when
 * getContext returns null — which is what a browser does with hardware
 * acceleration turned off — and it blanked the home page on scroll.
 *
 * Anything optional and self-contained belongs behind one of these.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Swallowing it silently would make this very hard to find later.
    console.error(`[${this.props.label ?? "ErrorBoundary"}] caught`, error, info.componentStack);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export default ErrorBoundary;
