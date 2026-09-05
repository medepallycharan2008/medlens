import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Automatically cleanup DOM after each test
afterEach(() => {
  cleanup();
});

// In-memory mock for localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => {
      return store[key] || null;
    },
    setItem: (key: string, value: string): void => {
      store[key] = String(value);
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock Tesseract.js for fast, deterministic, offline test execution
vi.mock('tesseract.js', () => {
  return {
    default: {
      recognize: vi.fn().mockImplementation(async (_file, _lang, options) => {
        if (options?.logger) {
          options.logger({ status: 'recognizing text', progress: 0.5 });
          options.logger({ status: 'recognizing text', progress: 1.0 });
        }
        return {
          data: {
            text: `APOLLO CLINICAL LABS
Patient Report | Date: 05-Sep-2026
Hemoglobin 13.5 g/dL 12.0 - 16.0
Total Leukocyte Count 7200 /cumm 4000 - 10500
Platelet Count 240000 /cumm 150000 - 450000
Serum Creatinine 0.9 mg/dL 0.6 - 1.2
Random Blood Sugar 110 mg/dL 70 - 140
Total Cholesterol 185 mg/dL < 200`,
            confidence: 94,
            lines: []
          }
        };
      })
    }
  };
});

// Clean storage before each test
beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});
