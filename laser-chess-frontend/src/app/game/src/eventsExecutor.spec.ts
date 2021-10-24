import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Canvas } from "./Canvas/Canvas";
import { Resources } from "./Canvas/Resources";
import { EventsExecutor } from "./eventsExecutor";

class MockCanvas extends Canvas {
  currentPlayer = "user"
}

describe('EventsExecutor', () => {
  let eventsExecutor: EventsExecutor

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventsExecutor, {provide: Canvas, useValue: MockCanvas}, Resources]
    }).compileComponents()
    eventsExecutor = TestBed.inject(EventsExecutor)
  })

  it('should be created', () => {
    expect(eventsExecutor).toBeTruthy();
  });
})
