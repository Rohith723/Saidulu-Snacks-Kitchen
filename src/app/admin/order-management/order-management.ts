import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models';

@Component({
  selector: 'app-order-management',
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatSnackBarModule, MatExpansionModule, MatProgressSpinnerModule],
  template: `
    <div class="order-mgmt">
      <div class="page-header">
        <div>
          <h1>Order Management</h1>
          <p>View and manage all customer orders.</p>
        </div>
        <button mat-raised-button (click)="loadOrders()" class="refresh-btn">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>

      <div class="filters-bar glass-card">
        <form [formGroup]="filterForm" class="filters-form">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status" (selectionChange)="loadOrders()">
              @for (opt of statusOptions; track opt.value) {
                <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="date" (dateChange)="loadOrders()" readonly>
            <mat-datepicker-toggle matIconSuffix [for]="dp"></mat-datepicker-toggle>
            <mat-datepicker #dp></mat-datepicker>
          </mat-form-field>

          <button mat-button type="button" (click)="clearFilters()" class="clear-btn">
            <mat-icon>close</mat-icon> Clear
          </button>
        </form>

        <div class="status-chips">
          @for (opt of statusOptions; track opt.value) {
            <button type="button" class="chip-btn" [class.active]="filterForm.get('status')?.value === opt.value"
              (click)="setStatus(opt.value)">{{ opt.label }}</button>
          }
        </div>
      </div>

      @if (loading()) {
        <div class="loading-container"><mat-spinner></mat-spinner></div>
      } @else if (orders().length === 0) {
        <div class="empty-state glass-card">
          <mat-icon>receipt_long</mat-icon><h3>No orders found</h3><p>Try adjusting your filters.</p>
        </div>
      } @else {
        <div class="orders-count">{{ orders().length }} order(s) found</div>
        <div class="orders-list">
          @for (order of orders(); track order.id) {
            <div class="order-panel glass-card" [class.expanded]="expandedId() === order.id">
              <div class="order-summary-row" (click)="toggleExpand(order.id!)">
                <div class="order-id-section">
                  <span class="order-id">ORD-{{ shortId(order.id) }}</span>
                  <span class="order-time">{{ formatDate(order.created_at!) }}</span>
                </div>
                <div class="customer-section">
                  <strong>{{ order.customer_name }}</strong>
                  <small>{{ order.customer_phone }}</small>
                </div>
                <div class="pickup-section hide-mobile">
                  <mat-icon>schedule</mat-icon><span>{{ order.pickup_time }}</span>
                </div>
                <div class="amount-section">₹{{ order.total_amount }}</div>
                <div class="status-section">
                  <span class="status-chip {{ order.order_status }}">{{ order.order_status }}</span>
                </div>
                <mat-icon class="expand-arrow">{{ expandedId() === order.id ? 'expand_less' : 'expand_more' }}</mat-icon>
              </div>

              @if (expandedId() === order.id) {
                <div class="order-detail">
                  <div class="detail-grid">
                    <div class="detail-block">
                      <h4>Customer Info</h4>
                      <p><mat-icon>person</mat-icon> {{ order.customer_name }}</p>
                      <p><mat-icon>phone</mat-icon> {{ order.customer_phone }}</p>
                      <p><mat-icon>calendar_today</mat-icon> {{ order.pickup_date }}</p>
                      <p><mat-icon>schedule</mat-icon> {{ order.pickup_time }}</p>
                      @if (order.notes) { <p><mat-icon>notes</mat-icon> {{ order.notes }}</p> }
                    </div>
                    <div class="detail-block">
                      <h4>Order Items</h4>
                      @if (order.order_items && order.order_items.length > 0) {
                        @for (item of order.order_items; track item.id) {
                          <div class="order-item-line">
                            <span>{{ item.menu_items?.name }} × {{ item.quantity }}</span>
                            <span>₹{{ item.unit_price * item.quantity }}</span>
                          </div>
                        }
                        <div class="order-total-line">
                          <strong>Total</strong><strong>₹{{ order.total_amount }}</strong>
                        </div>
                      }
                      <p class="payment-mode"><mat-icon>payments</mat-icon> Pay at Pickup</p>
                    </div>
                  </div>

                  <div class="status-update">
                    <h4>Update Status</h4>
                    <div class="status-buttons">
                      @for (s of orderStatuses; track s.value) {
                        <button type="button" class="status-btn"
                          [class.active-status]="order.order_status === s.value"
                          [disabled]="order.order_status === s.value || updatingId() === order.id"
                          (click)="updateStatus(order, s.value)">
                          <mat-icon>{{ s.icon }}</mat-icon> {{ s.label }}
                        </button>
                      }
                    </div>
                  </div>

                  <button mat-raised-button class="wa-btn" (click)="sendWhatsApp(order)">
                    📱 Notify via WhatsApp
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .order-mgmt { max-width: 1100px; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
      h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
      p { color: var(--text-secondary); }
    }
    .refresh-btn {
      background: var(--gradient-primary) !important; color: white !important;
      display: flex !important; align-items: center !important; gap: 6px !important;
      border-radius: var(--radius-full) !important; box-shadow: var(--shadow-glow) !important;
    }

    .filters-bar { padding: 20px 24px; margin-bottom: 24px; }
    .filters-form { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
    .filter-field { min-width: 180px; }
    .clear-btn { color: var(--text-secondary) !important; display: flex !important; align-items: center !important; gap: 4px !important; }

    .status-chips { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip-btn {
      padding: 7px 16px; border-radius: var(--radius-full); border: 1.5px solid var(--border);
      background: rgba(255,255,255,0.5); cursor: pointer; font-size: 0.8rem; font-weight: 600;
      transition: all 0.25s ease; font-family: inherit; color: var(--text-secondary);
      &:hover { border-color: var(--primary); color: var(--primary); }
      &.active { background: var(--gradient-primary); color: white; border-color: transparent; box-shadow: var(--shadow-sm); }
    }

    .orders-count { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px; font-weight: 500; }
    .orders-list { display: flex; flex-direction: column; gap: 12px; }

    .order-panel { padding: 0; cursor: default; }
    .order-panel:hover { transform: none; }

    .order-summary-row {
      display: grid;
      grid-template-columns: 1.4fr 2fr 1fr 1fr 1.2fr auto;
      align-items: center;
      gap: 12px;
      padding: 18px 22px;
      cursor: pointer;
      transition: background 0.2s ease;
      &:hover { background: rgba(255,255,255,0.4); }
    }

    .order-id-section { display: flex; flex-direction: column;
      .order-id { font-family: monospace; font-weight: 700; color: var(--primary); font-size: 0.9rem; }
      .order-time { font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px; }
    }
    .customer-section { strong { display: block; font-size: 0.9rem; } small { color: var(--text-secondary); font-size: 0.8rem; } }
    .pickup-section { display: flex; align-items: center; gap: 4px; font-size: 0.875rem; color: var(--text-secondary);
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .amount-section { font-weight: 700; font-size: 0.95rem; }
    .expand-arrow { color: var(--text-secondary); justify-self: end; }

    .order-detail { padding: 0 22px 22px; border-top: 1px solid var(--border); margin-top: 4px; padding-top: 18px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }
    .detail-block {
      h4 { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 12px; }
      p { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; margin-bottom: 8px; color: var(--text-secondary);
        mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--primary); }
      }
    }
    .order-item-line { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.9rem; border-bottom: 1px solid var(--border); }
    .order-total-line { display: flex; justify-content: space-between; padding: 8px 0; font-size: 1rem; strong:last-child { color: var(--primary); } }
    .payment-mode { display: flex !important; align-items: center; gap: 6px; color: var(--success) !important; font-weight: 600 !important; font-size: 0.85rem !important; margin-top: 8px !important; }

    .status-update { border-top: 1px solid var(--border); padding-top: 16px; margin-bottom: 16px;
      h4 { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 12px; }
    }
    .status-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
    .status-btn {
      font-size: 0.8rem; padding: 8px 16px; border-radius: var(--radius-full);
      display: flex; align-items: center; gap: 6px; border: 1.5px solid var(--border);
      background: rgba(255,255,255,0.5); color: var(--text-secondary); cursor: pointer;
      font-family: inherit; font-weight: 600; transition: all 0.2s ease;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
      &:hover:not(:disabled) { border-color: var(--primary); color: var(--primary); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
      &.active-status { background: var(--gradient-primary); color: white; border-color: transparent; box-shadow: var(--shadow-sm); opacity: 1; }
    }

    .wa-btn {
      background: #25d366 !important; color: white !important; font-weight: 700 !important;
      display: flex !important; align-items: center !important; gap: 8px !important;
      border-radius: var(--radius-full) !important; box-shadow: 0 8px 24px rgba(37,211,102,0.35) !important;
    }

    .empty-state { text-align: center; padding: 60px; color: var(--text-secondary);
      mat-icon { font-size: 56px; width: 56px; height: 56px; opacity: 0.3; margin-bottom: 16px; display: block; }
      h3 { font-size: 1.2rem; margin-bottom: 8px; }
    }

    ::ng-deep .mat-mdc-select-panel {
  background: white !important;
}
.filter-field {
  .mat-mdc-select-value-text {
    color: var(--text-primary) !important;
  }
}

    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .order-summary-row { grid-template-columns: 1.2fr 1.5fr 1fr auto; }
      .amount-section { display: none; }
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class OrderManagement implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(true);
  updatingId = signal<string | null>(null);
  expandedId = signal<string | null>(null);
  filterForm: FormGroup;

  statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  orderStatuses = [
    { value: 'pending', label: 'Pending', icon: 'hourglass_empty' },
    { value: 'preparing', label: 'Preparing', icon: 'outdoor_grill' },
    { value: 'ready', label: 'Ready', icon: 'check_circle' },
    { value: 'completed', label: 'Completed', icon: 'done_all' },
    { value: 'cancelled', label: 'Cancelled', icon: 'cancel' },
  ];

  constructor(private fb: FormBuilder, private orderService: OrderService, private snackBar: MatSnackBar) {
    this.filterForm = this.fb.group({ status: [''], date: [null] });
  }

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.loading.set(true);
    const { status, date } = this.filterForm.value;
    const filters: any = {};
    if (status) filters.status = status;
    if (date) filters.date = date instanceof Date ? date.toISOString().split('T')[0] : date;
    this.orderService.getOrders(filters).subscribe({
      next: orders => { this.orders.set(orders); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  toggleExpand(id: string) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  setStatus(status: string) { this.filterForm.patchValue({ status }); this.loadOrders(); }
  clearFilters() { this.filterForm.reset({ status: '', date: null }); this.loadOrders(); }

 updateStatus(order: Order, status: string) {
  this.updatingId.set(order.id!);
  this.orderService.updateOrderStatus(order.id!, status).subscribe({
    next: () => {
      this.snackBar.open(`Marked as ${status}!`, '✕', { duration: 2000, panelClass: 'success-snack' });
      this.updatingId.set(null);
      // Auto-notify customer via WhatsApp
      this.orderService.notifyCustomerStatusChange(order, status);
      this.loadOrders();
    },
    error: e => { this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' }); this.updatingId.set(null); }
  });
}

  sendWhatsApp(order: Order) { this.orderService.openWhatsApp(order); }
  shortId(id?: string): string { return id ? id.slice(-6).toUpperCase() : '------'; }
  formatDate(dateStr: string): string { if (!dateStr) return ''; return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
}