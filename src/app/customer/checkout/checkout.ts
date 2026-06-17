import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Navbar } from '../../shared/navbar/navbar';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { BusinessService } from '../../services/business.service';
import { PickupSlot } from '../../models';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatProgressSpinnerModule, Navbar],
  template: `
    <div class="page-wrapper">
      <app-navbar></app-navbar>
      <div class="checkout-page app-container">
        <div class="page-header">
          <h1>Checkout 📋</h1>
          <p>Almost there! Tell us when you're picking up.</p>
        </div>

        @if (cartItems().length === 0) {
          <div class="empty-state">
            <p>Your cart is empty. <a (click)="router.navigate(['/menu'])">Go back to menu.</a></p>
          </div>
        } @else {
          <div class="checkout-layout">
            <div class="checkout-form food-card">
              <h2>Your Details</h2>
              <form [formGroup]="checkoutForm" (ngSubmit)="placeOrder()">
                <mat-form-field appearance="outline" class="form-field-full">
                  <mat-label>Full Name</mat-label>
                  <input matInput formControlName="customer_name" placeholder="John Doe">
                  <mat-icon matPrefix>person</mat-icon>
                  @if (checkoutForm.get('customer_name')?.errors?.['required'] && checkoutForm.get('customer_name')?.touched) {
                    <mat-error>Name is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field-full">
                  <mat-label>Mobile Number</mat-label>
                  <input matInput formControlName="customer_phone" placeholder="9999999999" maxlength="10">
                  <mat-icon matPrefix>phone</mat-icon>
                  @if (checkoutForm.get('customer_phone')?.errors && checkoutForm.get('customer_phone')?.touched) {
                    <mat-error>Enter a valid 10-digit mobile number</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field-full">
                  <mat-label>Pickup Date</mat-label>
                  <input matInput [matDatepicker]="picker" formControlName="pickup_date" [min]="minDate" readonly>
                  <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                  <mat-datepicker #picker></mat-datepicker>
                  @if (checkoutForm.get('pickup_date')?.errors?.['required'] && checkoutForm.get('pickup_date')?.touched) {
                    <mat-error>Select a pickup date</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="form-field-full">
  <mat-label>Pickup Time Slot</mat-label>
  <mat-select formControlName="pickup_time">
    @for (slot of availableSlots(); track slot.slot_time) {
      <mat-option [value]="slot.slot_time">{{ slot.slot_time }}</mat-option>
    }
    @if (availableSlots().length === 0) {
      <mat-option disabled>No slots left for today</mat-option>
    }
  </mat-select>
  <mat-icon matPrefix>schedule</mat-icon>
  @if (availableSlots().length === 0) {
    <mat-hint class="no-slots-hint">All today's slots have passed. Please select tomorrow's date.</mat-hint>
  }
</mat-form-field>

                <mat-form-field appearance="outline" class="form-field-full">
                  <mat-label>Special Instructions (Optional)</mat-label>
                  <textarea matInput formControlName="notes" rows="3" placeholder="Any special requests..."></textarea>
                  <mat-icon matPrefix>notes</mat-icon>
                </mat-form-field>

                <div class="payment-info">
                  <mat-icon>payments</mat-icon>
                  <div>
                    <strong>Payment: Pay at Pickup</strong>
                    <p>We accept Cash, UPI at the truck.</p>
                  </div>
                </div>

                <button mat-raised-button type="submit" class="place-order-btn" [disabled]="submitting() || checkoutForm.invalid">
                  @if (submitting()) {
                    <mat-spinner diameter="20"></mat-spinner> Placing Order...
                  } @else {
                    <mat-icon>check_circle</mat-icon> Place Order · ₹{{ total() }}
                  }
                </button>
              </form>
            </div>

            <div class="order-summary food-card">
              <h2>Order Summary</h2>
              <div class="summary-items">
                @for (item of cartItems(); track item.menuItem.id) {
                  <div class="summary-item">
                    <div class="summary-item-info">
                      <span>{{ item.menuItem.name }}</span>
                      <span class="item-qty">× {{ item.quantity }}</span>
                    </div>
                    <span class="item-price">₹{{ item.menuItem.price * item.quantity }}</span>
                  </div>
                }
              </div>
              <div class="summary-divider"></div>
              <div class="summary-total">
                <span>Total Amount</span>
                <strong>₹{{ total() }}</strong>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .checkout-page { padding: 40px 0 60px; }
    .page-header { margin-bottom: 32px; h1 { font-family: 'Playfair Display', serif; font-size: 2rem; font-weight: 800; margin-bottom: 4px; } p { color: var(--text-secondary); } }
    .checkout-layout { display: grid; grid-template-columns: 1fr 360px; gap: 32px; align-items: start; }
    .checkout-form { padding: 28px; h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: 24px; } }
    .payment-info { display: flex; align-items: flex-start; gap: 12px; background: #e8f5e9; color: var(--success); padding: 14px 16px; border-radius: 12px; margin-bottom: 20px; mat-icon { flex-shrink: 0; } strong { display: block; margin-bottom: 2px; } p { font-size: 0.875rem; opacity: 0.8; margin: 0; } }
    .place-order-btn { width: 100%; background: var(--primary) !important; color: white !important; font-weight: 700 !important; font-size: 1.05rem !important; height: 52px !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; }
    .order-summary { padding: 24px; position: sticky; top: 80px; h2 { font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; } }
    .summary-items { display: flex; flex-direction: column; gap: 12px; }
    .summary-item { display: flex; justify-content: space-between; align-items: center; }
    .summary-item-info { display: flex; align-items: center; gap: 8px; flex: 1; }
    .item-qty { background: #f5f5f5; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; color: var(--text-secondary); }
    .item-price { font-weight: 600; font-size: 0.95rem; }
    .summary-divider { height: 1px; background: var(--border); margin: 16px 0; }
    .summary-total { display: flex; justify-content: space-between; align-items: center; font-size: 1.1rem; strong { color: var(--primary); font-size: 1.2rem; } }
    .empty-state { text-align: center; padding: 60px; a { color: var(--primary); cursor: pointer; text-decoration: underline; } }
    .no-slots-hint {
  color: #c62828 !important;
  font-weight: 500;
}
    @media (max-width: 900px) { .checkout-layout { grid-template-columns: 1fr; } .order-summary { position: static; order: -1; } }
  `]
})
export class Checkout implements OnInit {
  checkoutForm: FormGroup;
  availableSlots = signal<PickupSlot[]>([]);
  submitting = signal(false);
  minDate = new Date();
  cartItems = computed(() => this.cart.items());
  total = computed(() => this.cart.total());

  constructor(
    private fb: FormBuilder,
    private cart: CartService,
    private orderService: OrderService,
    private businessService: BusinessService,
    public router: Router,
    private snackBar: MatSnackBar
  ) {
   this.checkoutForm = this.fb.group({
  customer_name: ['', Validators.required],
  customer_phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
  pickup_date: [new Date(), Validators.required],
  pickup_time: ['', Validators.required],
  notes: [''],
});
  }

allSlots = signal<PickupSlot[]>([]);

ngOnInit() {
  this.businessService.getPickupSlots().subscribe({
    next: slots => {
      if (slots.length > 0) {
        this.allSlots.set(slots);
      } else {
        this.generateDefaultSlots();
      }
      this.filterSlotsForDate(this.checkoutForm.get('pickup_date')?.value);
    },
    error: () => {
      this.generateDefaultSlots();
      this.filterSlotsForDate(this.checkoutForm.get('pickup_date')?.value);
    }
  });

  // Re-filter slots whenever the pickup date changes
  this.checkoutForm.get('pickup_date')?.valueChanges.subscribe(date => {
    this.filterSlotsForDate(date);
    // Clear the selected time if it's no longer valid for the new date
    const currentTime = this.checkoutForm.get('pickup_time')?.value;
    if (currentTime && !this.availableSlots().some(s => s.slot_time === currentTime)) {
      this.checkoutForm.patchValue({ pickup_time: '' });
    }
  });
}

generateDefaultSlots() {
  const slots: PickupSlot[] = [];
  for (let h = 19; h < 23; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hour12 = h > 12 ? h - 12 : h;
      slots.push({ slot_time: `${hour12}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`, max_orders: 10, is_active: true });
    }
  }
  this.allSlots.set(slots);
}

private parseSlotTime(slotTime: string): { hour: number; minute: number } {
  // Parses "7:45 PM" -> { hour: 19, minute: 45 }
  const match = slotTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return { hour: 0, minute: 0 };
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return { hour, minute };
}

private isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

filterSlotsForDate(date: Date | string | null) {
  const all = this.allSlots();
  if (!date) {
    this.availableSlots.set(all);
    return;
  }

  const selectedDate = date instanceof Date ? date : new Date(date);

  if (!this.isToday(selectedDate)) {
    // Future date — show all slots
    this.availableSlots.set(all);
    return;
  }

  // Today — only show slots that haven't passed yet
  const now = new Date();
  const filtered = all.filter(slot => {
    const { hour, minute } = this.parseSlotTime(slot.slot_time);
    const slotMinutes = hour * 60 + minute;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return slotMinutes > nowMinutes;
  });

  this.availableSlots.set(filtered);
}

 async placeOrder() {
  if (this.checkoutForm.invalid) { this.checkoutForm.markAllAsTouched(); return; }
  this.submitting.set(true);
  const form = this.checkoutForm.value;
  const pickupDate = form.pickup_date instanceof Date ? form.pickup_date.toISOString().split('T')[0] : form.pickup_date;
  const cartSnapshot = this.cartItems();
  try {
    const order = await this.orderService.placeOrder({
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      pickup_date: pickupDate,
      pickup_time: form.pickup_time,
      total_amount: this.total(),
      payment_status: 'pay_at_pickup',
      order_status: 'pending',
      notes: form.notes,
    }, cartSnapshot);

    const orderItemsForWhatsApp = cartSnapshot.map(item => ({
      menu_item_id: item.menuItem.id,
      quantity: item.quantity,
      unit_price: item.menuItem.price,
      menu_items: { name: item.menuItem.name } as any,
    }));

    this.cart.clearCart();
    setTimeout(() => this.orderService.openWhatsApp({ ...order, order_items: orderItemsForWhatsApp }), 500);
    this.router.navigate(['/confirmation', order.id]);
  } catch (err: any) {
    this.snackBar.open('Failed to place order. Please try again.', '✕', { duration: 4000, panelClass: 'error-snack' });
  } finally {
    this.submitting.set(false);
  }
}
}