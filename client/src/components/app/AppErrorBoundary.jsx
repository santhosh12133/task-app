import { Component } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Application render error:', error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="grid min-h-screen place-items-center bg-bg px-4">
        <Card className="max-w-lg border-white/10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Application error</p>
          <h1 className="mt-3 text-3xl font-black text-text">The app hit an unexpected problem.</h1>
          <p className="mt-3 text-sm leading-7 text-muted">
            Refresh the page to recover. If the issue keeps happening, check the latest changes or server logs.
          </p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => window.location.reload()}>Reload application</Button>
          </div>
        </Card>
      </div>
    );
  }
}
