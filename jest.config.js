"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jestConfing = {
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
exports.default = jestConfing;
