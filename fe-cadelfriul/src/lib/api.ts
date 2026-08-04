import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const TOKEN_COOKIE = "accessToken";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface CustomerDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface Address {
  id: string;
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  province: string;
  country: string;
  additionalInfo?: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface AddressRequest {
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  province: string;
  country: string;
  additionalInfo?: string;
}

export class AuthError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`Request failed with status ${status}`);
    this.name = "AuthError";
    this.status = status;
    this.body = body;
  }
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_COOKIE);
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_COOKIE, token, { path: "/", sameSite: "lax" });
}

export function removeToken(): void {
  Cookies.remove(TOKEN_COOKIE, { path: "/" });
}

export function getImageUrl(filename: string): string {
  if (filename.startsWith("http")) return filename;
  return `${API_BASE_URL}${filename}`;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  attributes?: Record<string, string>;
  available: boolean;
  stockQuantity: number;
}
export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface OrderRequest {
  shippingAddressId: string;
  items: OrderItemRequest[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customerEmail: string;
  customerId: string;
  shippingAddressId: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface CreateRoomReservationResponse {
  id: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  stripeCheckoutUrl?: string; // The crucial link for Stripe
}

export async function fetchProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/api/products");
}

export async function fetchProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`);
}

export interface OrderResponse {
  id: string;
  createdAt: string;
  customerEmail: string;
  customerId: string;
  shippingAddressId: string;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

export interface CheckoutSessionResponse {
  sessionId: string;
  sessionUrl: string;
}

export async function placeOrder(order: OrderRequest): Promise<OrderResponse> {
  return apiFetch<OrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });
}

export async function createCheckoutSession(
  orderId: string
): Promise<CheckoutSessionResponse> {
  return apiFetch<CheckoutSessionResponse>(
    `/api/orders/${orderId}/checkout`,
    {
      method: "POST",
    }
  );
}

export async function fetchOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/api/orders");
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new AuthError(res.status, null);
    }
    const body = await res.json().catch(() => null);
    throw new AuthError(res.status, body);
  }

  return res.json() as Promise<T>;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password } satisfies LoginRequest),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new AuthError(res.status, body);
  }

  const data: LoginResponse = await res.json();
  setToken(data.token);
  return data;
}

export async function fetchProfile(): Promise<UserResponse> {
  return apiFetch<UserResponse>("/api/auth/me");
}

export async function fetchCustomerDetails(
  customerId: string
): Promise<CustomerDetails> {
  return apiFetch<CustomerDetails>(`/api/customers/${customerId}`);
}

export async function updateProfile(
  customerId: string,
  data: UpdateProfileRequest
): Promise<UserResponse> {
  return apiFetch<UserResponse>(`/api/customers/${customerId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function logout(): Promise<void> {
  removeToken();
}

export async function fetchAddresses(customerId: string): Promise<Address[]> {
  return apiFetch<Address[]>(`/api/customers/${customerId}/addresses`);
}

export async function addAddress(
  customerId: string,
  address: AddressRequest
): Promise<Address> {
  return apiFetch<Address>(`/api/customers/${customerId}/addresses`, {
    method: "POST",
    body: JSON.stringify(address),
  });
}

export async function updateAddress(
  customerId: string,
  addressId: string,
  address: AddressRequest
): Promise<Address> {
  return apiFetch<Address>(
    `/api/customers/${customerId}/addresses/${addressId}`,
    {
      method: "PUT",
      body: JSON.stringify(address),
    }
  );
}

export async function deleteAddress(
  customerId: string,
  addressId: string
): Promise<void> {
  await apiFetch<void>(
    `/api/customers/${customerId}/addresses/${addressId}`,
    {
      method: "DELETE",
    }
  );
}

export interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  amenities: string[];
  imageUrls: string[];
  maxCapacity?: number;
}

export function getRoomImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
}

export async function fetchRooms(): Promise<Room[]> {
  return apiFetch<Room[]>("/api/rooms");
}

export interface RoomReservationRequest {
  roomId: string;
  checkInDate: string; // "yyyy-MM-dd"
  checkOutDate: string; // "yyyy-MM-dd"
}

export interface RoomReservationResponse {
  id: string; // UUID
  room: { id: string; name: string };
  userId: string;
  checkInDate: string; // "YYYY-MM-DD"
  checkOutDate: string; // "YYYY-MM-DD"
  totalPrice: number; // BigDecimal serialized as JSON number
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

export async function fetchRoom(id: string): Promise<Room> {
  return apiFetch<Room>(`/api/rooms/${id}`);
}

export async function fetchRoomBookedDates(id: string): Promise<string[]> {
  return apiFetch<string[]>(`/api/rooms/${id}/booked-dates`);
}

export async function createRoomReservation(
    req: RoomReservationRequest
): Promise<CreateRoomReservationResponse> {
  return apiFetch<CreateRoomReservationResponse>("/api/reservations/rooms", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function fetchMyRoomReservations(): Promise<
  RoomReservationResponse[]
> {
  return apiFetch<RoomReservationResponse[]>("/api/reservations/rooms/me");
}

export async function setDefaultShipping(
  customerId: string,
  addressId: string
): Promise<Address> {
  return apiFetch<Address>(
    `/api/customers/${customerId}/addresses/${addressId}/default-shipping`,
    {
      method: "PATCH",
    }
  );
}
