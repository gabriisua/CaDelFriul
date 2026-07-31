import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Order, OrderDetail } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  getOrders(): Observable<Order[]> {
    return this.api.get<Order[]>('/orders');
  }

  getOrderById(id: string): Observable<OrderDetail> {
    return this.api.get<OrderDetail>(`/orders/${id}`);
  }

  updateOrderStatus(id: string, status: string): Observable<OrderDetail> {
    return this.api.put<OrderDetail>(`/orders/${id}/status`, { status });
  }
}
