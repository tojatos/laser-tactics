import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { GameCanvas } from "./Display/Canvas/GameCanvas";
import { Resources } from "./Display/Resources";
import { EventsExecutor } from "./eventsExecutor";

class MockCanvas extends GameCanvas {
  currentPlayer = "user"
}

describe('EventsExecutor', () => {
  let eventsExecutor: EventsExecutor

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventsExecutor, {provide: GameCanvas, useValue: MockCanvas}, Resources]
    }).compileComponents()
    eventsExecutor = TestBed.inject(EventsExecutor)
  })

  it('should be created', () => {
    expect(eventsExecutor).toBeTruthy();
  });
})
