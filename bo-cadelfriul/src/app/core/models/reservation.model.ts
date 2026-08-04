export type AdminRoomReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface AdminRoomReservationResponse {
  id: string;
  room: { id: string; name: string };
  customerEmail: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: AdminRoomReservationStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminReservationPage {
  content: AdminRoomReservationResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
