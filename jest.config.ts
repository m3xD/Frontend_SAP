import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
    '\\.svg$': '<rootDir>/src/__mocks__/svgrMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/src/types/'],
  coverageDirectory: '.qodana/code-coverage/',
  coverageReporters: ['lcovonly', 'text', 'html'],
};

export default config;
