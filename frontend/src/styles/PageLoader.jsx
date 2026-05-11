import React, { useState, useEffect } from 'react';

// Main Loader
const PageLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
          }, 300);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-lime-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Main Loader Content */}
      <div className="relative z-10 text-center">
        {/* Logo/Icon */}
        <div className="mb-8">
         <div className="w-20 h-20 mx-auto flex items-center justify-center animate-pulse">
  <img src="https://img.icons8.com/?size=100&id=4Xem_S1LR0kT&format=png&color=40C057" width="80" height="80" />
</div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-white mb-8 animate-pulse">
          Loading...
        </h2>

        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Spinning Ring */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10">
          <div className="w-32 h-32 border-t-2 border-r-2 border-green-500 rounded-full animate-spin opacity-30"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

// Wrapper Loader
export const WithPageLoader = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <PageLoader onComplete={() => setIsLoading(false)} />}
      <div className={isLoading ? 'hidden' : 'block'}>
        {children}
      </div>
    </>
  );
};

// Demo Component (optional for testing only)
export const LoaderDemo = () => {
  const [showLoader, setShowLoader] = useState(false);

  const triggerLoader = () => {
    setShowLoader(true);
    setTimeout(() => setShowLoader(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      {showLoader && <PageLoader onComplete={() => setShowLoader(false)} />}

      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Plant App Loader Demo</h1>
        <p className="text-gray-600">Click to see the green-themed loading animation</p>

        <button
          onClick={triggerLoader}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Show Loader
        </button>
      </div>
    </div>
  );
};

// Default export
export default PageLoader;
