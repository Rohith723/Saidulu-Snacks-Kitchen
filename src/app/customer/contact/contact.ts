import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Navbar } from '../../shared/navbar/navbar';
import { LocationService } from '../../services/location.service';
import { Location } from '../../models';

@Component({
  selector: 'app-contact',
  imports: [RouterLink, ReactiveFormsModule, MatButtonModule, MatIconModule,
    MatInputModule, MatFormFieldModule, MatSnackBarModule, MatProgressSpinnerModule, Navbar],
  template: `
    <div class="page-wrapper">
      <app-navbar></app-navbar>

      <div class="contact-page app-container">
        <div class="page-header">
          <h1>Find Us 📍</h1>
          <p>We move around the city — here's where to find us and how to reach us.</p>
        </div>

        // <!-- Locations Section -->
        // <section class="locations-section">
        //   <h2 class="section-title">Our Locations</h2>

        //   @if (loading()) {
        //     <div class="loading-container"><mat-spinner diameter="40"></mat-spinner></div>
        //   } @else if (locations().length === 0) {
        //     <div class="empty-locations glass-card">
        //       <mat-icon>location_off</mat-icon>
        //       <p>No locations added yet. Check back soon!</p>
        //     </div>
        //   } @else {
        //     <div class="locations-grid">
        //       @for (loc of locations(); track loc.id) {
        //         <div class="location-card glass-card" [class.selected]="selectedLocation()?.id === loc.id"
        //           (click)="selectLocation(loc)">
        //           <div class="location-header">
        //             <div class="location-icon">📍</div>
        //             <div>
        //               <h3>{{ loc.name }}</h3>
        //               <p class="address">{{ loc.address }}</p>
        //             </div>
        //             @if (selectedLocation()?.id === loc.id) {
        //               <mat-icon class="selected-icon">check_circle</mat-icon>
        //             }
        //           </div>
        //           @if (loc.schedule) {
        //             <div class="schedule-badge">
        //               <mat-icon>schedule</mat-icon>
        //               <span>{{ loc.schedule }}</span>
        //             </div>
        //           }
        //           <button mat-button class="directions-btn"
        //             (click)="openDirections(loc); $event.stopPropagation()">
        //             <mat-icon>directions</mat-icon>
        //             Get Directions
        //           </button>
        //         </div>
        //       }
        //     </div>

        //     <!-- Map embed -->
        //     @if (selectedLocation()) {
        //       <div class="map-container glass-card">
        //         <div class="map-header">
        //           <mat-icon>map</mat-icon>
        //           <span>{{ selectedLocation()!.name }}</span>
        //           <small>{{ selectedLocation()!.address }}</small>
        //         </div>
        //         <iframe
        //           [src]="mapUrl()"
        //           width="100%"
        //           height="380"
        //           style="border:0; border-radius: 0 0 20px 20px;"
        //           allowfullscreen
        //           loading="lazy"
        //           referrerpolicy="no-referrer-when-downgrade">
        //         </iframe>
        //       </div>
        //     } @else {
        //       <div class="map-placeholder glass-card">
        //         <mat-icon>touch_app</mat-icon>
        //         <p>Click a location above to view it on the map</p>
        //       </div>
        //     }
        //   }
        // </section>

        <!-- Contact Form Section -->
        <section class="contact-section">
          <div class="contact-layout">
            <div class="contact-info glass-card">
              <h2>Get in Touch</h2>
              <p>Have a question, feedback, or want to book us for an event? We'd love to hear from you!</p>

              <div class="info-items">
                <div class="info-item">
                  <div class="info-icon">🕐</div>
                  <div>
                    <strong>Business Hours</strong>
                    <span>Daily 7:00 PM – 11:00 PM</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">📱</div>
                  <div>
                    <strong>WhatsApp</strong>
                    <span>Message us on WhatsApp for quick replies</span>
                  </div>
                </div>
                <div class="info-item">
                  <div class="info-icon">🚚</div>
                  <div>
                    <strong>Pre-orders</strong>
                    <span>Order online and skip the queue</span>
                  </div>
                </div>
              </div>

              <a mat-raised-button routerLink="/menu" class="order-btn">
                <mat-icon>restaurant_menu</mat-icon>
                Order Now
              </a>
            </div>

            <div class="contact-form-card glass-card">
              <h2>Send a Message</h2>

              @if (submitted()) {
                <div class="success-state">
                  <div class="success-icon">✅</div>
                  <h3>Message Sent!</h3>
                  <p>Thanks for reaching out. We'll get back to you soon.</p>
                  <button mat-button (click)="submitted.set(false)" color="primary">Send Another</button>
                </div>
              } @else {
                <form [formGroup]="contactForm" (ngSubmit)="submitMessage()">
                  <mat-form-field appearance="outline" class="form-field-full">
                    <mat-label>Your Name</mat-label>
                    <input matInput formControlName="name" placeholder="John Doe">
                    <mat-icon matPrefix>person</mat-icon>
                    @if (contactForm.get('name')?.errors?.['required'] && contactForm.get('name')?.touched) {
                      <mat-error>Name is required</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field-full">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phone" placeholder="9999999999" maxlength="10">
                    <mat-icon matPrefix>phone</mat-icon>
                    @if (contactForm.get('phone')?.errors && contactForm.get('phone')?.touched) {
                      <mat-error>Enter a valid 10-digit number</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field-full">
                    <mat-label>Email (Optional)</mat-label>
                    <input matInput formControlName="email" type="email" placeholder="john@email.com">
                    <mat-icon matPrefix>email</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="form-field-full">
                    <mat-label>Message</mat-label>
                    <textarea matInput formControlName="message" rows="4"
                      placeholder="Tell us what's on your mind..."></textarea>
                    <mat-icon matPrefix>message</mat-icon>
                    @if (contactForm.get('message')?.errors?.['required'] && contactForm.get('message')?.touched) {
                      <mat-error>Message is required</mat-error>
                    }
                  </mat-form-field>

                  <button mat-raised-button type="submit" class="submit-btn"
                    [disabled]="sending() || contactForm.invalid">
                    @if (sending()) {
                      <mat-spinner diameter="20"></mat-spinner>
                      Sending...
                    } @else {
                      <mat-icon>send</mat-icon>
                      Send Message
                    }
                  </button>
                </form>
              }
            </div>
          </div>
        </section>
      </div>

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
    .contact-page { padding: 48px 0 60px; }

    .page-header {
      margin-bottom: 48px;
      h1 { font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 900; margin-bottom: 8px; }
      p { color: var(--text-secondary); font-size: 1.05rem; }
    }

    // Locations
    .locations-section { margin-bottom: 64px; }

    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.6rem;
      font-weight: 800;
      margin-bottom: 24px;
    }

    .locations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .location-card {
      padding: 22px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:hover { transform: translateY(-4px); }

      &.selected {
        border-color: var(--primary);
        box-shadow: var(--shadow-glow);
      }
    }

    .location-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 14px;
      position: relative;

      .location-icon { font-size: 28px; flex-shrink: 0; }

      h3 { font-weight: 700; font-size: 1rem; margin-bottom: 4px; }

      .address { color: var(--text-secondary); font-size: 0.875rem; line-height: 1.5; }
    }

    .selected-icon {
      position: absolute;
      top: 0; right: 0;
      color: var(--primary);
    }

    .schedule-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,107,53,0.08);
      color: var(--primary-dark);
      padding: 6px 12px;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 14px;
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    .directions-btn {
      color: var(--primary) !important;
      font-weight: 600 !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      gap: 4px !important;
      mat-icon { font-size: 18px; }
    }

    .map-container {
      overflow: hidden;
      margin-top: 8px;
    }

    .map-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      background: rgba(255,107,53,0.04);

      mat-icon { color: var(--primary); }
      span { font-weight: 700; font-size: 1rem; flex: 1; }
      small { color: var(--text-secondary); font-size: 0.8rem; }
    }

    .map-placeholder {
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: var(--text-secondary);
      margin-top: 8px;

      mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.4; }
      p { font-size: 0.9rem; }
    }

    .empty-locations {
      padding: 48px;
      text-align: center;
      color: var(--text-secondary);
      mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.3; display: block; margin: 0 auto 12px; }
    }

    // Contact
    .contact-section { margin-bottom: 32px; }
    .contact-layout { display: grid; grid-template-columns: 1fr 1.3fr; gap: 28px; align-items: start; }

    .contact-info {
      padding: 32px;
      h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 800; margin-bottom: 12px; }
      p { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.7; margin-bottom: 28px; }
    }

    .info-items { display: flex; flex-direction: column; gap: 20px; margin-bottom: 28px; }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;

      .info-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }

      strong { display: block; font-weight: 700; font-size: 0.95rem; margin-bottom: 3px; }
      span { color: var(--text-secondary); font-size: 0.875rem; }
    }

    .order-btn {
      background: var(--gradient-primary) !important;
      color: white !important;
      font-weight: 700 !important;
      border-radius: var(--radius-full) !important;
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      box-shadow: var(--shadow-glow) !important;
    }

    .contact-form-card {
      padding: 32px;
      h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 800; margin-bottom: 24px; }
    }

    .submit-btn {
      width: 100%;
      background: var(--gradient-primary) !important;
      color: white !important;
      font-weight: 700 !important;
      height: 50px !important;
      border-radius: var(--radius-full) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      box-shadow: var(--shadow-glow) !important;
      margin-top: 8px !important;
    }

    .success-state {
      text-align: center;
      padding: 32px 0;
      .success-icon { font-size: 56px; margin-bottom: 16px; }
      h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; }
      p { color: var(--text-secondary); margin-bottom: 20px; }
    }

    .footer {
      background: var(--gradient-dark);
      color: rgba(255,255,255,0.75);
      padding: 28px 0;
      text-align: center;
      p { margin-bottom: 4px; }
      .footer-sub { opacity: 0.55; font-size: 0.85rem; }
      .admin-link { color: rgba(255,255,255,0.25); font-size: 0.75rem; text-decoration: none; margin-top: 8px; display: inline-block; }
    }

    @media (max-width: 900px) {
      .contact-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 600px) {
      .locations-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class Contact implements OnInit {
  // locations = signal<Location[]>([]);
  // selectedLocation = signal<Location | null>(null);
  // loading = signal(true);
  sending = signal(false);
  submitted = signal(false);
  contactForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      email: ['', Validators.email],
      message: ['', Validators.required],
    });
  }

  // ngOnInit() {
  //   this.locationService.getLocations().subscribe({
  //     next: locs => {
  //       this.locations.set(locs);
  //       if (locs.length > 0) this.selectedLocation.set(locs[0]);
  //       this.loading.set(false);
  //     },
  //     error: () => this.loading.set(false)
  //   });
  // }

  // selectLocation(loc: Location) {
  //   this.selectedLocation.set(loc);
  // }

  // mapUrl(): SafeResourceUrl {
  //   const loc = this.selectedLocation();
  //   if (!loc) return this.sanitizer.bypassSecurityTrustResourceUrl('');
  //   const url = `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${loc.latitude},${loc.longitude}&zoom=15`;
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  // }

  // openDirections(loc: Location) {
  //   window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`, '_blank');
  // }

  submitMessage() {
  if (this.contactForm.invalid) {
    this.contactForm.markAllAsTouched();
    this.snackBar.open('Please check the form — phone must be 10 digits starting with 6-9.', '✕', { duration: 4000, panelClass: 'error-snack' });
    return;
  }
  this.sending.set(true);
  this.locationService.sendMessage(this.contactForm.value).subscribe({
    next: () => {
      this.sending.set(false);
      this.submitted.set(true);
      this.contactForm.reset();
    },
    error: e => {
  this.sending.set(false);
  const fullError = JSON.stringify({ message: e.message, details: e.details, hint: e.hint, code: e.code }, null, 2);
  this.snackBar.open(fullError, 'Close', { duration: 15000, panelClass: 'error-snack' });
}
  });
}
}