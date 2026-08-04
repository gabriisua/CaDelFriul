import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AdminRoomReservationResponse,
  AdminReservationPage,
  AdminRoomReservationStatus,
} from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/reservations/rooms`;

  getAdminReservations(): Observable<AdminRoomReservationResponse[]> {
    return this.http
      .get<AdminReservationPage>(this.baseUrl)
      .pipe(map((page) => page.content));
  }

  updateReservationStatus(id: string, status: string): Observable<any> {
    // JSON.stringify trasforma 'CANCELLED' in '"CANCELLED"'
    return this.http.put(
      `${environment.apiUrl}/api/reservations/rooms/${id}/status`,
      JSON.stringify(status),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
