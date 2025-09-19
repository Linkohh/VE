import '@testing-library/jest-dom';

class MockAudioContext {
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
}

const mockAudioContext = MockAudioContext as unknown as typeof AudioContext;

Object.defineProperty(globalThis, 'AudioContext', {
  configurable: true,
  writable: true,
  value: mockAudioContext,
});

Object.defineProperty(globalThis, 'webkitAudioContext', {
  configurable: true,
  writable: true,
  value: mockAudioContext,
});
