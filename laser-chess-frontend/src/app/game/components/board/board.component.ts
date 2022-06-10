import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from 'src/app/services/user.service';
import { GameEvent } from '../../game.models';
import { COLS, ROWS } from '../../src/Utils/Constants';
import { GamePhase, PlayerType, Theme } from '../../src/Utils/Enums';
import { Game } from '../../src/Controller/Game';
import { clone } from 'lodash';
import { ClockComponent } from '../clock/clock.component';
import { BoardLogComponent } from '../board-log/board-log.component';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvasGame!: ElementRef<HTMLCanvasElement>

  @ViewChild('logsComponent')
  boardLogComponent: BoardLogComponent | undefined

  @ViewChildren(ClockComponent)
  clockComponents!: QueryList<ClockComponent>

  readonly sizeScale = 0.07
  readonly handsetSize = 835
  readonly handsetScale = 1.5
  readonly placeForGameLogSize = 1.35
  readonly minWidth = 695
  animation = true
  sounds = true
  theme: Theme = Theme.CLASSIC
  backgroundBoardUrl = `url(assets/${this.theme}/board.svg)`
  spectators: Array<string | undefined>  = ['user', 'user2', undefined, undefined]
  filteredSpectators: Array<string> = []
  spectatorsNum = 5;

  constructor(private route: ActivatedRoute, private userService: UserService, private authService: AuthService, public game: Game) {}

  async ngAfterViewInit(): Promise<void> {
    if(this.authService.isLoggedIn()){
      const settings = await this.userService.getSettings().toPromise()
      this.animation = !settings.skip_animations
      this.sounds = settings.sound_on
      this.theme = settings.theme
      this.backgroundBoardUrl = `url(assets/${this.theme}/board.svg)`
      this.filteredSpectators = (this.spectators.filter(spec => spec != undefined) as string[])
      this.filteredSpectators.push(
        `${this.spectators.filter(spec => spec == undefined).length.toString()} anonymous`
      )
    }

    if(!this.canvasGame.nativeElement.getContext('2d')){
      alert("Couldn't load context")
      return
    }

    type urlModel = {
      id: string
    }

    this.route.params.subscribe(params => {
      void (async () => {
        await this.game.initGame(this.canvasGame.nativeElement,
          this.isHandset ? this.currentSize * this.handsetScale : this.currentSize,
          (<urlModel>params).id,
          this.isHandset ? this.sizeScale * this.handsetScale : this.sizeScale,
          this.animation, this.sounds, this.clockComponents, this.theme)
      })()
  })
  }

  ngOnDestroy(): void {
    this.game.closeWebsocketConnection()
    this.game.destroyGame()
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.game.changeCurrentSize(this.isHandset ? this.currentSize * this.handsetScale : this.currentSize)
  }

  changeAnimationShowOption(): void{
    this.game.changeAnimationsShowOption(this.animation)
  }

  changeSoundOption(): void{
    this.game.changeSoundOption(this.sounds)
  }

  buttonPressEvent(event: string): void{
    switch(event){
      case "left": this.game.passRotation(-90); break
      case "right": this.game.passRotation(90); break
      case "laser": this.game.passLaserShoot(); break
      case "accept": this.game.passAccept(); break
    }
  }

  buildEvent(gameInfo: [GameEvent[], boolean]): void{
    const lastPassBuffer = clone(gameInfo[0].length)
    if(this.game.lastPassedGameStateSize < gameInfo[0].length && gameInfo[1])
      gameInfo[0].splice(0, this.game.lastPassedGameStateSize)
    else if(this.game.lastPassedGameStateSize > gameInfo[0].length)
      this.game.lastPassedGameStateSize = 0
    void this.game.showGameEvent(gameInfo[0], this.game.lastPassedGameStateSize > 0, gameInfo[1], this.boardLogComponent)
    this.game.lastPassedGameStateSize = lastPassBuffer
  }

  returnToCurrentEvent(): void{
    void this.game.returnToCurrentEvent()
  }

  parseGamePhase(gamePhase: GamePhase): string{
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

  get isHandset(): boolean{
    return innerWidth <= this.handsetSize
  }

  get currentSize(): number{
    return (innerWidth > innerHeight ? innerHeight : innerWidth) * this.sizeScale
  }

  get containerHeight(): number {
    if(!this.isHandset)
      return this.currentSize * ROWS
    else
      return this.currentSize * ROWS * this.handsetScale
  }

  get containerWidth(): number {
    if(!this.isHandset)
      return this.currentSize * COLS
    else
      return this.currentSize * COLS * this.handsetScale
  }

  get displayedContainerWidth(): number {
    if(this.isHandset)
      return this.containerWidth
    else
      return Math.max(this.containerWidth * this.placeForGameLogSize, this.minWidth)
  }

  get rotationPossibleInfo(): boolean | undefined {
    return this.game.gameActions?.rotationActive
  }

  get laserPossibleInfo(): boolean | undefined {
    return this.game.gameActions?.laserActive
  }

  get acceptPossibleInfo(): boolean | undefined {
    return this.game.gameActions?.acceptActive
  }

  get isSpectator(): boolean {
    return this.game.authService.getUsername() != this.game.playerNames[0] && this.game.authService.getUsername() != this.game.playerNames[1]
  }

  get isTimed(): boolean {
    return this.game.isTimed
  }


}
