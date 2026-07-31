export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerLog {
  id: string;
  customerId: string;
  action: string;
  details: string;
  timestamp: string;
}
