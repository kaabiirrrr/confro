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
                <div className="mb-4 md:mb-6 transform transition-transform duration-500 flex justify-center ml-[-16px] md:ml-[-32px]">
                  <img 
                    src="/ChatGPT Image May 6, 2026, 02_39_23 PM.png" 
                    alt="Error Illustration" 
                    className="w-64 h-64 md:w-[480px] md:h-[480px] object-contain"
                  />
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
                    className="px-8 py-2.5 md:px-12 md:py-3.5 bg-accent hover:bg-accent/90 text-white rounded-full font-semibold text-sm md:text-lg transition-all duration-300 shadow-lg shadow-accent/20 active:scale-95 min-w-[140px] md:min-w-[200px]"
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
