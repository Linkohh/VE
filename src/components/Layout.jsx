import React from 'react';

function Layout({ children, effectsEnabled = true }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-0 gradient-bg relative overflow-hidden">
      <div id="edge-hotzone" aria-hidden="true"></div>
      {effectsEnabled && (
        <>
          <div id="mouse-glow" className="mouse-glow" aria-hidden="true"></div>
          <div id="matrix-bg" className="matrix-bg" aria-hidden="true"></div>
          <canvas id="matrix-canvas" className="matrix-canvas" aria-hidden="true"></canvas>
        </>
      )}
      <main id="main-content" className="w-full relative z-10 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-sm border-t border-white/10 text-center py-2 z-[9999]">
        <div className="container mx-auto px-4">
          <p className="text-sm text-white/70">
            Copyright © 2025 VibeMe By LHO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
