// Jest test setup
import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.ADMIN_PASSWORD = 'test123';

// Global test timeout
jest.setTimeout(10000);

// Mock localStorage for browser tests
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// Mock fetch
global.fetch = jest.fn();

// Suppress console logs in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
