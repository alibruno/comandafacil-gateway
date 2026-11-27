import { Component, inject, model, output } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { AuthMode } from '../../home-page.types';
import { AuthService } from '../../../../core/auth.service';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  imports: [ButtonModule, DialogModule, InputTextModule, ReactiveFormsModule],
  selector: 'app-home-auth',
  templateUrl: './home-auth.html',
})
export class HomeAuth {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly auth = inject(AuthService);

  readonly mode = model<AuthMode | null>(null);
  readonly authenticated = output<void>();
  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly registerForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  protected close(mode: AuthMode): void {
    if (this.mode() !== mode) {
      return;
    }

    this.auth.clearError();
    this.mode.set(null);
  }

  protected handleDialogVisibility(mode: AuthMode, visible: boolean): void {
    if (!visible) {
      this.close(mode);
    }
  }

  protected switchMode(mode: AuthMode): void {
    this.auth.clearError();
    this.mode.set(mode);
  }

  protected submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => this.authenticated.emit(),
      error: (error: unknown) => console.error('Falha ao entrar:', error),
    });
  }

  protected submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.registerForm.getRawValue();
    this.auth.register({ name, email, password }).subscribe({
      next: () => this.authenticated.emit(),
      error: (error: unknown) => console.error('Falha ao criar conta:', error),
    });
  }
}