import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Navbar } from '../../shared/navbar/navbar';
import { MenuService } from '../../services/menu.service';
import { BusinessService } from '../../services/business.service';
import { LocationService } from '../../services/location.service';
import { MenuItem, BusinessSettings, Location } from '../../models';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatIconModule, Navbar],
  template: `
    <div class="page-wrapper">
      <app-navbar></app-navbar>

      <!-- Hero -->
      <section class="hero">
        <div class="hero-content app-container">
          <div class="hero-badge glass">🔥 Now Taking Pre-Orders</div>
          <h1 class="hero-title">
            Street Food<br>
            <span class="highlight">Reinvented</span>
          </h1>
          <p class="hero-sub">
            Handcrafted burgers, loaded fries & more.<br>
            Order ahead, skip the wait — pickup 7 PM–11 PM.
          </p>
          <div class="hero-actions">
            <a mat-raised-button routerLink="/menu" class="btn-order">
              <mat-icon>restaurant_menu</mat-icon>
              Browse Menu
            </a>
            <div class="hours-badge glass">
              <mat-icon>access_time</mat-icon>
              <span>Open Daily 7:00 PM – 11:00 PM</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-art">
            <div class="orb orb-1"></div>
            <div class="orb orb-2"></div>
            <div class="truck-emoji">🚚</div>
            <span class="float-item f1">🍔</span>
            <span class="float-item f2">🌮</span>
            <span class="float-item f3">🍟</span>
            <span class="float-item f4">🥤</span>
          </div>
        </div>
      </section>

      <!-- Closed Banner -->
      @if (settings() && !settings()!.shop_open) {
        <div class="closed-banner glass">
          <mat-icon>store</mat-icon>
          <span>Store is currently closed. We'll be back at {{ settings()!.opening_time }}!</span>
        </div>
      }

      <!-- Stats Bar -->
      <section class="stats-bar app-container">
        <div class="stats-glass glass-card">
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-icon">⭐</span>
              <div><strong>4.9 Rating</strong><small>From happy customers</small></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⚡</span>
              <div><strong>15-Min Pickup</strong><small>Quick & fresh every time</small></div>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💰</span>
              <div><strong>Pay at Pickup</strong><small>Cash / UPI accepted</small></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Items -->
      <section class="featured-section app-container">
        <div class="section-header">
          <h2>Featured Items</h2>
          <a mat-button routerLink="/menu" color="primary">See all →</a>
        </div>

        @if (loading()) {
          <div class="skeleton-grid">
            @for (i of [1,2,3]; track i) { <div class="skeleton-card"></div> }
          </div>
        } @else {
          <div class="items-grid">
            @for (item of featuredItems(); track item.id) {
              <div class="food-card featured-card">
                <div class="card-image">
                  @if (item.image_url) {
                    <img [src]="item.image_url" [alt]="item.name" loading="lazy">
                  } @else {
                    <div class="image-placeholder">🍽️</div>
                  }
                  @if (!item.is_available) {
                    <div class="unavailable-overlay">Unavailable</div>
                  }
                </div>
                <div class="card-body">
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.description }}</p>
                  <div class="card-footer">
                    <span class="price">₹{{ item.price }}</span>
                    <a mat-raised-button routerLink="/menu" class="order-now-btn">Order Now</a>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- 📍 Find Our Truck — Map Section -->
      <section class="map-section app-container">
        <div class="section-header">
          <h2>Find Our Truck 📍</h2>
          <a mat-button routerLink="/contact" color="primary">Contact us →</a>
        </div>

        @if (locationsLoading()) {
          <div class="map-loading glass-card">
            <div class="map-spinner">🗺️</div>
            <p>Loading locations...</p>
          </div>
        } @else if (locations().length === 0) {
          <div class="no-locations glass-card">
            <mat-icon>location_searching</mat-icon>
            <p>Locations coming soon! Follow us on WhatsApp for updates.</p>
          </div>
        } @else {
          <div class="map-wrapper glass-card">
            <!-- Location tabs -->
            @if (locations().length > 1) {
              <div class="location-tabs">
                @for (loc of locations(); track loc.id) {
                  <button
                    class="loc-tab"
                    [class.active]="selectedLocation()?.id === loc.id"
                    (click)="selectLocation(loc)">
                    <span class="tab-dot"></span>
                    {{ loc.name }}
                  </button>
                }
              </div>
            }

            <!-- Selected location info bar -->
            @if (selectedLocation()) {
              <div class="location-info-bar">
                <div class="loc-details">
                  <span class="loc-name">
                    <mat-icon>location_on</mat-icon>
                    {{ selectedLocation()!.name }}
                  </span>
                  <span class="loc-address">{{ selectedLocation()!.address }}</span>
                  @if (selectedLocation()!.schedule) {
                    <span class="loc-schedule">
                      <mat-icon>schedule</mat-icon>
                      {{ selectedLocation()!.schedule }}
                    </span>
                  }
                </div>
                <a>
                  [href]="'https://www.google.com/maps/dir/?api=1&destination=' + selectedLocation()!.latitude + ',' + selectedLocation()!.longitude"
                  target="_blank"
                  mat-raised-button
                  class="directions-btn">
                  <mat-icon>directions</mat-icon>
                  Get Directions
                </a>
              </div>

              <!-- Google Map iframe — no API key needed -->
              <div class="map-frame-wrapper">
                <iframe
                  [src]="mapUrl()"
                  width="100%"
                  height="400"
                  style="border:0;"
                  allowfullscreen
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                  title="Food truck location map">
                </iframe>
              </div>
            }
          </div>
        }
      </section>

      <!-- CTA -->
      <section class="cta-section app-container">
        <div class="cta-card">
          <div class="cta-glow"></div>
          <div class="cta-content">
            <h2>Ready to Order? 🎉</h2>
            <p>Pre-order your meal and pick it up hot & fresh from our truck!</p>
            <a mat-raised-button routerLink="/menu" class="cta-btn">
              Start Your Order <mat-icon>arrow_forward</mat-icon>
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="app-container">
          <p>🚚 Street Bites Food Truck · Daily 7 PM – 11 PM</p>
          <p class="footer-sub">Pre-order online · Pay at pickup</p>
          <a routerLink="/auth/login" class="admin-link">Admin</a>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    /* ── Hero ── */
    .hero {
      padding: 70px 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      min-height: 480px;
      position: relative;
      overflow: hidden;
    }
    .hero-content { flex: 1 1 380px; z-index: 2; min-width: 280px; }

    .hero-badge {
      display: inline-block;
      padding: 8px 18px;
      border-radius: var(--radius-full);
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
      color: var(--primary-dark);
      box-shadow: var(--shadow-sm);
    }
    .hero-title {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.6rem, 6vw, 4.2rem);
      font-weight: 900;
      line-height: 1.12;
      margin-bottom: 18px;
      .highlight {
        background: var(--gradient-primary);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
    .hero-sub { font-size: 1.15rem; color: var(--text-secondary); margin-bottom: 36px; line-height: 1.75; }
    .hero-actions { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }

    .btn-order {
      background: var(--gradient-primary) !important;
      color: white !important;
      padding: 14px 32px !important;
      font-size: 1rem !important;
      font-weight: 700 !important;
      border-radius: var(--radius-full) !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      box-shadow: var(--shadow-glow) !important;
    }
    .hours-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 500;
      padding: 10px 18px;
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-sm);
      mat-icon { font-size: 18px; color: var(--primary); }
    }

    /* Hero visual / art */
    .hero-visual {
      flex: 1 1 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 260px;
      padding: 30px 0;
    }
    .hero-art {
      position: relative;
      width: 280px;
      height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .orb { position: absolute; border-radius: 50%; filter: blur(40px); opacity: 0.55; z-index: 0; }
    .orb-1 { width: 220px; height: 220px; background: radial-gradient(circle, var(--primary-light), transparent 70%); top: 0; left: 0; }
    .orb-2 { width: 160px; height: 160px; background: radial-gradient(circle, var(--accent), transparent 70%); bottom: 0; right: 0; }

    .truck-emoji {
      font-size: 110px;
      filter: drop-shadow(0 20px 40px rgba(255,107,53,0.25));
      animation: truckBounce 3s ease-in-out infinite;
      position: relative;
      z-index: 2;
    }
    @keyframes truckBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-14px); }
    }
    .float-item {
      position: absolute;
      font-size: 32px;
      z-index: 3;
      animation: floatItem 4s ease-in-out infinite;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.1));
    }
    .f1 { top: 4px; left: 8px; animation-delay: 0s; }
    .f2 { top: 12px; right: 4px; animation-delay: 1s; }
    .f3 { bottom: 36px; left: 0; animation-delay: 2s; }
    .f4 { bottom: 12px; right: 12px; animation-delay: 0.5s; }
    @keyframes floatItem {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-12px) rotate(6deg); }
    }

    /* Closed banner */
    .closed-banner {
      max-width: 700px;
      margin: 0 auto 24px;
      border-radius: var(--radius-full);
      padding: 14px 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-weight: 600;
      color: var(--primary-dark);
      box-shadow: var(--shadow-sm);
    }

    /* Stats */
    .stats-bar { margin-bottom: 56px; }
    .stats-glass { padding: 28px 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 4px 16px;
      border-right: 1px solid var(--border);
      &:last-child { border-right: none; }
      .stat-icon { font-size: 30px; }
      strong { display: block; font-weight: 700; font-size: 1rem; }
      small { color: var(--text-secondary); font-size: 0.825rem; }
    }

    /* Featured */
    .featured-section { padding-bottom: 64px; }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      h2 { font-family: 'Playfair Display', serif; font-size: 1.9rem; font-weight: 800; }
    }
    .items-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 28px; }
    .featured-card {
      display: flex; flex-direction: column;
      .card-image {
        height: 200px; position: relative; overflow: hidden;
        img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
      }
      &:hover .card-image img { transform: scale(1.08); }
      .image-placeholder {
        width: 100%; height: 100%;
        background: linear-gradient(135deg, #fff3e0, #ffe0cc);
        display: flex; align-items: center; justify-content: center; font-size: 60px;
      }
      .unavailable-overlay {
        position: absolute; inset: 0;
        background: rgba(26,22,37,0.55); backdrop-filter: blur(2px);
        color: white; display: flex; align-items: center; justify-content: center; font-weight: 700;
      }
      .card-body { padding: 22px; flex: 1; display: flex; flex-direction: column; }
      h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
      p { color: var(--text-secondary); font-size: 0.875rem; line-height: 1.5; flex: 1; margin-bottom: 18px; }
      .card-footer { display: flex; align-items: center; justify-content: space-between; }
      .price {
        font-size: 1.25rem; font-weight: 800;
        background: var(--gradient-primary);
        -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      }
    }
    .order-now-btn {
      background: var(--gradient-primary) !important;
      color: white !important; font-weight: 600 !important;
      border-radius: var(--radius-full) !important; box-shadow: var(--shadow-sm) !important;
    }

    /* ── MAP SECTION ── */
    .map-section { padding-bottom: 64px; }

    .map-loading, .no-locations {
      padding: 48px;
      text-align: center;
      color: var(--text-secondary);
      .map-spinner { font-size: 48px; margin-bottom: 12px; animation: spin 2s linear infinite; }
      mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.3; display: block; margin: 0 auto 12px; }
      p { font-size: 0.95rem; }
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .map-wrapper {
      overflow: hidden;
      padding: 0;
    }

    /* Location tabs (for multiple locations) */
    .location-tabs {
      display: flex;
      gap: 8px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      background: rgba(255,255,255,0.5);
    }

    .loc-tab {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--border);
      background: white;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 600;
      font-family: inherit;
      color: var(--text-secondary);
      transition: all 0.25s ease;

      .tab-dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: #ccc;
        transition: background 0.25s;
      }

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
        .tab-dot { background: var(--primary); }
      }

      &.active {
        background: var(--gradient-primary);
        border-color: transparent;
        color: white;
        box-shadow: var(--shadow-glow);
        .tab-dot { background: white; }
      }
    }

    /* Location info bar */
    .location-info-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 24px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      background: rgba(255,255,255,0.6);
    }

    .loc-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .loc-name {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 700;
      font-size: 1rem;
      color: var(--text-primary);
      mat-icon { font-size: 18px; color: var(--primary); }
    }

    .loc-address {
      color: var(--text-secondary);
      font-size: 0.875rem;
      padding-left: 24px;
    }

    .loc-schedule {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--primary-dark);
      font-size: 0.825rem;
      font-weight: 600;
      padding-left: 20px;
      mat-icon { font-size: 14px; }
    }

    .directions-btn {
      background: var(--gradient-primary) !important;
      color: white !important;
      font-weight: 600 !important;
      border-radius: var(--radius-full) !important;
      display: flex !important;
      align-items: center !important;
      gap: 6px !important;
      white-space: nowrap !important;
      box-shadow: var(--shadow-sm) !important;
    }

    /* Map iframe */
    .map-frame-wrapper {
      line-height: 0;
      iframe {
        display: block;
        width: 100%;
        height: 400px;
        border: none;
      }
    }

    /* CTA */
    .cta-section { padding-bottom: 56px; }
    .cta-card {
      position: relative;
      background: var(--gradient-dark);
      border-radius: var(--radius-lg);
      padding: 56px 48px;
      text-align: center;
      color: white;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }
    .cta-glow {
      position: absolute;
      width: 380px; height: 380px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255,107,53,0.35), transparent 70%);
      top: -150px; right: -100px;
      filter: blur(20px);
    }
    .cta-content {
      position: relative; z-index: 1;
      h2 { font-family: 'Playfair Display', serif; font-size: 2.1rem; font-weight: 800; margin-bottom: 12px; }
      p { font-size: 1.1rem; opacity: 0.85; margin-bottom: 32px; }
    }
    .cta-btn {
      background: var(--gradient-primary) !important;
      color: white !important; font-weight: 700 !important;
      padding: 14px 36px !important; border-radius: var(--radius-full) !important;
      display: inline-flex !important; align-items: center !important; gap: 8px !important;
      box-shadow: 0 12px 32px rgba(255,107,53,0.4) !important;
    }

    /* Footer */
    .footer {
      background: var(--gradient-dark);
      color: rgba(255,255,255,0.75);
      padding: 28px 0; text-align: center;
      p { margin-bottom: 4px; }
      .footer-sub { opacity: 0.55; font-size: 0.85rem; }
      .admin-link { color: rgba(255,255,255,0.25); font-size: 0.75rem; text-decoration: none; margin-top: 8px; display: inline-block; }
    }

    /* Skeleton */
    .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 28px; }
    .skeleton-card {
      height: 340px;
      background: linear-gradient(90deg, rgba(255,255,255,0.5) 25%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0.5) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius);
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    @media (max-width: 768px) {
      .hero { padding: 40px 0; min-height: auto; }
      .hero-visual { display: none; }
      .stats-grid { grid-template-columns: 1fr; }
      .stat-item { border-right: none; border-bottom: 1px solid var(--border); padding: 12px 16px; &:last-child { border-bottom: none; } }
      .cta-card { padding: 40px 24px; }
      .location-info-bar { flex-direction: column; align-items: flex-start; }
      .map-frame-wrapper iframe { height: 280px; }
    }
  `]
})
export class Home implements OnInit {
  featuredItems = signal<MenuItem[]>([]);
  settings = signal<BusinessSettings | null>(null);
  locations = signal<Location[]>([]);
  selectedLocation = signal<Location | null>(null);
  loading = signal(true);
  locationsLoading = signal(true);

  constructor(
    private menuService: MenuService,
    private businessService: BusinessService,
    private locationService: LocationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.menuService.getAvailableMenuItems().subscribe({
      next: items => { this.featuredItems.set(items.slice(0, 3)); this.loading.set(false); },
      error: () => this.loading.set(false)
    });

    this.businessService.getSettings().subscribe({
      next: s => this.settings.set(s),
      error: () => {}
    });

    this.locationService.getLocations().subscribe({
      next: locs => {
        this.locations.set(locs);
        if (locs.length > 0) this.selectedLocation.set(locs[0]);
        this.locationsLoading.set(false);
      },
      error: () => this.locationsLoading.set(false)
    });
  }

  selectLocation(loc: Location) {
    this.selectedLocation.set(loc);
  }

  mapUrl(): SafeResourceUrl {
    const loc = this.selectedLocation();
    if (!loc) return this.sanitizer.bypassSecurityTrustResourceUrl('');
    // No API key needed with this URL format
    const url = `https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}