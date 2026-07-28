export interface Staff {
  id: string;
  email: string;
  fullName: string;
  role: string;
  password?: string;
}

export interface StaffRequest {
  email: string;
  fullName: string;
  role: string;
  password?: string;
}

export enum StaffRole {
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface StaffLog {
  id: string;
  staffId: string;
  action: string;
  details: string;
  timestamp: string;
}
