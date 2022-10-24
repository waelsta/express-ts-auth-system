import type { JestConfigWithTsJest } from 'ts-jest';
const jestConfing: JestConfigWithTsJest = {
  roots: ['src'],
  moduleFileExtensions: ['js', 'ts'],
  extensionsToTreatAsEsm: ['.ts'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts?$': [
      'ts-jest',
      {
        useESM: false
      }
    ]
  },
  transformIgnorePatterns: ['/node_modules/']
};

export default jestConfing;
