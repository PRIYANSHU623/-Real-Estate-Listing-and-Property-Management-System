export type UserRole = 'OWNER' | 'TENANT' | 'ADMIN';

export type PropertyType =
  | 'APARTMENT'
  | 'HOUSE'
  | 'VILLA'
  | 'STUDIO'
  | 'PLOT'
  | 'COMMERCIAL';

export type PropertyStatus =
  | 'AVAILABLE'
  | 'BOOKED'
  | 'OCCUPIED'
  | 'INACTIVE';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED';

export type LeaseStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'EXPIRED'
  | 'TERMINATED';

export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentPurpose =
  | 'RENT'
  | 'SECURITY_DEPOSIT'
  | 'BOOKING_FEE';

export type TicketPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type NotificationType =
  | 'PAYMENT'
  | 'BOOKING'
  | 'MAINTENANCE'
  | 'LEASE'
  | 'SYSTEM';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
}

export interface Property {
  id: number;
  owner_id: number;
  title: string;
  description?: string | null;
  property_type: PropertyType;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  area?: number | null;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
}

export interface PropertyCreateInput {
  title: string;
  description?: string;
  property_type: PropertyType;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  status?: PropertyStatus;
}

export interface PropertyUpdateInput {
  title?: string;
  description?: string;
  property_type?: PropertyType;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  rent?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  status?: PropertyStatus;
}

export interface Booking {
  id: number;
  property_id: number;
  tenant_id: number;
  status: BookingStatus;
  booking_date: string;
  message?: string | null;
  created_at: string;
  property?: Property;
  tenant?: User;
}

export interface BookingCreateInput {
  property_id: number;
  booking_date: string;
  message?: string;
}

export interface Lease {
  id: number;
  property_id: number;
  tenant_id: number;
  owner_id: number;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  status: LeaseStatus;
  agreement_url?: string | null;
  created_at: string;
  property?: Property;
  tenant?: User;
}

export interface LeaseCreateInput {
  property_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit: number;
  agreement_url?: string;
}

export interface LeaseUpdateInput {
  start_date?: string;
  end_date?: string;
  monthly_rent?: number;
  security_deposit?: number;
  status?: LeaseStatus;
  agreement_url?: string;
}

export interface PaymentOrderCreateInput {
  property_id: number;
  lease_id?: number | null;
  amount: number;
  purpose: PaymentPurpose;
}

export interface PaymentOrderResponse {
  payment_id: number;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  razorpay_key_id: string;
}

export interface PaymentVerifyInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface Payment {
  id: number;
  tenant_id: number;
  property_id: number;
  lease_id?: number | null;
  amount: number;
  currency: string;
  purpose: PaymentPurpose;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  status: PaymentStatus;
  payment_date?: string | null;
  failure_reason?: string | null;
  created_at: string;
  property?: Property;
}

export interface MaintenanceTicket {
  id: number;
  property_id: number;
  tenant_id: number;
  vendor_id?: number | null;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  property?: Property;
  vendor?: Vendor;
}

export interface TicketCreateInput {
  property_id: number;
  title: string;
  description: string;
  priority?: TicketPriority;
}

export interface TicketUpdateInput {
  title?: string;
  description?: string;
  priority?: TicketPriority;
}

export interface Vendor {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  service_type: string;
  is_active: boolean;
  created_at: string;
}

export interface VendorCreateInput {
  name: string;
  phone?: string;
  email?: string;
  service_type: string;
  is_active?: boolean;
}

export interface VendorUpdateInput {
  name?: string;
  phone?: string;
  email?: string;
  service_type?: string;
  is_active?: boolean;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

export interface OwnerAnalytics {
  total_properties: number;
  occupied_properties: number;
  vacant_properties: number;
  occupancy_rate: number;
  total_revenue: number;
  pending_payments: number;
  open_maintenance_tickets: number;
  active_tenants: number;
}

export interface AdminAnalytics {
  total_users: number;
  total_owners: number;
  total_tenants: number;
  total_properties: number;
  occupied_properties: number;
  vacant_properties: number;
  occupancy_rate: number;
  total_revenue: number;
  pending_payments: number;
  open_maintenance_tickets: number;
  active_leases: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
