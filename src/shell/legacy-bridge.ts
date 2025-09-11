import { initMatrix, updateMatrix, teardownMatrix } from '../features/matrix/engine';

// Ensure TypeScript knows about the global VibeMe stub used by the legacy code.
declare global {
  interface Window {
    VibeMe?: {
      startMatrixAnimation?: () => void;
      stopMatrixAnimation?: () => void;
      reinitMatrix?: () => void;
      updateMatrixConfig?: () => void;
      [key: string]: any;
    };
  }
}

/**
 * Load the legacy bundle and patch any matrix related hooks so that
 * calls from the old runtime are routed to the modern matrix engine.
 */
export async function bridgeLegacy(): Promise<void> {
  // Load the legacy script which defines window.VibeMe
  await import('../legacy/main-legacy.js');

  const vibeme = (window.VibeMe ||= {});

  // Bridge legacy matrix helpers to the new engine implementation
  vibeme.startMatrixAnimation = initMatrix;
  vibeme.stopMatrixAnimation = teardownMatrix;
  vibeme.reinitMatrix = updateMatrix;
  vibeme.updateMatrixConfig = updateMatrix;
}
