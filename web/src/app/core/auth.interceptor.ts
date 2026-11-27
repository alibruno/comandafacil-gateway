import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api-url';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  // Não envia token para login/cadastro nem para endereços que não sejam da API.
  if (!token || !request.url.startsWith(API_URL) || request.url.includes('/auth/')) {
    return next(request);
  }

  const router = inject(Router);
  // Clona a requisição para acrescentar o JWT sem alterar a requisição original.
  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
        void router.navigate(['/'], { queryParams: { login: 'true' } });
      }

      return throwError(() => error);
    }),
  );
};
