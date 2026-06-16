export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  category?: string;
  created_at?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id?: string;
  customer_name: string;
  customer_phone: string;
  pickup_date: string;
  pickup_time: string;
  total_amount: number;
  payment_status: string;
  order_status: OrderStatus;
  notes?: string;
  created_at?: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  menu_items?: MenuItem;
}

export interface BusinessSettings {
  id?: string;
  shop_open: boolean;
  opening_time: string;
  closing_time: string;
  updated_at?: string;
}

export interface PickupSlot {
  id?: string;
  slot_time: string;
  max_orders: number;
  is_active: boolean;
  current_orders?: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Location {
  id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  schedule?: string;
  is_active: boolean;
  created_at?: string;
}

export interface ContactMessage {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  is_read?: boolean;
  created_at?: string;
}