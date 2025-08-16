import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _snackBar: MatSnackBar) {}

  private handleError(error: HttpErrorResponse) {
    let message = 'An unexpected error occurred';
    if (error.status === 0) {
      message = 'Server temporarily unavailable';
    } else if (error?.error?.detail) {
      message = error.error.detail;
    } else if (typeof error?.error === 'string' && error.error.trim()) {
      message = error.error;
    } else if (error?.message) {
      message = error.message;
    }

    this.showSnackbar(message);
    return throwError(error);
  }

  private showSnackbar(message: string) {
    this._snackBar.open(message, '', {
      duration: 2000,
    });
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const idToken = localStorage.getItem('access_token');

    if (idToken) {
      const cloned = request.clone({
        headers: request.headers.set('Authorization', 'Bearer ' + idToken),
      });

      return next.handle(cloned).pipe(catchError((error) => this.handleError(error)));
    } else {
      return next.handle(request).pipe(catchError((error) => this.handleError(error)));
    }
  }
}
