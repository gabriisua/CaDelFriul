import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-brand-text font-heading">Dashboard</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold text-brand-muted">Total Orders</h3>
          <p class="text-3xl font-bold text-brand-primary mt-2">0</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold text-brand-muted">Revenue</h3>
          <p class="text-3xl font-bold text-green-600 mt-2">€0.00</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold text-brand-muted">Active Staff</h3>
          <p class="text-3xl font-bold text-purple-600 mt-2">0</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold text-brand-muted">Customers</h3>
          <p class="text-3xl font-bold text-orange-600 mt-2">0</p>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent {}
