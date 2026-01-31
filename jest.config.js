module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/scenes/**/*.js',
    '!src/index.js',
    '!src/config/gameConfig.js'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/src/**/*.test.js'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@scenes/(.*)$': '<rootDir>/src/scenes/$1',
    '^@entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@systems/(.*)$': '<rootDir>/src/systems/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(phaser)/)'
  ]
};
