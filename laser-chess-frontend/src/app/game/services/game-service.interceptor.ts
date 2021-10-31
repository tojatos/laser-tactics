import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { EventEmitterService } from './event-emitter.service';
import { MatSnackBar } from '@angular/material/snack-bar';

type errorResponse = {
  detail: string
}

@Injectable()
export class GameServiceInterceptor implements HttpInterceptor {

  constructor(private _snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
        catchError(error => this.handleError(error))
      )
  }

  private handleError(error: HttpErrorResponse) {
    this.showSnackbar(error.error.detail)
    return throwError(error)
  }

  private showSnackbar(message: string) {
    this._snackBar.open(message, "", {
      duration: 2000
    })
  }

}
