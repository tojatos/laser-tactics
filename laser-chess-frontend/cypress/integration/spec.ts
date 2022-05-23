import { Subject } from "rxjs/internal/Subject";

const subject = new Subject<any>()

describe('Gameplay tests', () => {

  let angular: any
  let gameComponent: any

  const beforeMethod = (fixture: string) => {
    cy.fixture(fixture).then(data => {
    cy.fixture("userSettings.json").then(settings => {
      cy.fixture("userInfo.json").then(userInfo => {
        cy.fixture("initialGameState.json").then(initState => {
          cy.intercept(
            'GET', '/api/v1/users/me/settings',
            {
              statusCode: 200,
              body: settings
            }
          )
          cy.intercept(
            'GET', '/api/v1/users/*',
            {
              statusCode: 200,
              body: userInfo
            }
          )
          cy.intercept(
            'GET', '/api/v1/game/initial_game_state',
            {
              statusCode: 200,
              body: initState
            }
          )
        })
      })
    })

    return cy.fixture('token.txt').then((data) => {
        cy.setLocalStorage("access_token", data)
        cy.saveLocalStorage()
      })
      .visit("/game/cypressTest/")
      .get('canvas')
      .wait(100)
      .window()
      .then(win => { //get component
          angular = (win as any).ng
      })
      .then(() => cy.document()).wait(500)
      .then((doc) => {
        cy.get('.mat-snack-bar-container').then(sb => {
        sb.hide()
        gameComponent = angular.getComponent(doc.querySelector("app-board"))
        gameComponent.game.gameService.closeConnection()
        gameComponent.game.gameService.getSubject().unsubscribe()
        cy.stub(gameComponent.game.gameService, "getSubject").returns(subject)
        gameComponent.game.gameService.connect("test")
      })
      })
    .then(() => {
    cy.get('#mat-slide-toggle-1 > .mat-slide-toggle-label > .mat-slide-toggle-bar')
    .should('not.be.checked')
    .get('#mat-slide-toggle-2 > .mat-slide-toggle-label > .mat-slide-toggle-bar')
      subject.next(data)
      cy.get(gameComponent.game.board.cells).should('have.length.above', 0)
      .get('app-board-actions').should('be.visible')
    })
  })
  }

  before(() => {
    beforeMethod("initialGameState.json")
  })

  beforeEach(() => {
    cy.restoreLocalStorage()
  })

  afterEach(() => {
    cy.saveLocalStorage();
  });

  const getCell = (gc: any, posX: number, posY: number) =>  gc.game.board.cells.find((c : any) => c.coordinates.x == posX && c.coordinates.y == posY)


it('Test moving', () => {
      const pressPosition = getCell(gameComponent, 5, 1)
      const pressPositionNext = getCell(gameComponent, 5, 2)
      expect(pressPosition.piece).to.be.ok
      expect(pressPositionNext.piece).to.be.not.ok
      cy.spy(gameComponent.game.gameService, "movePiece")
      cy.spy(gameComponent.game.board, "movePiece")
      cy.stub(gameComponent.game.gameService, "animationsToShow").returns("1")

      cy.get('canvas')
      .click(pressPosition.canvasCoordinates.x, pressPosition.canvasCoordinates.y)
      .click(pressPositionNext.canvasCoordinates.x, pressPositionNext.canvasCoordinates.y)
      .then(() => {
        cy.then(() => {
            cy.fixture('firstMoveGameState.json').then((data) => {
              subject.next(data)
              expect(pressPosition.piece).to.be.not.ok
              expect(pressPositionNext.piece).to.be.ok
              expect(gameComponent.game.gameService.movePiece).to.have.been.calledOnce
              expect(gameComponent.game.board.movePiece).to.have.been.calledOnce
            })
        })
    })
  })


it('Test rotation', () => {
    const pressPosition = getCell(gameComponent, 5, 2)
    expect(pressPosition.piece.rotation_degree).to.be.equal(0)
    cy.spy(gameComponent.game.gameService, "rotatePiece")
    cy.spy(gameComponent.game.board, "rotatePiece")

    cy.get('canvas').click(pressPosition.canvasCoordinates.x, pressPosition.canvasCoordinates.y)
    .get('.mat-selection-list').click()
    .then(() => {
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
      .click().get('app-board-actions > :nth-child(3)').click().then(() => {
        cy.fixture("rotateGameState.json").then(res => {
        subject.next(res)
        expect(gameComponent.game.gameService.rotatePiece).to.be.have.been.calledOnce
        expect(gameComponent.game.board.rotatePiece).to.have.been.calledOnce
      })
    })
  })
})

it('Test teleport', () => {
  const pressPosition1 = getCell(gameComponent, 3, 0)
  const pressPosition2 = getCell(gameComponent, 2, 0)
  const teleportPosition = getCell(gameComponent, 5, 5)

  expect(pressPosition1.piece.piece_type).to.be.equal("HYPER_CUBE")
  expect(pressPosition2.piece).to.be.ok
  expect(teleportPosition.piece).to.be.not.ok

  const teleportedPiece = pressPosition2.piece

  cy.stub(gameComponent.game.gameService, "animationsToShow").returns("1")
  cy.spy(gameComponent.game.gameService, "movePiece")
  cy.spy(gameComponent.game.board, "movePiece")

  cy.get('canvas')
  .click(pressPosition1.canvasCoordinates.x, pressPosition1.canvasCoordinates.y)
  .click(pressPosition2.canvasCoordinates.x, pressPosition2.canvasCoordinates.y)
  .then(() => {
    cy.fixture("teleportGameState.json").then(data => {
      subject.next(data)
      cy.wait(100).then(() => {
        expect(pressPosition1.piece).to.be.not.ok
        expect(pressPosition2.piece).to.be.ok
        expect(pressPosition2.piece.piece_type).to.be.equal("HYPER_CUBE")
        expect(teleportPosition.piece).to.be.ok
        expect(teleportPosition.piece).to.be.equal(teleportedPiece)
        expect(gameComponent.game.gameService.movePiece).to.have.been.calledOnce
        expect(gameComponent.game.board.movePiece).to.have.been.calledTwice
      })
    })
    })

})

it('Test logs', () => {

  const teleportPosition = getCell(gameComponent, 5, 5)
  const teleportOrigin = getCell(gameComponent, 2, 0)
  const hyperOrigin = getCell(gameComponent, 3, 0)
  const beamSplitterPosition = getCell(gameComponent, 5, 2)

  expect(teleportPosition.piece.piece_type).to.be.equal("DIAGONAL_MIRROR")
  expect(teleportOrigin.piece.piece_type).to.be.equal("HYPER_CUBE")
  expect(hyperOrigin.piece).to.be.not.ok
  expect(beamSplitterPosition.piece.piece_type).to.be.equal("BEAM_SPLITTER")
  expect(beamSplitterPosition.piece.rotation_degree).to.be.equal(90)

  cy.get("#mat-slide-toggle-3 > .mat-slide-toggle-label > .mat-slide-toggle-bar").click().then(() =>{
  cy.get('[ng-reflect-value="0"] > .mat-list-item-content').click().then(() => {

    const teleportPosition = getCell(gameComponent, 5, 5)
    const teleportOrigin = getCell(gameComponent, 2, 0)
    const hyperOrigin = getCell(gameComponent, 3, 0)
    const beamSplitterPosition = getCell(gameComponent, 5, 2)

    expect(teleportPosition.piece).to.be.not.ok
    expect(teleportOrigin.piece.piece_type).to.be.equal("DIAGONAL_MIRROR")
    expect(hyperOrigin.piece.piece_type).to.be.equal("HYPER_CUBE")
    expect(beamSplitterPosition.piece.piece_type).to.be.equal("BEAM_SPLITTER")
    expect(beamSplitterPosition.piece.rotation_degree).to.be.equal(0)
    cy.get('[ng-reflect-value="2"] > .mat-list-item-content').click().fixture("teleportGameState.json").then(res => {
        subject.next(res)
        const teleportPosition = getCell(gameComponent, 5, 5)
        const teleportOrigin = getCell(gameComponent, 2, 0)
        const hyperOrigin = getCell(gameComponent, 3, 0)
        const beamSplitterPosition = getCell(gameComponent, 5, 2)
        expect(teleportPosition.piece.piece_type).to.be.equal("DIAGONAL_MIRROR")
        expect(teleportOrigin.piece.piece_type).to.be.equal("HYPER_CUBE")
        expect(hyperOrigin.piece).to.be.not.ok
        expect(beamSplitterPosition.piece.piece_type).to.be.equal("BEAM_SPLITTER")
        expect(beamSplitterPosition.piece.rotation_degree).to.be.equal(90)
    })
  })
})
})


it('Test give up', () => {
  cy.spy(gameComponent.game.gameService, "giveUp")
  cy.get('[mattooltip="Give up"] > .mat-button-wrapper > .mat-icon').click().then(() => {
    expect(gameComponent.game.gameService.giveUp).to.be.calledOnce
  })
})


it('Test draw offer', () => {
  cy.spy(gameComponent.game.gameService, "offerDraw")
  cy.get('[mattooltip="Offer draw"] > .mat-button-wrapper > .mat-icon').click().then(() => {
    expect(gameComponent.game.gameService.offerDraw).to.be.calledOnce
  })
})


it('Test draw offer recieve', () => {
  cy.spy(gameComponent.game.gameService, "offerDraw")
  cy.spy(gameComponent.game.gameService, "showDrawOffer")
  cy.stub(gameComponent.game.gameService.isPlayer).returns(true)
  cy.stub(gameComponent.game.gameService, "animationsToShow").returns("1")

  cy.fixture("gameStateWithDrawOffer.json").then(res => {
    subject.next(res)
    cy.get(".swal2-confirm").click().then(() => {
      expect(gameComponent.game.gameService.showDrawOffer).to.be.calledOnce
      expect(gameComponent.game.gameService.offerDraw).to.be.calledOnce
    })
  })
})


it('Test laser', () => {

  cy.fixture("laserTestCase.json").then(firstStep => {
    subject.next(firstStep)
    const laserPosition = getCell(gameComponent, 5, 0)
    expect(laserPosition.piece.piece_type).to.be.equal("LASER")
    cy.spy(gameComponent.game.gameService, "shootLaser")
    cy.spy(gameComponent.game.board, "removePiece")
    cy.spy(gameComponent.game.eventsExecutor, "executeLaserAnimations")
    cy.stub(gameComponent.game.gameService, "animationsToShow").returns("2")

    cy.get('canvas').click(laserPosition.canvasCoordinates.x, laserPosition.canvasCoordinates.y)
    .get('app-board-actions > :nth-child(2)').click().then(() => {
      cy.fixture("laserShoot.json").then(secondStep => {
        subject.next(secondStep)
      }).then(() => {
      cy.then(() => {
        expect(gameComponent.game.gameService.shootLaser).to.have.been.calledOnce
        expect(gameComponent.game.eventsExecutor.executeLaserAnimations).to.have.been.calledOnce
        cy.wrap(gameComponent.game.board.removePiece, {timeout: 2000}).should(fun => expect(fun).to.be.calledOnce)
      })
    })
  })
})
})
})







