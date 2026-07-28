import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Room, RoomRequest } from '../models/room.model';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  getRooms(): Observable<Room[]> {
    return this.api.get<Room[]>('/rooms');
  }

  getRoomById(id: string): Observable<Room> {
    return this.api.get<Room>(`/rooms/${id}`);
  }

  createRoom(room: RoomRequest): Observable<Room> {
    return this.api.post<Room>('/rooms', room);
  }

  updateRoom(id: string, room: RoomRequest): Observable<Room> {
    return this.api.put<Room>(`/rooms/${id}`, room);
  }

  deleteRoom(id: string): Observable<void> {
    return this.api.delete<void>(`/rooms/${id}`);
  }

  uploadImages(roomId: string, formData: FormData): Observable<Room> {
    // URL assoluto "hardcoded" verso Spring Boot
    const url = `http://localhost:8080/api/admin/rooms/${roomId}/images`;
    return this.http.post<Room>(url, formData);
  }
}
