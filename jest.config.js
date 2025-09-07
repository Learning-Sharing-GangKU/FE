module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/tests/unit/**/*.test.(ts|tsx)',
    '**/*.unit.test.(ts|tsx)',
    '**/tests/integration/**/*.test.(ts|tsx)',
    '**/*.it.test.(ts|tsx)'
  ],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' }
};
