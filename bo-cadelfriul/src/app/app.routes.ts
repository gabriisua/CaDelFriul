import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/products.component').then(
            (m) => m.ProductsComponent,
          ),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./features/orders/orders.component').then(
            (m) => m.OrdersComponent,
          ),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/orders/order-detail.component').then(
            (m) => m.OrderDetailComponent,
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customers.component').then(
            (m) => m.CustomersComponent,
          ),
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./features/staff/staff.component').then(
            (m) => m.StaffComponent,
          ),
      },
      {
        path: 'rooms',
        loadComponent: () =>
          import('./features/rooms/rooms.component').then(
            (m) => m.RoomsComponent,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
