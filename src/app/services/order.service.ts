import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Order, CartItem } from '../models';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private supabase: SupabaseService) {}

  async placeOrder(order: Omit<Order, 'id' | 'created_at'>, cartItems: CartItem[]): Promise<Order> {
    const { data: orderData, error: orderError } = await this.supabase.client
      .from('orders')
      .insert({
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        pickup_date: order.pickup_date,
        pickup_time: order.pickup_time,
        total_amount: order.total_amount,
        payment_status: 'pay_at_pickup',
        order_status: 'pending',
        notes: order.notes || null,
      })
      .select().single();

    if (orderError) throw orderError;

    const { error: itemsError } = await this.supabase.client
      .from('order_items')
      .insert(cartItems.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        unit_price: item.menuItem.price,
      })));

    if (itemsError) throw itemsError;
    return orderData as Order;
  }

  getOrders(filters?: { status?: string; date?: string }): Observable<Order[]> {
    let query = this.supabase.client
      .from('orders')
      .select(`*, order_items(*, menu_items(*))`)
      .order('created_at', { ascending: false });

    if (filters?.status) query = query.eq('order_status', filters.status);
    if (filters?.date)   query = query.eq('pickup_date', filters.date);

    return from(query).pipe(map(({ data, error }) => { if (error) throw error; return data as Order[]; }));
  }

  getTodayOrders(): Observable<Order[]> {
    return this.getOrders({ date: new Date().toISOString().split('T')[0] });
  }

  getOrderById(id: string): Observable<Order> {
    return from(
      this.supabase.client.from('orders').select(`*, order_items(*, menu_items(*))`).eq('id', id).single()
    ).pipe(map(({ data, error }) => { if (error) throw error; return data as Order; }));
  }

  updateOrderStatus(id: string, status: string): Observable<void> {
    return from(
      this.supabase.client.from('orders').update({ order_status: status }).eq('id', id)
    ).pipe(map(({ error }) => { if (error) throw error; }));
  }

  openWhatsApp(order: Order): void {
    const items = order.order_items?.map(i =>
      `${i.quantity} x ${i.menu_items?.name} (₹${i.unit_price * i.quantity})`
    ).join('\n') || '';

    const message =
      `🍔 *New Order Received*\n\n` +
      `*Order ID:* ORD-${order.id?.slice(-6).toUpperCase()}\n\n` +
      `*Customer:* ${order.customer_name}\n` +
      `*Phone:* ${order.customer_phone}\n\n` +
      `*Items:*\n${items}\n\n` +
      `*Total:* ₹${order.total_amount}\n\n` +
      `*Pickup Date:* ${order.pickup_date}\n` +
      `*Pickup Time:* ${order.pickup_time}\n\n` +
      `*Payment:* Pay at Pickup`;

    window.open(`https://wa.me/${environment.businessWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
  }

  notifyCustomerStatusChange(order: Order, newStatus: string): void {
  const statusMessages: Record<string, string> = {
    pending: 'Your order has been received and is pending confirmation.',
    preparing: 'Good news! Your order is now being prepared. 🍳',
    ready: 'Your order is ready for pickup! 🎉 Come grab it hot and fresh.',
    completed: 'Thank you for your order! Hope you enjoyed your meal. 😊',
    cancelled: 'Your order has been cancelled. Please contact us if you have questions.',
  };

  const message =
    `🚚 *Laxmi Food Truck Update*\n\n` +
    `Order ID: ORD-${order.id?.slice(-6).toUpperCase()}\n\n` +
    `${statusMessages[newStatus] || 'Your order status has been updated.'}\n\n` +
    `Pickup Time: ${order.pickup_time}`;

  const customerPhone = order.customer_phone.replace(/\D/g, ''); // strip non-digits
  const phoneWithCountryCode = customerPhone.length === 10 ? `91${customerPhone}` : customerPhone;

  window.open(`https://wa.me/${phoneWithCountryCode}?text=${encodeURIComponent(message)}`, '_blank');
}
}