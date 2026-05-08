import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col bg-primary text-light-text transition-colors duration-300">
          {/* Static Header Matching Navbar Positioning */}
          <div className="w-full border-b border-white/5">
            <div className="max-w-[1630px] mx-auto h-14 md:h-20 px-4 md:px-8 flex items-center">
              <img
                src="/Logo-LightMode-trimmed.png"
                alt="Logo"
                className="h-7 md:h-12 object-contain block dark:hidden"
              />
              <img
                src="/Logo2.png"
                alt="Logo"
                className="h-6 md:h-10 object-contain hidden dark:block"
              />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-10 md:-mt-20">
            <div className="max-w-2xl w-full p-6 md:p-10 text-center relative">
              <div className="relative z-10">
                <div className="mb-4 md:mb-6 flex justify-center">
                  {/* Inline SVG — works fully offline, no external request */}
                  <svg viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-56 h-56 md:w-80 md:h-80 opacity-80">
                    {/* Cloud body */}
                    <ellipse cx="160" cy="130" rx="100" ry="60" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
                    <ellipse cx="110" cy="145" rx="55" ry="40" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
                    <ellipse cx="210" cy="140" rx="60" ry="42" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
                    <ellipse cx="160" cy="158" rx="95" ry="38" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
                    {/* WiFi off icon center */}
                    <circle cx="160" cy="148" r="8" fill="#38bdf8" opacity="0.9"/>
                    <path d="M136 124 Q160 106 184 124" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.5"/>
                    <path d="M145 133 Q160 122 175 133" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.7"/>
                    {/* Strike-through line */}
                    <line x1="130" y1="108" x2="190" y2="168" stroke="#f87171" strokeWidth="3" strokeLinecap="round"/>
                    {/* Plug icon below */}
                    <rect x="148" y="188" width="24" height="28" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
                    <line x1="154" y1="182" x2="154" y2="188" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="166" y1="182" x2="166" y2="188" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="160" y1="216" x2="160" y2="228" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round"/>
                    {/* Dots animation hint */}
                    <circle cx="130" cy="230" r="4" fill="#334155" opacity="0.6"/>
                    <circle cx="145" cy="235" r="4" fill="#334155" opacity="0.4"/>
                    <circle cx="175" cy="235" r="4" fill="#334155" opacity="0.4"/>
                    <circle cx="190" cy="230" r="4" fill="#334155" opacity="0.6"/>
                  </svg>
                </div>

                <h1 className="text-lg md:text-3xl font-bold tracking-tight text-light-text leading-tight md:whitespace-nowrap mb-2 md:mb-4">
                  Something Went Wrong
                </h1>
                
                <p className="text-xs md:text-base text-text-secondary mb-6 md:mb-8 leading-relaxed md:whitespace-nowrap px-4 md:px-0">
                  Our Team has been notified and we're looking into it.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-8 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-left max-w-lg mx-auto">
                    <p className="text-red-400 text-xs font-mono break-all">
                      {this.state.error.toString()}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-2.5 md:px-12 md:py-3.5 bg-accent hover:bg-accent/90 text-white rounded-full font-bold text-sm md:text-base tracking-widest uppercase transition-all duration-300 active:scale-95 min-w-[140px] md:min-w-[200px]"
                  >
                    Reload
                  </button>
                  <button 
                    onClick={this.handleReset}
                    className="px-8 py-2.5 md:px-12 md:py-3.5 border border-border text-text-secondary hover:bg-hover rounded-full font-semibold text-sm md:text-lg transition-all duration-300 active:scale-95 min-w-[140px] md:min-w-[200px]"
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
