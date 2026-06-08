import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

export default async (): Promise<Config> => {
  const baseConfig = {
    coverageProvider: 'v8' as const,
    setupFiles: ['<rootDir>/jest.env.setup.ts'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
    },
  };

  const frontendConfig = await createJestConfig({
    ...baseConfig,
    displayName: 'frontend',
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/__tests__/components/**/*.test.tsx', '<rootDir>/__tests__/components/**/*.test.ts'],
  })();

  const backendConfig = await createJestConfig({
    ...baseConfig,
    displayName: 'backend',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/__tests__/api/**/*.test.ts', '<rootDir>/__tests__/services/**/*.test.ts', '<rootDir>/__tests__/db/**/*.test.ts', '<rootDir>/__tests__/utils/**/*.test.ts'],
  })();

  return {
    coverageThreshold: {
      global: { lines: 80 },
    },
    collectCoverageFrom: ['lib/**', 'components/**', '!components/ui/**'],
    projects: [frontendConfig, backendConfig],
  };
};
