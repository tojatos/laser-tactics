import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { GameEvent } from '../../game.models';
import { COLS, ROWS } from '../../src/constants';
import { GamePhase, PlayerType } from '../../src/enums';
import { Game } from '../../src/Game';
import { BoardLogComponent } from '../board-log/board-log.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvasGame!: ElementRef<HTMLCanvasElement>

  @ViewChild('logs', { static: true })
  logsComponent: ElementRef<BoardLogComponent> | undefined

  readonly sizeScale = 0.07
  readonly handsetSize = 835
  readonly handsetScale = 1.5
  readonly placeForGameLogSize = 1.35
  readonly minWidth = 695
  animation = true
  sounds = true

  constructor(private route: ActivatedRoute, private userService: UserService, public game: Game) {}

  async ngAfterViewInit() {
    const settings = await this.userService.getSettings().toPromise()
    this.animation = !settings.skip_animations
    this.sounds = settings.sound_on
    const gameCanvasContext = this.canvasGame.nativeElement.getContext('2d')
    if(!gameCanvasContext){
      alert("Couldn't load context")
      return
    }

    this.route.params.subscribe(async params => {
      await this.game.initGame(gameCanvasContext,
        this.isHandset ? this.currentSize * this.handsetScale : this.currentSize,
        params.id,
        this.isHandset ? this.sizeScale * this.handsetScale : this.sizeScale,
        this.animation, this.sounds)
    })
  }

  ngOnDestroy() {
    this.game.closeWebsocketConnection()
    this.game.destroyGame()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent) {
    this.game.changeCurrentSize(this.isHandset ? this.currentSize * this.handsetScale : this.currentSize)
  }

  changeAnimationShowOption(){
    this.game.changeAnimationsShowOption(this.animation)
  }

  changeSoundOption(){
    this.game.changeSoundOption(this.sounds)
  }

  buttonPressEvent(event: string){
    switch(event){
      case "left": this.game.passRotation(-90); break
      case "right": this.game.passRotation(90); break
      case "laser": this.game.passLaserShoot(); break
      case "accept": this.game.passAccept(); break
    }
  }

  buildEvent(gameEvents: GameEvent[]){
    this.game.showGameEvent(gameEvents, this.sounds)
  }

  returnToCurrentEvent(){
    this.game.returnToCurrentEvent()
  }

  parseGamePhase(gamePhase: GamePhase){
    switch(gamePhase){
      case GamePhase.STARTED: {
        if(this.game.whoseTurn == PlayerType.PLAYER_ONE) return "Red player's turn"
        else if(this.game.whoseTurn == PlayerType.PLAYER_TWO) return "Blue player's turn"
        else return "Game started - turn unknown"
      }
      case GamePhase.DRAW: return "Draw"
      case GamePhase.PLAYER_ONE_VICTORY: return "Red player wins!"
      case GamePhase.PLAYER_TWO_VICTORY: return "Blue player wins!"
      case GamePhase.NOT_STARTED: return "Game not started"
      default: return "Loading data..."
    }
  }

  get isHandset(){
    return innerWidth <= this.handsetSize
  }

  get currentSize() {
    return (innerWidth > innerHeight ? innerHeight : innerWidth) * this.sizeScale
  }

  get containerHeight() {
    if(!this.isHandset)
      return this.currentSize * ROWS
    else
      return this.currentSize * ROWS * this.handsetScale
  }

  get containerWidth() {
    if(!this.isHandset)
      return this.currentSize * COLS
    else
      return this.currentSize * COLS * this.handsetScale
  }

  get displayedContainerWidth() {
    if(this.isHandset)
      return this.containerWidth
    else
      return Math.max(this.containerWidth * this.placeForGameLogSize, this.minWidth)
  }

  get rotationPossibleInfo() {
    return this.game.gameActions?.rotationActive
  }

  get laserPossibleInfo() {
    return this.game.gameActions?.laserActive
  }

  get acceptPossibleInfo() {
    return this.game.gameActions?.acceptActive
  }

  get isSpectator(){
    return this.game.authService.getUsername() != this.game.playerNames[0] && this.game.authService.getUsername() != this.game.playerNames[1]
  }

}
