/** API types — mirror the Django serializers one-to-one. */

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

export type Gender = "men" | "women" | "unisex" | "kids";
export type PaymentMethod = "cod" | "bank_transfer" | "card";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "returned";
export type PaymentStatus = "unpaid" | "paid" | "cod_pending" | "refunded" | "partially_refunded";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  date_of_birth: string | null;
  shop_for: "" | "men" | "women";
  language: "en" | "ur" | "ar";
  is_staff: boolean;
  is_email_verified: boolean;
  auth_provider: "email" | "google";
  marketing_opt_in: boolean;
  notification_preferences: Record<string, boolean>;
  has_password: boolean;
  order_count: number;
  total_spent: number;
  created_at: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface Address {
  id: string;
  label: "home" | "work" | "other";
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at?: string;
}

export type AddressInput = Omit<Address, "id" | "created_at" | "label" | "is_default"> &
  Partial<Pick<Address, "label" | "is_default">>;

export interface LocaleInfo {
  language: "en" | "ur" | "ar";
  source: string;
  country: string;
  rtl: boolean;
  currency: string;
  supported: { code: string; name: string; rtl: boolean }[];
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
  show_in_menu: boolean;
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

export interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string | null;
  is_featured: boolean;
  product_count: number;
  starts_at: string | null;
  ends_at: string | null;
}

export interface ColorRef {
  name: string;
  slug: string;
  hex: string;
}

export interface ImageRef {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface ProductCard {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  gender: Gender;
  category: string;
  category_name: string;
  short_description: string;
  image: ImageRef | null;
  hover_image: ImageRef | null;
  price: number;
  compare_at_price: number | null;
  discount_percent: number;
  is_on_sale: boolean;
  in_stock: boolean;
  rating_avg: number;
  rating_count: number;
  colors: ColorRef[];
  sizes: string[];
  is_featured: boolean;
  is_new: boolean;
}

export interface Variant {
  id: string;
  sku: string;
  color: ColorRef | null;
  size: string | null;
  size_id: number | null;
  price: number;
  stock: number;
  in_stock: boolean;
  low_stock: boolean;
  label: string;
}

export interface ProductImage {
  id: number;
  url: string;
  alt: string;
  color: string | null;
  is_primary: boolean;
  width: number | null;
  height: number | null;
}

export interface ProductDetail extends ProductCard {
  description: string;
  material: string;
  care_instructions: string;
  specifications: Record<string, string>;
  tags: string[];
  images: ProductImage[];
  variants: Variant[];
  size_group: {
    id: number;
    name: string;
    slug: string;
    sizes: { id: number; label: string; sort_order: number }[];
    guide: Record<string, string>[];
  } | null;
  collections: Collection[];
  weight_grams: number;
  total_stock: number;
  breadcrumbs: { name: string; slug: string }[];
  meta_title: string;
  meta_description: string;
}

export interface Facets {
  sizes: { label: string; count: number }[];
  colors: (ColorRef & { count: number })[];
  price: { min: number; max: number };
  genders: { value: Gender; count: number }[];
}

export interface CartItem {
  id: string;
  product: ProductCard;
  variant: Variant;
  quantity: number;
  unit_price: number;
  line_total: number;
  available: number;
  issue: string;
}

export interface Cart {
  id: string;
  guest_token: string | null;
  items: CartItem[];
  item_count: number;
  quantity: number;
  subtotal: number;
  discount: number;
  coupon_code: string;
  coupon_message: string;
  free_shipping: boolean;
  issues: string[];
  notes: string;
}

export interface WishlistEntry {
  product: ProductCard;
  variant: Variant | null;
  added_at: string;
}

export interface WishlistResponse {
  count: number;
  results: WishlistEntry[];
  product_ids: string[];
}

export interface PaymentMethodOption {
  code: PaymentMethod;
  label: string;
  description: string;
  enabled: boolean;
}

export interface OrdersSummary {
  total: number;
  open: number;
  delivered: number;
  returns: number;
}

export interface CheckoutInput {
  email: string;
  address: Omit<AddressSnapshot, "country"> & { country?: string };
  payment_method: PaymentMethod;
  notes?: string;
  save_address?: boolean;
  is_gift?: boolean;
}

export interface ProductQuery {
  page?: number;
  page_size?: number;
  ordering?: string;
  category?: string;
  collection?: string;
  gender?: string | string[];
  size?: string;
  color?: string;
  min_price?: number | string;
  max_price?: number | string;
  in_stock?: boolean | string;
  on_sale?: boolean | string;
  q?: string;
  ids?: string;
  slugs?: string;
}

export interface ShippingQuote {
  zone: string | null;
  rate: number;
  cod_fee: number;
  is_free: boolean;
  free_over: number | null;
  min_days: number;
  max_days: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface OrderItem {
  id: string;
  product_slug: string | null;
  product_name: string;
  variant_label: string;
  sku: string;
  image_url: string;
  quantity: number;
  unit_price: number;
  compare_at_price: number | null;
  line_total: number;
  returned_quantity: number;
  can_review: boolean;
}

export interface OrderSummary {
  id: string;
  number: string;
  status: OrderStatus;
  status_display: string;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  currency: string;
  grand_total: number;
  total_quantity: number;
  item_count: number;
  thumbnails: string[];
  estimated_delivery: string | null;
  tracking_number: string;
  created_at: string;
}

export interface AddressSnapshot {
  full_name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

export interface ReturnRequest {
  id: string;
  number: string;
  order_number: string;
  kind: "refund" | "exchange";
  status: "requested" | "approved" | "received" | "completed" | "rejected";
  status_display: string;
  reason: string;
  reason_display: string;
  details: string;
  image: string | null;
  items: {
    order_item: string;
    product_name: string;
    variant_label: string;
    quantity: number;
    exchange_variant: string | null;
  }[];
  refund_amount: number;
  refund_method: string;
  staff_notes: string;
  resolved_at: string | null;
  created_at: string;
}

export interface Order extends OrderSummary {
  email: string;
  phone: string;
  items: OrderItem[];
  history: { from_status: string; to_status: OrderStatus; note: string; created_at: string }[];
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  cod_fee: number;
  refunded_total: number;
  coupon_code: string;
  shipping_zone: { name: string; min_days: number; max_days: number } | null;
  shipping_address: AddressSnapshot;
  carrier: string;
  tracking_url: string;
  customer_notes: string;
  is_gift: boolean;
  cancel_reason: string;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  paid_at: string | null;
  returns: ReturnRequest[];
  can_cancel: boolean;
  can_return: boolean;
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
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  items: { name: string; variant: string; quantity: number; image_url: string }[];
  total_quantity: number;
  grand_total: number;
  payment_method: PaymentMethod;
  ship_to: { city: string; name: string };
}

export interface BankAccount {
  label: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  iban: string;
  instructions: string;
}

export interface Payment {
  id: string;
  order_number: string;
  method: string;
  status: "pending" | "submitted" | "confirmed" | "failed" | "refunded";
  amount: number;
  currency: string;
  reference: string;
  proof: string | null;
  note: string;
  submitted_at: string | null;
  confirmed_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  product_slug: string;
  product_name: string;
  author: { name: string; avatar_url: string };
  rating: number;
  title: string;
  body: string;
  size_purchased: string;
  fit: "" | "small" | "true" | "large";
  image: string | null;
  status: "pending" | "approved" | "rejected";
  is_verified_purchase: boolean;
  helpful_count: number;
  staff_reply: string;
  replied_at: string | null;
  created_at: string;
}

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: Record<string, number>;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string;
  eyebrow: string;
  image: string;
  mobile_image: string | null;
  cta_label: string;
  cta_url: string;
  placement: "hero" | "promo" | "category";
  theme: "dark" | "light";
}

export interface ShippingZoneInfo {
  name: string;
  cities: string[];
  provinces: string[];
  is_default: boolean;
  rate: number;
  free_over: number | null;
  cod_fee: number;
  min_days: number;
  max_days: number;
}

export interface Storefront {
  banners: Banner[];
  announcements: { id: number; text: string; url: string }[];
  shipping: { free_over_min: number | null; zones: ShippingZoneInfo[] };
  pages: { title: string; slug: string }[];
}

export interface Page {
  title: string;
  slug: string;
  body: string;
  meta_description: string;
  updated_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export interface Notification {
  id: string;
  kind: "order" | "return" | "payment" | "promo" | "review" | "account" | "chat" | "system";
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
  collections: { name: string; slug: string }[];
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
  topic: string;
  status: "open" | "pending" | "closed";
  created_by: string;
  assigned_to: string;
  order: { id: string; number: string } | null;
  last_message_at: string | null;
  last_message_preview: string;
  message_count: number;
  unread_count: number;
  created_at: string;
}
