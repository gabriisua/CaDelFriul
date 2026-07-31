import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Aggiunto per il binding perfetto della select
import { ActivatedRoute, Router } from '@angular/router';
import { OrderDetail, OrderStatus } from '../../core/models/order.model';
import { OrderService } from '../../core/services/order.service';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- Aggiunto FormsModule
  template: `
    <div class="space-y-6">
      @if (loading) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      } @else if (error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700">{{ error }}</p>
          <button
            (click)="goBack()"
            class="mt-2 text-sm text-brand-primary hover:underline">
            ← Back to Orders
          </button>
        </div>
      } @else if (order) {
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4">
            <button
              (click)="goBack()"
              class="text-brand-muted hover:text-brand-text transition-colors text-sm font-medium">
              ← Back to Orders
            </button>
            <h1 class="text-3xl font-bold text-brand-text font-heading">
              Order #{{ shortId }}
            </h1>
          </div>

          <!-- Status Dropdown Migliorato -->
          <div class="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-brand-border">
            <label class="text-sm text-brand-muted font-medium whitespace-nowrap">Order Status:</label>
            <select
              [(ngModel)]="order.status"
              (ngModelChange)="onStatusChange($event)"
              [ngClass]="getStatusColor(order.status)"
              class="px-3 py-1.5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-ring appearance-none cursor-pointer pr-8 border shadow-sm transition-colors"
              style="background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right .7rem top 50%; background-size: .65rem auto;">
              @for (status of orderStatuses; track status) {
                <option [value]="status" class="bg-white text-gray-900 font-medium">{{ formatStatus(status) }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Action Buttons Bar -->
        <div class="flex gap-3">
          <button
            (click)="printShippingLabel()"
            class="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 shadow-sm rounded-lg transition-colors">
            Print Shipping Label
          </button>
          <button
            (click)="printDDT()"
            class="px-4 py-2 text-sm font-medium text-brand-text bg-white border border-brand-border hover:bg-gray-50 shadow-sm rounded-lg transition-colors">
            Print DDT / Invoice
          </button>
        </div>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: Order Summary (2 cols) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Order Items -->
            <div class="bg-white rounded-xl shadow-sm border border-brand-border p-6">
              <h2 class="text-lg font-semibold text-brand-text font-heading mb-4">Order Items</h2>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-brand-border">
                  <thead>
                  <tr class="border-b border-brand-border">
                    <th class="text-left text-xs font-medium text-brand-muted uppercase tracking-wider py-3">Product</th>
                    <th class="text-right text-xs font-medium text-brand-muted uppercase tracking-wider py-3">Qty</th>
                    <th class="text-right text-xs font-medium text-brand-muted uppercase tracking-wider py-3">Unit Price</th>
                    <th class="text-right text-xs font-medium text-brand-muted uppercase tracking-wider py-3">Total</th>
                  </tr>
                  </thead>
                  <tbody class="divide-y divide-brand-border">
                    @for (item of order.items; track item.id) {
                      <tr class="hover:bg-gray-50 transition-colors">
                        <td class="py-4 text-sm text-brand-text font-medium">{{ item.productName }}</td>
                        <td class="py-4 text-sm text-brand-text text-right">{{ item.quantity }}</td>
                        <td class="py-4 text-sm text-brand-muted text-right">{{ item.priceAtPurchase | currency:'EUR' }}</td>
                        <td class="py-4 text-sm text-brand-text text-right font-semibold">{{ item.lineTotal | currency:'EUR' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Totals -->
              <div class="mt-6 border-t border-brand-border pt-4 w-full sm:w-1/2 ml-auto space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-brand-muted">Subtotal</span>
                  <span class="text-brand-text font-medium">{{ order.subtotal | currency:'EUR' }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-brand-muted">Shipping</span>
                  <span class="text-brand-text font-medium">{{ order.shippingCost | currency:'EUR' }}</span>
                </div>
                <div class="flex justify-between text-lg font-bold border-t border-brand-border pt-3">
                  <span class="text-brand-text">Grand Total</span>
                  <span class="text-brand-primary">{{ order.totalAmount | currency:'EUR' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Customer & Addresses -->
          <div class="space-y-6">
            <!-- Customer Info -->
            <div class="bg-white rounded-xl shadow-sm border border-brand-border p-6">
              <h2 class="text-lg font-semibold text-brand-text font-heading mb-4">Customer Details</h2>
              <div class="space-y-4">
                <div>
                  <span class="text-xs text-brand-muted uppercase tracking-wider font-medium">Name</span>
                  <p class="text-sm text-brand-text font-medium mt-1">{{ order.customer?.firstName }} {{ order.customer?.lastName }}</p>
                </div>
                <div>
                  <span class="text-xs text-brand-muted uppercase tracking-wider font-medium">Email</span>
                  <p class="text-sm text-brand-text mt-1">
                    <a href="mailto:{{ order.customer?.email }}" class="text-brand-primary hover:underline">{{ order.customer?.email }}</a>
                  </p>
                </div>
                @if (order.customer?.phone) {
                  <div>
                    <span class="text-xs text-brand-muted uppercase tracking-wider font-medium">Phone</span>
                    <p class="text-sm text-brand-text mt-1">{{ order.customer?.phone }}</p>
                  </div>
                }
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="bg-white rounded-xl shadow-sm border border-brand-border p-6">
              <h2 class="text-lg font-semibold text-brand-text font-heading mb-4">Shipping Address</h2>
              @if (order.shippingAddress) {
                <div class="space-y-1 text-sm text-brand-text leading-relaxed">
                  <p class="font-medium">{{ order.customer?.firstName }} {{ order.customer?.lastName }}</p>
                  <p>{{ order.shippingAddress.street }} {{ order.shippingAddress.houseNumber }}</p>
                  <p>{{ order.shippingAddress.zipCode }} {{ order.shippingAddress.city }} ({{ order.shippingAddress.province }})</p>
                  <p>{{ order.shippingAddress.country }}</p>
                  @if (order.shippingAddress.additionalInfo) {
                    <div class="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-brand-muted text-xs">
                      <strong>Note:</strong> {{ order.shippingAddress.additionalInfo }}
                    </div>
                  }
                </div>
              } @else {
                <p class="text-sm text-brand-muted italic">No shipping address provided</p>
              }
            </div>

            <!-- Billing Address -->
            <div class="bg-white rounded-xl shadow-sm border border-brand-border p-6">
              <h2 class="text-lg font-semibold text-brand-text font-heading mb-4">Billing Address</h2>

              <!-- Logic to check if billing matches shipping ID -->
              @if (order.billingAddress && order.shippingAddress && order.billingAddress.id === order.shippingAddress.id) {
                <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-brand-muted text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Same as shipping address</span>
                </div>
              } @else if (order.billingAddress) {
                <div class="space-y-1 text-sm text-brand-text leading-relaxed">
                  <p class="font-medium">{{ order.customer?.firstName }} {{ order.customer?.lastName }}</p>
                  <p>{{ order.billingAddress.street }} {{ order.billingAddress.houseNumber }}</p>
                  <p>{{ order.billingAddress.zipCode }} {{ order.billingAddress.city }} ({{ order.billingAddress.province }})</p>
                  <p>{{ order.billingAddress.country }}</p>
                  @if (order.billingAddress.additionalInfo) {
                    <p class="text-brand-muted mt-2 text-xs">{{ order.billingAddress.additionalInfo }}</p>
                  }
                </div>
              } @else {
                <p class="text-sm text-brand-muted italic">No billing address provided</p>
              }
            </div>

            <!-- Order Info -->
            <div class="bg-white rounded-xl shadow-sm border border-brand-border p-6">
              <h2 class="text-lg font-semibold text-brand-text font-heading mb-4">Order Meta</h2>
              <div class="space-y-4">
                <div>
                  <span class="text-xs text-brand-muted uppercase tracking-wider font-medium">Created Date</span>
                  <p class="text-sm text-brand-text mt-1">{{ order.createdAt | date:'medium' }}</p>
                </div>
                <div>
                  <span class="text-xs text-brand-muted uppercase tracking-wider font-medium">Payment Status</span>
                  <div class="mt-1">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-800': order.paymentStatus === 'COMPLETED',
                            'bg-yellow-100 text-yellow-800': order.paymentStatus === 'PENDING',
                            'bg-red-100 text-red-800': order.paymentStatus === 'FAILED' || order.paymentStatus === 'CANCELLED'
                          }">
                      {{ order.paymentStatus }}
                    </span>
                  </div>
                </div>
                @if(order.stripeSessionId) {
                  <div>
                    <span class="text-xs text-brand-muted uppercase tracking-wider font-medium">Stripe Session</span>
                    <p class="text-xs text-gray-400 font-mono mt-1 truncate" title="{{ order.stripeSessionId }}">
                      {{ order.stripeSessionId }}
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly orderService = inject(OrderService);
  private readonly ui = inject(UiService);
  private readonly cdr = inject(ChangeDetectorRef);

  order: any | null = null;
  loading = true;
  error = '';
  shortId = '';

  orderStatuses = Object.values(OrderStatus);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.shortId = id.substring(0, 8);
      this.loadOrder(id);
    } else {
      this.error = 'Invalid order ID.';
      this.loading = false;
    }
  }

  private loadOrder(id: string): void {
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load order.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onStatusChange(newStatus: string): void {
    if (!this.order) return;
    const oldStatus = this.order.status;

    this.orderService.updateOrderStatus(this.order.id, newStatus).subscribe({
      next: (updatedOrder) => {
        this.order = { ...this.order, status: updatedOrder.status };
        this.ui.showSuccess(`Order status updated to ${this.formatStatus(newStatus)}`);
        this.cdr.detectChanges();
      },
      error: () => {
        this.ui.showError('Failed to update order status');
        // Rollback visivo in caso di errore
        this.order.status = oldStatus;
        this.cdr.detectChanges();
      },
    });
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.charAt(0) + status.slice(1).toLowerCase();
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PAID':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-white text-gray-900 border-gray-200';
    }
  }

  printShippingLabel(): void {
    this.ui.showInfo('Printing feature coming soon');
  }

  printDDT(): void {
    this.ui.showInfo('Printing feature coming soon');
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }
}
