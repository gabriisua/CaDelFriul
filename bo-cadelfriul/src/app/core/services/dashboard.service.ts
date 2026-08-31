import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// Assicurati che il percorso dell'environment sia corretto per la tua alberatura
import { environment } from '../../../environments/environment';

// L'interfaccia che mappa esattamente il DTO di Spring Boot
export interface AdminDashboardResponse {
  totalOrders: number;
  revenue: number;
  activeStaff: number;
  customers: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // Se usi un prefisso globale diverso, aggiornalo qui
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Recupera le statistiche per la dashboard di amministrazione
   */
  getAdminDashboardStats(): Observable<AdminDashboardResponse> {
    return this.http.get<AdminDashboardResponse>(`${this.apiUrl}/api/admin/dashboard`);
  }
}
