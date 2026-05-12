/**
 * Test data management
 * Centralized location for test data, fixtures, and constants
 */

export const testData = {
  users: {
    standard: {
      username: process.env.TEST_USERNAME || '',
      password: process.env.TEST_PASSWORD || '',
    },
    admin: {
      username: process.env.ADMIN_USERNAME || '',
      password: process.env.ADMIN_PASSWORD || '',
    },
  },

  urls: {
    base: process.env.BASE_URL || '',
    api: process.env.BASE_URL_API || '',
    login: process.env.LOGIN_URL || process.env.BASE_URL || '',
    app: process.env.APP_URL || '',
  },

  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
  },

  waitTimes: {
    elementVisible: 10000,
    pageLoad: 30000,
    networkIdle: 30000,
    extraBuffer: 5000,
  },
};

export default testData;
