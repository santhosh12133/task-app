module.exports = {
  projects: [
    {
      displayName: 'api',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/jest/**/*.test.js'],
      collectCoverageFrom: [
        'app.js',
        'config/**/*.js',
        'middleware/**/*.js',
        'routes/**/*.js',
        'utils/**/*.js',
        'validation/**/*.js',
        '!utils/socket.js',
      ],
    },
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/src/**/*.test.jsx'],
      setupFilesAfterEnv: ['<rootDir>/client/src/test/setupTests.js'],
      collectCoverageFrom: [
        'client/src/**/*.{js,jsx}',
        '!client/src/main.jsx',
        '!client/src/index.css',
        '!client/src/lib/cn.js',
      ],
      moduleFileExtensions: ['js', 'jsx'],
      transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
      },
    },
  ],
};
