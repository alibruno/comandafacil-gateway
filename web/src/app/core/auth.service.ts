import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, tap, throwError } from 'rxjs';
import { API_URL } from './api-url';
import { apiErrorMessage } from './api-error';

export interface AuthSession {
  token: string;
  email: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest extends LoginRequest {
  name: string;
}

const TOKEN_KEY = 'comandafacil-token';
const EMAIL_KEY = 'comandafacil-email';
const NAME_KEY = 'comandafacil-name';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUserState = signal<AuthSession | null>(this.restoreSession());

  readonly currentUser = this.currentUserState.asReadonly();
  readonly authenticated = computed(() => this.currentUserState() !== null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  login(credentials: LoginRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<AuthSession>(`${API_URL}/auth/login`, credentials).pipe(
      tap((session) => this.saveSession(session)),
      catchError((error: unknown) => {
        this.error.set(apiErrorMessage(error));
        return throwError(() => error);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  register(credentials: RegisterRequest) {
    this.loading.set(true);
    this.error.set(null);

    return this.http.post<AuthSession>(`${API_URL}/auth/register`, credentials).pipe(
      tap((session) => this.saveSession(session)),
      catchError((error: unknown) => {
        this.error.set(apiErrorMessage(error));
        return throwError(() => error);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  token(): string | null {
    return this.currentUserState()?.token ?? null;
  }

  clearError(): void {
    this.error.set(null);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(NAME_KEY);
    this.currentUserState.set(null);
    this.error.set(null);
  }

  private saveSession(session: AuthSession): void {
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(EMAIL_KEY, session.email);
    localStorage.setItem(NAME_KEY, session.name);
    this.currentUserState.set(session);
  }

  private restoreSession(): AuthSession | null {
    const token = localStorage.getItem(TOKEN_KEY);
    const email = localStorage.getItem(EMAIL_KEY);
    const name = localStorage.getItem(NAME_KEY);

    if (!token || !email || !name) {
      this.logoutStoredSession();
      return null;
    }

    return { token, email, name };
  }

  private logoutStoredSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    localStorage.removeItem(NAME_KEY);
  }
}
