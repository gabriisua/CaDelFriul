import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Order } from '../../core/models/order.model';
import { DataGridComponent, GridColumn, GridAction } from '../../shared/components/data-grid/data-grid.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, DataGridComponent],
  template: `
    <div class="space-y-6">
      <h1 class="text-3xl font-bold text-brand-text font-heading">Orders Management</h1>

      @if (loading) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      } @else if (error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700">{{ error }}</p>
        </div>
      } @else if (orders.length === 0) {
        <div class="bg-white/80 rounded-xl shadow p-8 text-center">
          <p class="text-brand-muted">No orders found.</p>
        </div>
      } @else {
        <app-data-grid [data]="orders" [columns]="columns" [actions]="actions"></app-data-grid>
      }
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  orders: Order[] = [];
  loading = true;
  error = '';

  columns: GridColumn[] = [
    { header: 'Order ID', field: 'id', type: 'text' },
    { header: 'Customer', field: 'customerEmail', type: 'text' },
    { header: 'Date', field: 'createdAt', type: 'date' },
    { header: 'Total', field: 'totalAmount', type: 'currency' },
    { header: 'Status', field: 'status', type: 'status' },
  ];

  actions: GridAction[] = [
    {
      label: 'View',
      icon: '',
      action: (order: Order) => this.router.navigate(['/orders', order.id]),
    },
  ];

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(): void {
    this.api.get<Order[]>('/orders').subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load orders.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
