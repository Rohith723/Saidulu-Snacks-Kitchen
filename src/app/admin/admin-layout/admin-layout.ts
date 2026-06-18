import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule],
  template: `
    <div class="admin-shell">
      <aside class="admin-sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-glow"></div>
        <div class="sidebar-header">
          <div class="sidebar-logo">🚚</div>
          <div>
            <h2>Saidulu Snacks Kitchen </h2>
            <small>Admin Panel</small>
          </div>
        </div>

        <nav class="sidebar-nav">
          @for (item of navItems; track item.route) {
            <a class="nav-item" [routerLink]="item.route" routerLinkActive="active" (click)="sidebarOpen = false">
              <mat-icon>{{ item.icon }}</mat-icon>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <button class="sign-out-btn" (click)="signOut()">
            <mat-icon>logout</mat-icon>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      @if (sidebarOpen) {
        <div class="sidebar-overlay" (click)="sidebarOpen = false"></div>
      }

      <div class="admin-main">
        <header class="admin-topbar">
          <button mat-icon-button (click)="sidebarOpen = !sidebarOpen" class="menu-toggle">
            <mat-icon>menu</mat-icon>
          </button>
          <span class="topbar-title">Admin Dashboard</span>
          <div class="topbar-avatar"><mat-icon>account_circle</mat-icon></div>
        </header>
        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--gradient-hero);
    }

    .admin-sidebar {
      width: 270px;
      background: var(--gradient-dark);
      color: white;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      z-index: 200;
      transition: transform 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    .sidebar-glow {
      position: absolute;
      width: 300px; height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,107,53,0.25), transparent 70%);
      top: -120px; left: -100px;
      filter: blur(10px);
      pointer-events: none;
    }

    .sidebar-header {
      position: relative; z-index: 1;
      padding: 28px 22px;
      border-bottom: 1px solid var(--glass-dark-border);
      display: flex;
      align-items: center;
      gap: 14px;
      .sidebar-logo { font-size: 38px; filter: drop-shadow(0 4px 12px rgba(255,107,53,0.4)); }
      h2 { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 800; margin: 0; }
      small { color: rgba(255,255,255,0.5); font-size: 0.75rem; letter-spacing: 0.05em; }
    }

    .sidebar-nav {
      position: relative; z-index: 1;
      flex: 1;
      padding: 18px 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 16px;
      border-radius: var(--radius-sm);
      color: rgba(255,255,255,0.65);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.25s ease;

      mat-icon { font-size: 20px; width: 20px; height: 20px; }

      &:hover {
        background: var(--glass-dark-bg);
        color: white;
      }

      &.active {
        background: var(--gradient-primary);
        color: white;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(255,107,53,0.35);
      }
    }

    .sidebar-footer {
      position: relative; z-index: 1;
      padding: 18px 14px;
      border-top: 1px solid var(--glass-dark-border);
    }

    .sign-out-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 16px;
      border-radius: var(--radius-sm);
      color: rgba(255,255,255,0.55);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      width: 100%;
      transition: all 0.25s ease;
      &:hover { background: rgba(244,67,54,0.12); color: #ff8a80; }
    }

    .sidebar-overlay { display: none; }

    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .admin-topbar {
      background: var(--glass-bg-strong);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-bottom: 1px solid var(--glass-border);
      padding: 0 28px;
      height: 68px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow-sm);

      .menu-toggle { display: none; }
      .topbar-title { font-weight: 700; font-size: 1.05rem; flex: 1; }
    }

    .topbar-avatar mat-icon {
      color: var(--primary);
      font-size: 30px;
      width: 30px;
      height: 30px;
    }

    .admin-content {
      flex: 1;
      overflow-y: auto;
      padding: 28px;
      position: relative;
    }

    @media (max-width: 768px) {
      .admin-sidebar {
        position: fixed;
        top: 0; left: 0;
        height: 100%;
        transform: translateX(-100%);
        &.open { transform: translateX(0); }
      }
      .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(26,22,37,0.5);
        backdrop-filter: blur(4px);
        z-index: 150;
      }
      .admin-topbar {
        .menu-toggle { display: flex; }
        padding: 0 14px;
      }
      .admin-content { padding: 16px; }
    }
  `]
})
export class AdminLayout {
  sidebarOpen = false;
  navItems = [
  { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
  { label: 'Menu Management', icon: 'restaurant_menu', route: '/admin/menu' },
  { label: 'Orders', icon: 'receipt_long', route: '/admin/orders' },
  { label: 'Locations', icon: 'location_on', route: '/admin/locations' },
  { label: 'Messages', icon: 'inbox', route: '/admin/messages' },
  { label: 'Pickup Slots', icon: 'schedule', route: '/admin/pickup-slots' },
  { label: 'Store Settings', icon: 'store', route: '/admin/settings' },
];
  constructor(private auth: AuthService) {}
  signOut() { this.auth.signOut(); }
}