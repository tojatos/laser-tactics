import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent {

  @Input() lastMoveMade = 0
  @Input() gameStart = 0
  @Input() expectedTimeInMinutes = 0
  @Input() isActive = false

  readonly SECONDS_IN_MINUTE = 60
  time = "00:00"
  isWarning = false
  isRunning = false

  activateClock(){
    this.time = this.parseTimeLeftToString(this.timeLeft)

    if(!this.isActive)
      this.isRunning = false

    if(this.isActive && !this.isRunning){
      this.isRunning = true;
      this.time = this.parseTimeLeftToString(this.timeLeft)
      this.clockCycle(Math.floor(new Date().getTime() / 1000) + this.timeLeft)
    }
  }

  get timeLeft(): number {
    const secondsPassed = this.lastMoveMade - this.gameStart
    return this.expectedTimeInMinutes * this.SECONDS_IN_MINUTE - secondsPassed
  }

  parseTimeLeftToString(timeLeft: number): string{
    this.isWarning = timeLeft < this.SECONDS_IN_MINUTE

    if(timeLeft < 1)
      return "00:00"

    if(timeLeft > this.expectedTimeInMinutes * this.SECONDS_IN_MINUTE)
      return this.expectedTimeInMinutes.toString() + ":00"

    const minutes = Math.floor(timeLeft / this.SECONDS_IN_MINUTE)
    const seconds = timeLeft - minutes * this.SECONDS_IN_MINUTE

    const numberText = (number: number) => number > 9 ? number.toString() : "0" + number.toString();

    return numberText(minutes) + ":" + numberText(seconds)
  }

  clockCycle(expectedFinishTime: number): void {
    const timeDiff = expectedFinishTime - Math.floor(new Date().getTime() / 1000)
    if(this.isRunning && this.isActive && timeDiff > 0) {
      this.time = this.parseTimeLeftToString(timeDiff)
      setTimeout(() => this.clockCycle(expectedFinishTime), 1000)
    }
  }

}
