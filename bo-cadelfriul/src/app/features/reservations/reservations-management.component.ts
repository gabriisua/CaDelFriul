import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../../core/services/reservation.service';
import { AdminRoomReservationResponse } from '../../core/models/reservation.model';

@Component({
  selector: 'app-reservations-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-brand-text font-heading">Reservations Management</h1>
      </div>

      @if (loading) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      } @else if (error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700">{{ error }}</p>
        </div>
      } @else if (reservations.length === 0) {
        <div class="bg-white/80 rounded-xl shadow p-8 text-center">
          <p class="text-brand-muted">No reservations found.</p>
        </div>
      } @else {
        <div class="bg-white/80 rounded-xl shadow overflow-hidden">
          <table class="min-w-full divide-y divide-brand-border">
            <thead class="bg-brand-secondary/30">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider font-heading">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider font-heading">Room</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider font-heading">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider font-heading">Dates</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider font-heading">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider font-heading">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider font-heading">Actions</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-brand-border">
              @for (reservation of reservations; track reservation.id) {
                <tr class="hover:bg-brand-bg/50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-brand-text">{{ reservation.id.slice(0, 8) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-brand-text">{{ reservation.room.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-brand-text">{{ reservation.customerEmail }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-brand-text">{{ reservation.checkInDate }} → {{ reservation.checkOutDate }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-brand-text">{{ reservation.totalPrice | currency:'EUR' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                    <span [class]="getStatusBadgeClass(reservation.status)">{{ reservation.status }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                    @if (reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') {
                      <button
                        (click)="cancelReservation(reservation.id)"
                        class="px-3 py-1 text-xs font-medium rounded-md text-white bg-brand-destructive hover:opacity-80 focus:outline-none">
                        Cancel
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class ReservationsManagementComponent implements OnInit {
  private readonly reservationService = inject(ReservationService);
  private readonly cdr = inject(ChangeDetectorRef);

  reservations: AdminRoomReservationResponse[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadReservations();
  }

  private loadReservations(): void {
    this.reservationService.getAdminReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load reservations.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  cancelReservation(id: string): void {
    this.reservationService.updateReservationStatus(id, 'CANCELLED').subscribe({
      next: (updated) => {
        this.reservations = this.reservations.map((r) =>
          r.id === updated.id ? updated : r,
        );
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to cancel reservation.';
        this.cdr.detectChanges();
      },
    });
  }

  getStatusBadgeClass(status: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ';
    switch (status) {
      case 'PENDING':
        return `${base}bg-yellow-100 text-yellow-800`;
      case 'CONFIRMED':
        return `${base}bg-green-100 text-green-800`;
      case 'CANCELLED':
        return `${base}bg-red-100 text-red-800`;
      default:
        return `${base}bg-gray-100 text-gray-800`;
    }
  }
}
