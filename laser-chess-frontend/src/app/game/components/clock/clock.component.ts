import { Component, Input, OnChanges, Output, SimpleChanges, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnChanges {

  @Input() serverTime = 0
  @Input() isActive = false
  @Output() timeoutEmitter = new EventEmitter()

  readonly SECONDS_IN_MINUTE = 60
  localTime = 0
  time = "00:00"
  isWarning = false
  isRunning = false

  ngOnChanges(changes: SimpleChanges): void{
    if(changes.serverTime){
      this.localTime = <number>changes.serverTime.currentValue
      this.activateClock()
    }
  }

  activateClock(){
    this.time = this.parseTimeLeftToString(this.localTime)

    if(!this.isActive)
      this.isRunning = false

    if(this.isActive && !this.isRunning){
      this.isRunning = true;
      this.time = this.parseTimeLeftToString(this.localTime)
      this.clockCycle(Math.floor(new Date().getTime() / 1000) + this.localTime)
    }
  }

  parseTimeLeftToString(timeLeft: number): string{
    this.isWarning = timeLeft < this.SECONDS_IN_MINUTE

    if(timeLeft < 1)
      return "00:00"

    const minutes = Math.floor(timeLeft / this.SECONDS_IN_MINUTE)
    const seconds = timeLeft - minutes * this.SECONDS_IN_MINUTE

    const numberText = (number: number) => number > 9 ? number.toString() : "0" + number.toString();

    return numberText(minutes) + ":" + numberText(seconds)
  }

  clockCycle(expectedFinishTime: number): void {
    const timeDiff = expectedFinishTime - Math.floor(new Date().getTime() / 1000)
    this.time = this.parseTimeLeftToString(timeDiff)

    if(timeDiff < 1)
      this.timeoutEmitter.emit()

    if(this.isRunning && this.isActive && timeDiff > 0)
      setTimeout(() => this.clockCycle(expectedFinishTime), 1000)
  }

}
