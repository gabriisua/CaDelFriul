import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';
import { DataGridComponent, GridColumn, GridAction } from '../../shared/components/data-grid/data-grid.component';
import { LogsDialogComponent } from '../../shared/components/logs-dialog/logs-dialog.component';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, DataGridComponent, LogsDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-brand-text font-heading">Customer Management</h1>
      </div>

      @if (loading) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      } @else if (error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700">{{ error }}</p>
        </div>
      } @else if (customers.length === 0) {
        <div class="bg-white/80 rounded-xl shadow p-8 text-center">
          <p class="text-brand-muted">No customers found.</p>
        </div>
      } @else {
        <app-data-grid [data]="customers" [columns]="columns" [actions]="actions"></app-data-grid>
      }
    </div>

    <app-logs-dialog
      [open]="showLogsDialog"
      [title]="logsTitle"
      [logs]="selectedLogs"
      (close)="showLogsDialog = false">
    </app-logs-dialog>
  `,
})
export class CustomersComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ui = inject(UiService);

  customers: Customer[] = [];
  loading = true;
  error = '';

  showLogsDialog = false;
  selectedLogs: any[] = [];
  logsTitle = '';

  columns: GridColumn[] = [
    { header: 'Name', field: 'fullName', type: 'text' },
    { header: 'Email', field: 'email', type: 'text' },
    { header: 'Status', field: 'active', type: 'status' },
  ];

  actions: GridAction[] = [
    { label: 'View Logs', icon: 'logs', action: (row) => this.openLogs(row) },
    { label: 'Delete', icon: 'delete', action: (row) => this.openDelete(row) },
  ];

  ngOnInit(): void {
    this.loadCustomers();
  }

  async openDelete(customer: Customer): Promise<void> {
    if (await this.ui.confirm('Delete Customer', `Are you sure you want to delete ${customer.firstName} ${customer.lastName}? This will also delete their logs and order history.`)) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.ui.showSuccess('Customer deleted');
          this.loadCustomers();
        },
        error: () => {
          this.ui.showError('Failed to delete customer');
        },
      });
    }
  }

  openLogs(customer: Customer): void {
    this.customerService.getCustomerLogs(customer.id).subscribe({
      next: (logs) => {
        this.selectedLogs = logs;
        this.logsTitle = 'Logs - ' + customer.firstName + ' ' + customer.lastName;
        this.showLogsDialog = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.ui.showError('Failed to load customer logs');
      },
    });
  }

  private loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers.map(c => ({
          ...c,
          fullName: `${c.firstName} ${c.lastName}`,
        }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load customers.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
