import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { GlobalToastComponent } from '../shared/components/global-toast/global-toast.component';
import { GlobalConfirmComponent } from '../shared/components/global-confirm/global-confirm.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, GlobalToastComponent, GlobalConfirmComponent],
  template: `
    <div class="flex h-screen bg-brand-bg">
      <aside class="w-64 bg-brand-secondary text-brand-text flex flex-col">
        <div class="p-4 border-b border-brand-border">
          <h1 class="text-xl font-bold font-heading">Ca' del Friul</h1>
          <p class="text-sm text-brand-muted">Admin Backoffice</p>
        </div>
        <nav class="flex-1 overflow-y-auto p-4">
          <ul class="space-y-2">
            @for (item of navItems; track item.path) {
              <li>
                <a
                  [routerLink]="item.path"
                  routerLinkActive="bg-brand-primary/10 text-brand-primary border-l-2 border-brand-primary font-medium"
                  class="block px-4 py-2 rounded border-l-2 border-transparent text-brand-text/70 hover:text-brand-text hover:bg-brand-bg/50 transition-colors">
                  {{ item.label }}
                </a>
              </li>
            }
          </ul>
        </nav>
        <div class="p-4 border-t border-brand-border">
          <button
            (click)="logout()"
            class="w-full px-4 py-2 bg-brand-destructive/10 text-brand-destructive rounded-lg hover:bg-brand-destructive/20 transition-colors">
            Logout
          </button>
        </div>
      </aside>
      <div class="flex-1 flex flex-col overflow-hidden">
        <header class="bg-brand-bg shadow-sm h-16 flex items-center justify-between px-6">
          <h2 class="text-lg font-semibold text-brand-text">Dashboard</h2>
          <div class="flex items-center gap-4">
            <span class="text-sm text-brand-muted">Admin</span>
            <button
              (click)="logout()"
              class="text-sm text-brand-destructive hover:opacity-80">
              Logout
            </button>
          </div>
        </header>
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>

    <app-global-toast />
    <app-global-confirm />
  `,
})
export class AdminLayoutComponent {
  private readonly authService = inject(AuthService);

  readonly navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/orders', label: 'Orders' },
    { path: '/reservations', label: 'Reservations' },
    { path: '/products', label: 'Products' },
    { path: '/rooms', label: 'Rooms' },
    { path: '/customers', label: 'Customers' },
    { path: '/staff', label: 'Staff' },
  ];

  logout(): void {
    this.authService.logout();
  }
}
