import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormStateService } from '../../core/services/form-state.service';

// Custom validator: password must have uppercase, lowercase, and special char
function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;

  const hasUpperCase = /[A-Z]/.test(value);
  const hasLowerCase = /[a-z]/.test(value);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-=+[\]\\;'/`~]/.test(value);

  if (!hasUpperCase) return { weakPassword: 'Must include at least one uppercase letter (A-Z).' };
  if (!hasLowerCase) return { weakPassword: 'Must include at least one lowercase letter (a-z).' };
  if (!hasSpecialChar) return { weakPassword: 'Must include at least one special character (!@#$ etc.).' };

  return null;
}

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  private state = inject(FormStateService);

  isLogin = signal(false);
  loading = signal(false);
  serverError = signal<string | null>(null);
  showPassword = signal(false);

  authForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15), strongPasswordValidator]]
  });

  constructor() {
    // React to auth state changes (handles OAuth redirect case)
    effect(() => {
      if (this.supabase.currentUser()) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  ngOnInit() {
    // If user is already logged in when page loads (e.g. returning from Google OAuth),
    // redirect immediately without waiting for user interaction.
    if (this.supabase.currentUser()) {
      this.router.navigate(['/dashboard']);
    }
  }

  get emailControl() { return this.authForm.get('email')!; }
  get passwordControl() { return this.authForm.get('password')!; }

  get emailError(): string | null {
    const ctrl = this.emailControl;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'Email address is required.';
    if (ctrl.hasError('email')) return 'Please enter a valid email address.';
    return null;
  }

  get passwordError(): string | null {
    const ctrl = this.passwordControl;
    if (!ctrl.touched) return null;
    if (ctrl.hasError('required')) return 'Password is required.';
    if (ctrl.hasError('minlength')) return 'Password must be at least 6 characters.';
    if (ctrl.hasError('maxlength')) return 'Password must be no more than 15 characters.';
    if (ctrl.hasError('weakPassword')) return ctrl.getError('weakPassword');
    return null;
  }

  toggleMode() {
    this.isLogin.set(!this.isLogin());
    this.serverError.set(null);
    this.authForm.reset();
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  async handleEmailAuth() {
    this.authForm.markAllAsTouched();
    if (this.authForm.invalid) return;

    this.loading.set(true);
    this.serverError.set(null);

    const { email, password } = this.authForm.value;

    try {
      if (this.isLogin()) {
        const { error } = await this.supabase.signInWithEmail(email, password);
        if (error) throw error;
      } else {
        const { error } = await this.supabase.signUpWithEmail(email, password);
        if (error) throw error;
      }
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.serverError.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  async loginWithGoogle() {
    try {
      await this.supabase.signInWithGoogle();
    } catch (err: any) {
      this.serverError.set(err.message);
    }
  }

  async loginWithGithub() {
    try {
      await this.supabase.signInWithGithub();
    } catch (err: any) {
      this.serverError.set(err.message);
    }
  }

  continueAsGuest() {
    this.state.clearState();
    this.router.navigate(['/builder']);
  }
}
