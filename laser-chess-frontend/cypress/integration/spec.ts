import { Subject } from "rxjs/internal/Subject";

const subject = new Subject<any>()

describe('Gameplay tests', () => {

  let angular: any
  let gameComponent: any

  before(() => {
      cy.visit("/game/test")
      cy.get('canvas')
      .then(() => {
        cy.window().then(win => { //get component
          angular = (win as any).ng
        })
        .then(() => cy.document())
        .then((doc) => {
          cy.fixture('token.txt').then((data) => {
            console.log(data)
            localStorage.setItem("user_token", data)
          })
          gameComponent = angular.getComponent(doc.querySelector("app-board"))
          gameComponent.game.gameService.subject().unsubscribe()
          cy.stub(gameComponent.game.gameService, "subject").returns(subject)
          gameComponent.game.gameService.connect("test")
          cy.fixture('initialGameState.json').then((data) => {
            subject.next(data)
            expect(gameComponent.game.board.cells).to.have.length.greaterThan(0)
            cy.get('.mat-slide-toggle-bar').click() //disable animations
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

  it('Test laser', () => {

    const laserPosition = getCell(gameComponent, 5, 0)
    const beamSplitterPosition = getCell(gameComponent, 5, 1)
    const blockPosition = getCell(gameComponent, 6, 1)
    expect(laserPosition.piece.piece_type).to.be.equal("LASER")
    expect(beamSplitterPosition.piece.piece_type).to.be.equal("BEAM_SPLITTER")
    expect(blockPosition.piece.piece_type).to.be.equal("BLOCK")

    cy.get('canvas').click(laserPosition.canvasCoordinates.x, laserPosition.canvasCoordinates.y).then(() => {
    cy.get('app-board-actions > :nth-child(2)').click().then(() => {
      cy.wait(500).then(() => {
        cy.stub(gameComponent.game.gameService, 'shootLaser').returns("lole")
        //expect(gameComponent.game.gameService.shootLaser).to.have.been.called
        expect(blockPosition.piece).to.be.not.ok
        expect(laserPosition.piece).to.be.not.ok
      })
    })
  })
})
})



