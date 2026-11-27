import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const message = error.error?.message;
    if (typeof message === 'string') return message;
    const detail = error.error?.detail;
    if (typeof detail === 'string') return detail;
    if (error.status === 0) return 'Não foi possível conectar à API. Verifique se o backend está ativo.';
    if (error.status === 401) return 'Sua sessão expirou. Entre novamente.';
  }

  return 'Não foi possível concluir a operação. Tente novamente.';
}
