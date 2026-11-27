import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Sem sessão, volta à tela inicial e informa que o login deve ser aberto.
  return auth.authenticated()
    ? true
    : router.createUrlTree(['/'], {
        queryParams: { login: 'true', returnUrl: state.url },
      });
};
