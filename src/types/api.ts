/** Shared API types — mirror the Django serializers one-to-one. */

export interface Paginated<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CursorPage<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail: string;
  code: string;
  errors?: Record<string, string[] | Record<string, string[]>>;
  request_id?: string;
}

export type Role = "owner" | "admin" | "buyer" | "viewer";
export type Gender = "men" | "women" | "unisex" | "boys" | "girls" | "youth";
export type Quality = "economy" | "standard" | "premium" | "elite";
export type PaymentTerms = "prepaid" | "deposit_50" | "net_15" | "net_30" | "net_60";
export type PaymentMethod = "bank_transfer" | "net_terms" | "card";
export type OrderStatus =
  | "pending_approval"
  | "pending_payment"
  | "confirmed"
  | "in_production"
  | "quality_check"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";
export type PaymentStatus = "unpaid" | "deposit_paid" | "paid" | "overdue" | "refunded";
export type QuoteStatus = "submitted" | "under_review" | "quoted" | "accepted" | "declined" | "expired" | "converted";

export interface CompanyBrief {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  country: string;
  currency: string;
  payment_terms: PaymentTerms;
  is_verified: boolean;
  customer_group: string | null;
  approval_threshold: number;
  logo: string | null;
}

export interface Membership {
  company: CompanyBrief;
  role: Role;
  is_default: boolean;
  order_limit: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  job_title: string;
  avatar_url: string;
  is_staff: boolean;
  is_email_verified: boolean;
  auth_provider: "email" | "google";
  marketing_opt_in: boolean;
  notification_preferences: Record<string, boolean>;
  memberships: Membership[];
  has_password: boolean;
  created_at: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Company extends CompanyBrief {
  legal_name: string;
  tax_id: string;
  website: string;
  email: string;
  phone: string;
  credit_limit: number;
  credit_used: number;
  credit_available: number;
  member_count: number;
  created_at: string;
}

export interface CompanyMember {
  id: number;
  email: string;
  full_name: string;
  user: User;
  role: Role;
  is_active: boolean;
  order_limit: number;
  created_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  status: "pending" | "accepted" | "revoked" | "expired";
  invited_by: string;
  company: string;
  expires_at: string;
  created_at: string;
}

export interface Address {
  id: string;
  kind: "shipping" | "billing";
  label: string;
  contact_name: string;
  contact_phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at?: string;
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image: string | null;
  description: string;
  product_count: number;
  depth: number;
  children: CategoryNode[];
}

export interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  meta_title: string;
  meta_description: string;
  breadcrumbs: { name: string; slug: string }[];
  children: CategoryNode[];
  product_count: number;
}

export interface Fabric {
  id: string;
  name: string;
  slug: string;
  composition: string;
  gsm: number;
  quality: Quality;
  quality_rank: number;
  price_pkr: number;
  price_unit: "kg" | "m";
  width_inches: number;
  description: string;
  features: string[];
  best_for: string[];
  typical_mills: string;
  is_available_in_pakistan: boolean;
  image: string | null;
  swatch_color: string;
  price_updated_at: string | null;
}

export interface ProductImage {
  id: number;
  url: string;
  alt: string;
  is_primary: boolean;
  width: number | null;
  height: number | null;
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  category_name: string;
  short_description: string;
  image: { url: string; alt: string; width: number | null; height: number | null } | null;
  base_price: number;
  compare_at_price: number | null;
  min_order_quantity: number;
  lead_time_days: number;
  genders: Gender[];
  colors: string[];
  base_fabric: string;
  is_featured: boolean;
  is_new: boolean;
  is_customizable: boolean;
}

export interface Size {
  id: number;
  label: string;
  sort_order: number;
  surcharge_percent: number;
  chest_cm: string;
  length_cm: string;
}

export interface FabricOption {
  fabric: Fabric;
  price_adjustment: number;
  is_default: boolean;
  unit_fabric_cost: number | null;
}

export interface SizeOption {
  gender: Gender;
  size: Size;
}

export interface ProductDetail extends ProductCard {
  description: string;
  specifications: Record<string, string>;
  tags: string[];
  images: ProductImage[];
  fabric_options: FabricOption[];
  size_options: SizeOption[];
  size_group: { id: number; name: string; slug: string; sizes: Size[] };
  labor_price: number;
  fabric_consumption_kg: string;
  order_increment: number;
  is_made_to_order: boolean;
  stock_quantity: number;
  customization_options: {
    logo_placements?: string[];
    print_methods?: string[];
    name_number?: boolean;
    sponsor_logos?: boolean;
  };
  volume_tiers: { min_quantity: number; discount_percent: number }[];
  breadcrumbs: { name: string; slug: string }[];
  meta_title: string;
  meta_description: string;
}

export interface BreakdownLine {
  gender: Gender;
  size_id: number;
  quantity: number;
  size?: string;
}

export interface PriceLine {
  gender: Gender;
  size_id: number;
  size_label: string;
  quantity: number;
  surcharge_percent: number;
  unit_price: number;
  line_total: number;
}

export interface PriceBreakdown {
  currency: string;
  quantity: number;
  labor_price: number;
  fabric_cost: number;
  fabric_adjustment: number;
  list_unit_price: number;
  group_discount_percent: number;
  volume_discount_percent: number;
  contract_unit_price: number | null;
  unit_price: number;
  subtotal: number;
  savings: number;
  lines: PriceLine[];
  next_tier: { min_quantity: number; discount_percent: number; more_needed: number } | null;
  error?: string;
}

export interface CartItem {
  id: string;
  product: ProductCard;
  fabric: string;
  fabric_name: string;
  breakdown: BreakdownLine[];
  quantity: number;
  color: string;
  customization: Record<string, unknown>;
  artwork: string | null;
  notes: string;
  unit_price: number;
  line_total: number;
  price_breakdown: PriceBreakdown;
  updated_at: string;
}

export interface Cart {
  id: string;
  guest_token: string | null;
  currency: string;
  items: CartItem[];
  item_count: number;
  quantity: number;
  subtotal: number;
  savings: number;
  notes: string;
}

export interface SavedListItem {
  id: string;
  product: ProductCard;
  fabric: string | null;
  breakdown: BreakdownLine[];
  color: string;
  customization: Record<string, unknown>;
  notes: string;
}

export interface SavedList {
  id: string;
  name: string;
  description: string;
  is_shared: boolean;
  created_by: string;
  item_count: number;
  items: SavedListItem[];
  updated_at: string;
}

export interface ShippingMethod {
  name: string;
  code: string;
  description: string;
  base_price: number;
  price_per_kg: number;
  min_days: number;
  max_days: number;
}

export interface OrderItem {
  id: string;
  product_slug: string | null;
  product_name: string;
  sku: string;
  fabric_name: string;
  image_url: string;
  breakdown: BreakdownLine[];
  quantity: number;
  color: string;
  customization: Record<string, unknown>;
  artwork: string | null;
  notes: string;
  unit_price: number;
  line_total: number;
  price_breakdown: PriceBreakdown;
}

export interface OrderHistory {
  from_status: string;
  to_status: OrderStatus;
  note: string;
  changed_by: string;
  created_at: string;
}

export interface OrderSummary {
  id: string;
  number: string;
  status: OrderStatus;
  status_display: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  po_number: string;
  currency: string;
  grand_total: number;
  amount_paid: number;
  balance_due: number;
  total_quantity: number;
  item_count: number;
  placed_by: string;
  estimated_ship_date: string | null;
  tracking_number: string;
  created_at: string;
}

export interface AddressSnapshot {
  contact_name: string;
  contact_phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order extends OrderSummary {
  company: string;
  items: OrderItem[];
  history: OrderHistory[];
  shipping_method: ShippingMethod | null;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  shipping_address: AddressSnapshot;
  billing_address: AddressSnapshot;
  carrier: string;
  tracking_url: string;
  customer_notes: string;
  requested_delivery_date: string | null;
  due_date: string | null;
  payment_terms: PaymentTerms;
  approved_by: string;
  approved_at: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string;
  can_cancel: boolean;
  quote: number | null;
}

export interface Invoice extends Order {
  document_type: string;
  bank_accounts: BankAccount[];
  seller: { name: string; address: string; email: string };
}

export interface OrdersSummary {
  total: number;
  open: number;
  pending_approval: number;
  awaiting_payment: number;
  in_production: number;
  shipped: number;
  spent: number;
  outstanding: number;
}

export interface TrackingInfo {
  number: string;
  status: OrderStatus;
  status_display: string;
  steps: { status: OrderStatus; label: string; reached: boolean }[];
  timeline: { status: OrderStatus; note: string; at: string }[];
  carrier: string;
  tracking_number: string;
  tracking_url: string;
  estimated_ship_date: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  total_quantity: number;
  ship_to: { city: string; country: string };
}

export interface BankAccount {
  label: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  swift: string;
  currency: string;
  branch_address: string;
}

export interface Payment {
  id: string;
  order_number: string;
  kind: "full" | "deposit" | "balance" | "invoice";
  method: string;
  status: "pending" | "submitted" | "confirmed" | "failed" | "refunded";
  amount: number;
  currency: string;
  reference: string;
  proof: string | null;
  note: string;
  due_date: string | null;
  submitted_at: string | null;
  confirmed_at: string | null;
  created_at: string;
}

export interface QuoteItem {
  id: string;
  product_slug: string | null;
  product_name: string;
  sku: string;
  fabric_name: string;
  image_url: string;
  breakdown: BreakdownLine[];
  quantity: number;
  color: string;
  customization: Record<string, unknown>;
  artwork: string | null;
  notes: string;
  requested_unit_price: number;
  quoted_unit_price: number | null;
  line_total: number;
}

export interface QuoteSummary {
  id: string;
  number: string;
  status: QuoteStatus;
  status_display: string;
  currency: string;
  requested_total: number;
  quoted_total: number | null;
  total_quantity: number;
  item_count: number;
  requested_by: string;
  valid_until: string | null;
  delivery_deadline: string | null;
  created_at: string;
  quoted_at: string | null;
}

export interface Quote extends QuoteSummary {
  company: string;
  items: QuoteItem[];
  target_budget: number | null;
  shipping_address: AddressSnapshot | Record<string, never>;
  customer_notes: string;
  response_message: string;
  handled_by: string;
  orders: string[];
}

export interface Notification {
  id: string;
  kind: "order" | "quote" | "payment" | "account" | "chat" | "system";
  level: "info" | "success" | "warning" | "error";
  title: string;
  body: string;
  url: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface SuggestResponse {
  query: string;
  products: ProductCard[];
  categories: { name: string; slug: string; product_count: number }[];
  fabrics: { name: string; slug: string; quality: Quality }[];
}

export interface SearchResponse extends Paginated<ProductCard> {
  query: string;
  suggestions?: string[];
}

export interface ChatSender {
  id: string;
  name: string;
  is_staff: boolean;
  avatar_url: string;
}

export interface ChatMessage {
  id: string;
  kind: "text" | "system" | "file";
  body: string;
  attachment: string | null;
  attachment_name: string;
  client_id: string;
  sender: ChatSender | null;
  created_at: string;
  pending?: boolean;
}

export interface Conversation {
  id: string;
  subject: string;
  status: "open" | "pending" | "closed";
  company: string | null;
  created_by: string;
  assigned_to: string;
  order: { id: string; number: string } | null;
  quote: { id: string; number: string } | null;
  last_message_at: string | null;
  last_message_preview: string;
  message_count: number;
  unread_count: number;
  created_at: string;
}
