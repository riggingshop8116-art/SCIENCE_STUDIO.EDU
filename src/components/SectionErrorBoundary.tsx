import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  sectionName?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in section [${this.props.sectionName || 'workspace'}]:`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-2xl mx-auto my-8 p-6 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              {this.props.sectionName ? `${this.props.sectionName} লোড করতে সাময়িক সমস্যা হয়েছে` : 'সেকশনটি লোড করতে সমস্যা হয়েছে'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              একটি সাময়িক লোডিং ত্রুটি ঘটেছে। পুনরায় চেষ্টা করতে নিচের বাটনে ক্লিক করুন।
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 mx-auto cursor-pointer shadow-lg active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            পুনরায় লোড করুন (Retry)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;
