import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
// Assicurati che il percorso dell'import coincida con dove hai salvato il service
import { DashboardService, AdminDashboardResponse } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Usiamo *ngIf con la pipe async per srotolare i dati in automatico -->
    <div class="space-y-6" *ngIf="dashboardData$ | async as dashboardData; else loading">
      <h1 class="text-3xl font-bold text-brand-text font-heading">Dashboard</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Orders -->
        <div class="bg-white p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold text-brand-muted">Total Orders</h3>
          <p class="text-3xl font-bold text-brand-primary mt-2">
            {{ dashboardData.totalOrders }}
          </p>
        </div>

        <!-- Revenue -->
        <div class="bg-white p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold text-brand-muted">Revenue</h3>
          <p class="text-3xl font-bold text-green-600 mt-2">
            {{ dashboardData.revenue | currency:'EUR':'symbol' }}
          </p>
        </div>

        <!-- Active Staff -->
        <div class="bg-white p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold text-brand-muted">Active Staff</h3>
          <p class="text-3xl font-bold text-purple-600 mt-2">
            {{ dashboardData.activeStaff }}
          </p>
        </div>

        <!-- Customers -->
        <div class="bg-white p-6 rounded-xl shadow">
          <h3 class="text-lg font-semibold text-brand-muted">Customers</h3>
          <p class="text-3xl font-bold text-orange-600 mt-2">
            {{ dashboardData.customers }}
          </p>
        </div>
      </div>
    </div>

    <!-- Schermata di caricamento mostrata mentre aspettiamo il JSON -->
    <ng-template #loading>
      <div class="flex items-center justify-center h-64 text-brand-muted">
        <p class="text-lg font-semibold">Caricamento statistiche in corso...</p>
      </div>
    </ng-template>
  `,
})
export class DashboardComponent implements OnInit {
  // Trasformiamo la variabile in un Observable (notare il $ alla fine, è una best practice)
  dashboardData$!: Observable<AdminDashboardResponse>;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    // Invece di fare il subscribe a mano, assegniamo direttamente l'Observable
    this.dashboardData$ = this.dashboardService.getAdminDashboardStats();
  }
}
