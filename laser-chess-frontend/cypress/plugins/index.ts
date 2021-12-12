// Plugins enable you to tap into, modify, or extend the internal behavior of Cypress
// For more info, visit https://on.cypress.io/plugins-api
import * as webpackConfig from './webpack.config';
const { startDevServer } = require('@cypress/webpack-dev-server');
const initCypressMousePositionPlugin = require('cypress-mouse-position/plugin');

module.exports = (on, config) => {
  initCypressMousePositionPlugin(on);
  on('dev-server:start', (options) =>
  startDevServer({
    options,
    webpackConfig,
    }),
  );
  return config;
}
