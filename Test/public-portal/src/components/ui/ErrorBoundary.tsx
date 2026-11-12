import { Component, type ReactNode } from 'react';

interface Props {
  fallback: ReactNode;
  children: ReactNode;
}
interface State {
  failed: boolean;
}

/** Used around 3D so any WebGL / asset failure degrades to static imagery. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
