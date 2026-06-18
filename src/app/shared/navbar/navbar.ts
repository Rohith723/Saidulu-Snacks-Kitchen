import { Component, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <nav class="navbar">
      <mat-toolbar>
        <a routerLink="/home" class="logo">
          <span class="emoji">🚚</span>
          Saidulu Snacks Kitchen
        </a>
        <span class="spacer"></span>
        <div class="nav-actions">
          <a mat-button routerLink="/menu" routerLinkActive="active-link">Menu</a>
          <a mat-button routerLink="/contact" routerLinkActive="active-link">Contact</a>
          <a mat-button routerLink="/cart" class="cart-badge">
            <mat-icon>shopping_cart</mat-icon>
            @if (cartCount() > 0) {
              <span class="badge">{{ cartCount() }}</span>
            }
          </a>
        </div>
      </mat-toolbar>
    </nav>
  `,
  styles: [`
    .active-link {
      color: var(--primary) !important;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        bottom: 6px;
        left: 50%;
        transform: translateX(-50%);
        width: 18px;
        height: 3px;
        border-radius: 999px;
        background: var(--gradient-primary);
      }
    }
  `]
})
export class Navbar {
  cartCount = computed(() => this.cart.itemCount());
  constructor(private cart: CartService) {}
}