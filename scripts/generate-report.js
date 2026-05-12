const report = require('multiple-cucumber-html-reporter');

report.generate({
  jsonDir: 'test-results/cucumber-json',
  reportPath: 'test-results/cucumber-html-report',
  metadata: {
    browser: {
      name: 'edge',
      version: 'latest',
    },
    device: 'Local Test Machine',
    platform: {
      name: 'windows',
    },
  },
  customData: {
    title: 'Max Command Test Execution Report',
    data: [
      { label: 'Project', value: 'Max Command - Logix Alert Management' },
      { label: 'Release', value: '1.0.0' },
      { label: 'Execution Start Time', value: new Date().toLocaleString() },
    ],
  },
});
