// Plugins enable you to tap into, modify, or extend the internal behavior of Cypress
// For more info, visit https://on.cypress.io/plugins-api
const initCypressMousePositionPlugin = require('cypress-mouse-position/plugin');

module.exports = (on, config) => {
  initCypressMousePositionPlugin(on);
}
