before(() => {
  cy.request({ // log in
    method: 'POST',
    url: `${Cypress.env('EXTERNAL_API')}${Cypress.env('API_PREFIX')}${Cypress.env('LOGIN_URL')}`,
    form: true,
    body: {
      "username": "string",
      "password": "string"
    }
  }).then(res => {
    cy.request({ // create and start game
      method: 'POST',
      url: `${Cypress.env('EXTERNAL_API')}${Cypress.env('API_PREFIX')}${Cypress.env('START_GAME_URL')}`,
      headers: {
        "Authorization" : `Bearer ${res.body.access_token}`
      },
      body: {
        "game_id": "test",
        "player_one_id": "string",
        "player_two_id": "string"
      }
    })
  })



})

describe('Gameplay tests', () => {
  it('Loads game', () => {
    cy.visit("/game/string")
  })
})
