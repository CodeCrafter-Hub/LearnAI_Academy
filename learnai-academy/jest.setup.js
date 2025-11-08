// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.JWT_SECRET = 'test-secret-key-minimum-32-characters-long-for-testing'
process.env.JWT_EXPIRES_IN = '7d'
process.env.NODE_ENV = 'test'
