import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-brand-bg">
      <div class="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 class="text-2xl font-bold text-center mb-6 font-heading">Admin Login</h1>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-sm font-medium text-brand-text mb-2">Email</label>
            <input
              type="email"
              formControlName="email"
              class="w-full px-3 py-2 border border-brand-border rounded focus:outline-none focus:ring-2 focus:ring-brand-ring" />
            @if (form.get('email')?.touched && form.get('email')?.errors?.['required']) {
              <p class="text-red-500 text-xs mt-1">Email is required</p>
            }
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-brand-text mb-2">Password</label>
            <input
              type="password"
              formControlName="password"
              class="w-full px-3 py-2 border border-brand-border rounded focus:outline-none focus:ring-2 focus:ring-brand-ring" />
            @if (form.get('password')?.touched && form.get('password')?.errors?.['required']) {
              <p class="text-red-500 text-xs mt-1">Password is required</p>
            }
          </div>
          @if (error) {
            <p class="text-red-500 text-sm mb-4">{{ error }}</p>
          }
          <button
            type="submit"
            [disabled]="loading"
            class="w-full bg-brand-primary text-brand-text py-2 rounded hover:opacity-80 transition-colors font-medium disabled:opacity-50">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  form: FormGroup = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  error = '';
  loading = false;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.form.value).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Invalid email or password';
        } else {
          this.error = 'An error occurred. Please try again.';
        }
      },
    });
  }
}
