import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Staff, StaffLog } from '../models/staff.model';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly api = inject(ApiService);

  getStaff(): Observable<Staff[]> {
    return this.api.get<Staff[]>('/staff');
  }

  getStaffById(id: string): Observable<Staff> {
    return this.api.get<Staff>(`/staff/${id}`);
  }

  createStaff(staff: Partial<Staff>): Observable<Staff> {
    return this.api.post<Staff>('/staff', staff);
  }

  updateStaff(id: string, staff: Partial<Staff>): Observable<Staff> {
    return this.api.put<Staff>(`/staff/${id}`, staff);
  }

  deleteStaff(id: string): Observable<void> {
    return this.api.delete<void>(`/staff/${id}`);
  }

  getStaffLogs(id: string): Observable<StaffLog[]> {
    return this.api.get<StaffLog[]>(`/staff/${id}/logs`);
  }
}
