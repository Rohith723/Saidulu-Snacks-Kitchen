import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LocationService } from '../../services/location.service';
import { Location } from '../../models';

@Component({
  selector: 'app-locations',
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSnackBarModule, MatProgressSpinnerModule,
    MatTooltipModule, MatSlideToggleModule],
  template: `
    <div class="locations-mgmt">
      <div class="page-header">
        <div>
          <h1>Locations</h1>
          <p>Manage where your food truck is parked and shown to customers.</p>
        </div>
        <button mat-raised-button class="add-btn" (click)="openForm()">
          <mat-icon>add_location</mat-icon> Add Location
        </button>
      </div>

      @if (showForm()) {
        <div class="form-card">
          <div class="form-header">
            <h2>{{ editingLocation() ? 'Edit Location' : 'Add New Location' }}</h2>
            <button mat-icon-button (click)="closeForm()"><mat-icon>close</mat-icon></button>
          </div>

          <form [formGroup]="locationForm" (ngSubmit)="saveLocation()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Location Name</mat-label>
                <input matInput formControlName="name" placeholder="e.g. Indiranagar Main Road">
                <mat-icon matPrefix>store</mat-icon>
                @if (locationForm.get('name')?.errors?.['required'] && locationForm.get('name')?.touched) {
                  <mat-error>Name is required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Schedule</mat-label>
                <input matInput formControlName="schedule" placeholder="e.g. Mon–Fri 7 PM–11 PM">
                <mat-icon matPrefix>schedule</mat-icon>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="form-field-full">
              <mat-label>Full Address</mat-label>
              <textarea matInput formControlName="address" rows="2"
                placeholder="e.g. 100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038"></textarea>
              <mat-icon matPrefix>location_on</mat-icon>
              @if (locationForm.get('address')?.errors?.['required'] && locationForm.get('address')?.touched) {
                <mat-error>Address is required</mat-error>
              }
            </mat-form-field>

            <div class="coords-row">
              <mat-form-field appearance="outline">
                <mat-label>Latitude</mat-label>
                <input matInput formControlName="latitude" type="number" step="any" placeholder="12.9784">
                <mat-icon matPrefix>explore</mat-icon>
                @if (locationForm.get('latitude')?.errors && locationForm.get('latitude')?.touched) {
                  <mat-error>Valid latitude required</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Longitude</mat-label>
                <input matInput formControlName="longitude" type="number" step="any" placeholder="77.6408">
                <mat-icon matPrefix>explore</mat-icon>
                @if (locationForm.get('longitude')?.errors && locationForm.get('longitude')?.touched) {
                  <mat-error>Valid longitude required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="coords-help">
              <mat-icon>info_outline</mat-icon>
              <span>To get coordinates: open <strong>Google Maps</strong>, right-click your location → click the coordinates shown at the top of the menu to copy them.</span>
            </div>

            <div class="form-toggle">
              <mat-slide-toggle formControlName="is_active" color="primary">
                {{ locationForm.get('is_active')?.value ? 'Active (visible to customers)' : 'Inactive (hidden)' }}
              </mat-slide-toggle>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="closeForm()">Cancel</button>
              <button mat-raised-button type="submit" class="save-btn"
                [disabled]="saving() || locationForm.invalid">
                @if (saving()) { <mat-spinner diameter="18"></mat-spinner> }
                {{ editingLocation() ? 'Update Location' : 'Add Location' }}
              </button>
            </div>
          </form>
        </div>
      }

      @if (loading()) {
        <div class="loading-container"><mat-spinner></mat-spinner></div>
      } @else if (locations().length === 0) {
        <div class="empty-state">
          <mat-icon>location_off</mat-icon>
          <h3>No locations yet</h3>
          <p>Add your first truck location so customers know where to find you!</p>
        </div>
      } @else {
        <div class="locations-grid">
          @for (loc of locations(); track loc.id) {
            <div class="location-card" [class.inactive]="!loc.is_active">
              <div class="card-header">
                <div class="loc-icon">📍</div>
                <div class="loc-info">
                  <h3>{{ loc.name }}</h3>
                  <p class="address">{{ loc.address }}</p>
                </div>
                <span class="status-badge" [class.active]="loc.is_active">
                  {{ loc.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>

              @if (loc.schedule) {
                <div class="schedule-tag">
                  <mat-icon>schedule</mat-icon>
                  {{ loc.schedule }}
                </div>
              }

              <div class="coords-display">
                <mat-icon>gps_fixed</mat-icon>
                <span>{{ loc.latitude }}, {{ loc.longitude }}</span>
                <a [href]="'https://www.google.com/maps?q=' + loc.latitude + ',' + loc.longitude"
                  target="_blank" class="view-map-link">
                  <mat-icon>open_in_new</mat-icon>
                </a>
              </div>

              <div class="card-actions">
                <button mat-icon-button color="primary" (click)="editLocation(loc)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button (click)="toggleActive(loc)"
                  [matTooltip]="loc.is_active ? 'Deactivate' : 'Activate'">
                  <mat-icon>{{ loc.is_active ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteLocation(loc)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .locations-mgmt { max-width: 1000px; }

    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px;
      h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
      p { color: var(--text-secondary); }
    }
    .add-btn { background: var(--gradient-primary) !important; color: white !important; display: flex !important; align-items: center !important; gap: 6px !important; border-radius: var(--radius-full) !important; font-weight: 600 !important; }

    .form-card { background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: var(--radius); padding: 28px; margin-bottom: 28px; box-shadow: var(--shadow-md); }
    .form-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; h2 { font-size: 1.1rem; font-weight: 700; } }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; mat-form-field { width: 100%; } }
    .coords-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; mat-form-field { width: 100%; } }

    .coords-help { display: flex; align-items: flex-start; gap: 8px; background: rgba(255,107,53,0.06); border: 1px solid rgba(255,107,53,0.15); padding: 12px 16px; border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;
      mat-icon { font-size: 18px; color: var(--primary); flex-shrink: 0; margin-top: 1px; }
      strong { color: var(--text-primary); }
    }

    .form-toggle { margin-bottom: 20px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
    .save-btn { background: var(--gradient-primary) !important; color: white !important; font-weight: 600 !important; border-radius: var(--radius-full) !important; display: flex !important; align-items: center !important; gap: 8px !important; }

    .locations-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }

    .location-card { background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: var(--radius); padding: 22px; box-shadow: var(--shadow-sm); transition: all 0.3s ease;
      &:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
      &.inactive { opacity: 0.65; }
    }

    .card-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px;
      .loc-icon { font-size: 28px; flex-shrink: 0; }
      .loc-info { flex: 1; h3 { font-weight: 700; font-size: 1rem; margin-bottom: 4px; } }
      .address { color: var(--text-secondary); font-size: 0.85rem; line-height: 1.5; }
    }

    .status-badge { font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-full); background: #fce4ec; color: #c62828; white-space: nowrap;
      &.active { background: var(--success-bg); color: var(--success); }
    }

    .schedule-tag { display: flex; align-items: center; gap: 6px; background: rgba(255,107,53,0.08); color: var(--primary-dark); padding: 6px 12px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 600; margin-bottom: 12px;
      mat-icon { font-size: 16px; }
    }

    .coords-display { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); font-size: 0.8rem; font-family: monospace; margin-bottom: 14px;
      mat-icon { font-size: 16px; color: var(--primary); }
    }

    .view-map-link { color: var(--primary); display: flex; align-items: center; margin-left: auto;
      mat-icon { font-size: 16px; }
    }

    .card-actions { display: flex; justify-content: flex-end; gap: 4px; }

    .empty-state { text-align: center; padding: 60px; color: var(--text-secondary);
      mat-icon { font-size: 56px; width: 56px; height: 56px; opacity: 0.3; margin-bottom: 16px; display: block; }
      h3 { font-size: 1.2rem; margin-bottom: 8px; }
    }

    @media (max-width: 600px) { .form-grid, .coords-row { grid-template-columns: 1fr; } }
  `]
})
export class Locations implements OnInit {
  locations = signal<Location[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingLocation = signal<Location | null>(null);
  saving = signal(false);
  locationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private locationService: LocationService,
    private snackBar: MatSnackBar
  ) {
    this.locationForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      schedule: [''],
      is_active: [true],
    });
  }

  ngOnInit() { this.loadLocations(); }

  loadLocations() {
    this.locationService.getAllLocations().subscribe({
      next: locs => { this.locations.set(locs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openForm() {
    this.editingLocation.set(null);
    this.locationForm.reset({ is_active: true });
    this.showForm.set(true);
  }

  editLocation(loc: Location) {
    this.editingLocation.set(loc);
    this.locationForm.patchValue(loc);
    this.showForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeForm() {
    this.showForm.set(false);
    this.editingLocation.set(null);
  }

  saveLocation() {
    if (this.locationForm.invalid) { this.locationForm.markAllAsTouched(); return; }
    this.saving.set(true);
    const data = this.locationForm.value;
    if (this.editingLocation()) {
      this.locationService.updateLocation(this.editingLocation()!.id!, data).subscribe({
        next: () => { this.snackBar.open('Location updated!', '✕', { duration: 2000, panelClass: 'success-snack' }); this.closeForm(); this.loadLocations(); this.saving.set(false); },
        error: e => { this.saving.set(false); this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' }); }
      });
    } else {
      this.locationService.addLocation(data).subscribe({
        next: () => { this.snackBar.open('Location added!', '✕', { duration: 2000, panelClass: 'success-snack' }); this.closeForm(); this.loadLocations(); this.saving.set(false); },
        error: e => { this.saving.set(false); this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' }); }
      });
    }
  }

  toggleActive(loc: Location) {
    this.locationService.updateLocation(loc.id!, { is_active: !loc.is_active }).subscribe({
      next: () => { this.loadLocations(); this.snackBar.open('Updated!', '✕', { duration: 2000, panelClass: 'success-snack' }); },
      error: e => this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' })
    });
  }

  deleteLocation(loc: Location) {
    if (!confirm(`Delete "${loc.name}"?`)) return;
    this.locationService.deleteLocation(loc.id!).subscribe({
      next: () => { this.loadLocations(); this.snackBar.open('Deleted.', '✕', { duration: 2000 }); },
      error: e => this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' })
    });
  }
}