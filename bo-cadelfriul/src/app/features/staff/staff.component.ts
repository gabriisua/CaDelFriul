import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffService } from '../../core/services/staff.service';
import { Staff, StaffRequest } from '../../core/models/staff.model';
import { DataGridComponent, GridColumn, GridAction } from '../../shared/components/data-grid/data-grid.component';
import { StaffEditDialogComponent } from './components/staff-edit-dialog/staff-edit-dialog.component';
import { LogsDialogComponent } from '../../shared/components/logs-dialog/logs-dialog.component';
import { StaffLog } from '../../core/models/staff.model';
import { UiService } from '../../core/services/ui.service';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, DataGridComponent, StaffEditDialogComponent, LogsDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-brand-text font-heading">Staff Management</h1>
        <button class="px-4 py-2 text-sm font-medium text-brand-text bg-brand-primary hover:opacity-80 rounded-lg" (click)="openCreate()">+ Add Staff</button>
      </div>

      @if (loading) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      } @else if (error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700">{{ error }}</p>
        </div>
      } @else if (staff.length === 0) {
        <div class="bg-white/80 rounded-xl shadow p-8 text-center">
          <p class="text-brand-muted">No staff members found.</p>
        </div>
      } @else {
        <app-data-grid [data]="staff" [columns]="columns" [actions]="actions"></app-data-grid>
      }
    </div>

    <app-staff-edit-dialog
      [open]="showEditDialog"
      [staffMember]="staffToEdit"
      (save)="onSaveStaff($event)"
      (cancel)="showEditDialog = false">
    </app-staff-edit-dialog>

    <app-logs-dialog
      [open]="showLogsDialog"
      [title]="logsTitle"
      [logs]="selectedLogs"
      (close)="showLogsDialog = false">
    </app-logs-dialog>
  `,
})
export class StaffComponent implements OnInit {
  private readonly staffService = inject(StaffService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ui = inject(UiService);

  staff: Staff[] = [];
  loading = true;
  error = '';

  showEditDialog = false;
  showLogsDialog = false;
  staffToEdit: Staff | null = null;
  selectedLogs: StaffLog[] = [];
  logsTitle = '';

  columns: GridColumn[] = [
    { header: 'Name', field: 'fullName', type: 'text' },
    { header: 'Email', field: 'email', type: 'text' },
    { header: 'Role', field: 'role', type: 'status' },
  ];

  actions: GridAction[] = [
    { label: 'Edit', icon: 'edit', action: (row) => this.openEdit(row) },
    { label: 'Delete', icon: 'delete', action: (row) => this.openDelete(row) },
    { label: 'View Logs', icon: 'logs', action: (row) => this.openLogs(row) },
  ];

  ngOnInit(): void {
    this.loadStaff();
  }

  openCreate(): void {
    this.staffToEdit = null;
    this.showEditDialog = true;
  }

  openEdit(staffMember: Staff): void {
    this.staffToEdit = staffMember;
    this.showEditDialog = true;
  }

  async openDelete(staffMember: Staff): Promise<void> {
    if (await this.ui.confirm('Delete Staff Member', `Are you sure you want to delete ${staffMember.fullName}?`)) {
      this.staffService.deleteStaff(staffMember.id).subscribe({
        next: () => {
          this.ui.showSuccess('Staff member deleted');
          this.loadStaff();
        },
        error: () => {
          this.ui.showError('Failed to delete staff member');
        },
      });
    }
  }

  openLogs(staffMember: Staff): void {
    this.staffService.getStaffLogs(staffMember.id).subscribe({
      next: (logs) => {
        this.selectedLogs = logs;
        this.logsTitle = 'Logs - ' + staffMember.fullName;
        this.showLogsDialog = true;
        this.cdr.detectChanges();
      },
      error: () => {
        this.ui.showError('Failed to load staff logs');
      },
    });
  }

  onSaveStaff(data: StaffRequest): void {
    if (this.staffToEdit) {
      this.staffService.updateStaff(this.staffToEdit.id, data).subscribe({
        next: () => {
          this.ui.showSuccess('Staff member updated');
          this.showEditDialog = false;
          this.staffToEdit = null;
          this.loadStaff();
        },
        error: () => {
          this.ui.showError('Failed to update staff member');
          this.showEditDialog = false;
        },
      });
    } else {
      this.staffService.createStaff(data).subscribe({
        next: () => {
          this.ui.showSuccess('Staff member created');
          this.showEditDialog = false;
          this.loadStaff();
        },
        error: () => {
          this.ui.showError('Failed to create staff member');
          this.showEditDialog = false;
        },
      });
    }
  }

  private loadStaff(): void {
    this.staffService.getStaff().subscribe({
      next: (staff) => {
        this.staff = staff;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load staff.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
