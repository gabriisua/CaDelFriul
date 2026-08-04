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

  updateReservationStatus(
    id: string,
    status: AdminRoomReservationStatus,
  ): Observable<AdminRoomReservationResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<AdminRoomReservationResponse>(
      `${this.baseUrl}/${id}/status`,
      status,
      { headers },
    );
  }
}
