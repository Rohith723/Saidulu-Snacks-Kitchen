import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BusinessSettings, PickupSlot } from '../models';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function slotMinutes(time: string): number {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function sortSlots(slots: PickupSlot[]): PickupSlot[] {
  return [...slots].sort((a, b) => slotMinutes(a.slot_time) - slotMinutes(b.slot_time));
}

@Injectable({ providedIn: 'root' })
export class BusinessService {
  constructor(private supabase: SupabaseService) {}

  getSettings(): Observable<BusinessSettings> {
    return from(this.supabase.client.from('business_settings').select('*').single())
      .pipe(map(({ data, error }) => { if (error) throw error; return data as BusinessSettings; }));
  }

 updateSettings(settings: Partial<BusinessSettings>): Observable<BusinessSettings> {
  return from(
    this.supabase.client
      .from('business_settings')
      .select('id')
      .limit(1)
      .single()
      .then(({ data: existing, error: fetchError }) => {
        if (fetchError) throw fetchError;
        return this.supabase.client
          .from('business_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();
      })
  ).pipe(map((result: any) => {
    if (result.error) throw result.error;
    return result.data as BusinessSettings;
  }));
}

  getPickupSlots(): Observable<PickupSlot[]> {
    return from(this.supabase.client.from('pickup_slots').select('*').eq('is_active', true))
      .pipe(map(({ data, error }) => { if (error) throw error; return sortSlots(data as PickupSlot[]); }));
  }

  getAllPickupSlots(): Observable<PickupSlot[]> {
    return from(this.supabase.client.from('pickup_slots').select('*'))
      .pipe(map(({ data, error }) => { if (error) throw error; return sortSlots(data as PickupSlot[]); }));
  }

  addPickupSlot(slot: Partial<PickupSlot>): Observable<PickupSlot> {
    return from(this.supabase.client.from('pickup_slots').insert(slot).select().single())
      .pipe(map(({ data, error }) => { if (error) throw error; return data as PickupSlot; }));
  }

  updatePickupSlot(id: string, updates: Partial<PickupSlot>): Observable<PickupSlot> {
    return from(this.supabase.client.from('pickup_slots').update(updates).eq('id', id).select().single())
      .pipe(map(({ data, error }) => { if (error) throw error; return data as PickupSlot; }));
  }

  deletePickupSlot(id: string): Observable<void> {
    return from(this.supabase.client.from('pickup_slots').delete().eq('id', id))
      .pipe(map(({ error }) => { if (error) throw error; }));
  }
}