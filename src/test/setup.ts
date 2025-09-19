// Add any global test setup here
// When you install @testing-library/jest-dom, uncomment:
// import '@testing-library/jest-dom';

// Mock window.AudioContext if needed for tests
global.AudioContext = class AudioContext {
  createOscillator() {
    return {
      connect: () => this,
      start: () => {},
      stop: () => {},
      addEventListener: () => {},
      disconnect: () => {},
      frequency: { value: 0 },
    };
  }
  createGain() {
    return {
      connect: () => this,
      disconnect: () => {},
      gain: { value: 0 },
    };
  }
  get destination() {
    return {};
  }
  get currentTime() {
    return 0;
  }
  get state() {
    return 'running';
  }
  resume() {
    return Promise.resolve();
  }
} as any;