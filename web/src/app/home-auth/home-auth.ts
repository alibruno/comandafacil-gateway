import { Component, inject, model, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { AuthMode } from '../home-page.types';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  imports: [ButtonModule, DialogModule, InputTextModule, ReactiveFormsModule],
  selector: 'app-home-auth',
  styleUrl: './home-auth.css',
  templateUrl: './home-auth.html',
})
export class HomeAuth {
  private readonly formBuilder = inject(FormBuilder);

  readonly mode = model<AuthMode | null>(null);
  protected readonly authMessage = signal('');
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

    this.mode.set(null);
    this.authMessage.set('');
  }

  protected handleDialogVisibility(mode: AuthMode, visible: boolean): void {
    if (!visible) {
      this.close(mode);
    }
  }

  protected switchMode(mode: AuthMode): void {
    this.authMessage.set('');
    this.mode.set(mode);
  }

  protected submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authMessage.set('Formulário validado. A integração de acesso ainda não está disponível.');
  }

  protected submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authMessage.set('Formulário validado. A integração de cadastro ainda não está disponível.');
  }
}