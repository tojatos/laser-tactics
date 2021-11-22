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
    const access_token = res.body.access_token
    localStorage.setItem('access_token', access_token)
    cy.request({ // create and start game
      method: 'POST',
      url: `${Cypress.env('EXTERNAL_API')}${Cypress.env('API_PREFIX')}${Cypress.env('START_GAME_URL')}`,
      headers: {
        "Authorization" : `Bearer ${access_token}`
      },
      body: {
        "game_id": "test2",
        "player_one_id": "string",
        "player_two_id": "string2"
      }
    })
  })
})

describe('Gameplay tests', () => {

  const getCell = (gc: any, posX: number, posY: number) =>  gc.game.board.cells.find((c : any) => c.coordinates.x == posX && c.coordinates.y == posY)

  it('Test moving', () => {
    let angular: any

    cy.visit("/game/test2")
    cy.get('canvas')
    .then(() => {
      cy.window().then(win => {
        angular = (win as any).ng;
      })
      .then(() => cy.document())
      .then((doc) => {
        const gameComponent = angular.getComponent(doc.querySelector("app-board"))
        const pressPosition = getCell(gameComponent, 5, 1)
        const pressPositionNext = getCell(gameComponent, 5, 2)
        expect(pressPosition.piece).to.be.ok
        expect(pressPositionNext.piece).to.be.not.ok

        cy.get('canvas').click(pressPosition.canvasCoordinates.x, pressPosition.canvasCoordinates.y)
        .click(pressPositionNext.canvasCoordinates.x, pressPositionNext.canvasCoordinates.y)
        .then(() => {
          cy.wait(1000)
            .then(() => {
              expect(pressPosition.piece).to.be.not.ok
              expect(pressPositionNext.piece).to.be.ok
            })
        })
      })
    })

  })
})


