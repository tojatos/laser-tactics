describe('Gameplay tests', () => {

  let angular: any
  let gameComponent: any

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
          "game_id": "test",
          "player_one_id": "string",
          "player_two_id": "string2"
        }
      })
    }).then(() => { //load page
      cy.visit("/game/test")
      cy.get('canvas')
      .then(() => {
        cy.window().then(win => { //get component
          angular = (win as any).ng;
        })
        .then(() => cy.document())
        .then((doc) => {
          gameComponent = angular.getComponent(doc.querySelector("app-board"))
          cy.wait(500).then(() => { // make sure game loaded
            expect(gameComponent.game.board.cells).to.have.length.greaterThan(0)
            cy.get('.mat-slide-toggle-bar').click() //disable animations
          })
    })
  })
    })
  })

  const getCell = (gc: any, posX: number, posY: number) =>  gc.game.board.cells.find((c : any) => c.coordinates.x == posX && c.coordinates.y == posY)

  it('Test moving', () => {
      const pressPosition = getCell(gameComponent, 5, 1)
      const pressPositionNext = getCell(gameComponent, 5, 2)
      expect(pressPosition.piece).to.be.ok
      expect(pressPositionNext.piece).to.be.not.ok

      cy.get('canvas').click(pressPosition.canvasCoordinates.x, pressPosition.canvasCoordinates.y)
      .click(pressPositionNext.canvasCoordinates.x, pressPositionNext.canvasCoordinates.y)
      .then(() => {
        cy.wait(100)
          .then(() => {
            expect(pressPosition.piece).to.be.not.ok
            expect(pressPositionNext.piece).to.be.ok
        })
    })
  })

  it('Test rotation', () => {
    const pressPosition = getCell(gameComponent, 5, 2)
    expect(pressPosition.piece.rotation_degree).to.be.equal(0)
    cy.get('canvas').click(pressPosition.canvasCoordinates.x, pressPosition.canvasCoordinates.y).then(() => {
      cy.get('app-board-actions > :nth-child(1)').click().then(() => {
        expect(gameComponent.game.gameActions.rotation).to.be.equal(270)
      })
      .click().then(() => {
        expect(gameComponent.game.gameActions.rotation).to.be.equal(180)
      })
      .click().then(() => {
        expect(gameComponent.game.gameActions.rotation).to.be.equal(90)
      })
      .click().then(() => {
        expect(gameComponent.game.gameActions.rotation).to.be.equal(0)
      })
      .get('app-board-actions > :nth-child(4)').click().then(() => {
        expect(gameComponent.game.gameActions.rotation).to.be.equal(90)
      })
      .click().then(() => {
        expect(gameComponent.game.gameActions.rotation).to.be.equal(180)
      })
      .click().then(() => {
        expect(gameComponent.game.gameActions.rotation).to.be.equal(270)
      })
      .click().then(() => {
        expect(gameComponent.game.gameActions.rotation).to.be.equal(0)
      })
    })
  })
})



