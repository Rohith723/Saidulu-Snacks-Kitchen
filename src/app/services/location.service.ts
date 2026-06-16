import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Location, ContactMessage } from '../models';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LocationService {
  constructor(private supabase: SupabaseService) {}

  getLocations(): Observable<Location[]> {
    return from(
      this.supabase.client.from('locations').select('*').eq('is_active', true).order('created_at')
    ).pipe(map(({ data, error }) => { if (error) throw error; return data as Location[]; }));
  }

  getAllLocations(): Observable<Location[]> {
    return from(
      this.supabase.client.from('locations').select('*').order('created_at')
    ).pipe(map(({ data, error }) => { if (error) throw error; return data as Location[]; }));
  }

  addLocation(loc: Partial<Location>): Observable<Location> {
    return from(
      this.supabase.client.from('locations').insert(loc).select().single()
    ).pipe(map(({ data, error }) => { if (error) throw error; return data as Location; }));
  }

  updateLocation(id: string, updates: Partial<Location>): Observable<Location> {
    return from(
      this.supabase.client.from('locations').update(updates).eq('id', id).select().single()
    ).pipe(map(({ data, error }) => { if (error) throw error; return data as Location; }));
  }

  deleteLocation(id: string): Observable<void> {
    return from(
      this.supabase.client.from('locations').delete().eq('id', id)
    ).pipe(map(({ error }) => { if (error) throw error; }));
  }

  // Contact messages
  sendMessage(msg: Omit<ContactMessage, 'id' | 'created_at' | 'is_read'>): Observable<ContactMessage> {
    return from(
      this.supabase.client.from('contact_messages').insert(msg).select().single()
    ).pipe(map(({ data, error }) => { if (error) throw error; return data as ContactMessage; }));
  }

  getMessages(): Observable<ContactMessage[]> {
    return from(
      this.supabase.client.from('contact_messages').select('*').order('created_at', { ascending: false })
    ).pipe(map(({ data, error }) => { if (error) throw error; return data as ContactMessage[]; }));
  }

  markAsRead(id: string): Observable<void> {
    return from(
      this.supabase.client.from('contact_messages').update({ is_read: true }).eq('id', id)
    ).pipe(map(({ error }) => { if (error) throw error; }));
  }

  deleteMessage(id: string): Observable<void> {
    return from(
      this.supabase.client.from('contact_messages').delete().eq('id', id)
    ).pipe(map(({ error }) => { if (error) throw error; }));
  }

  getUnreadCount(): Observable<number> {
    return from(
      this.supabase.client.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)
    ).pipe(map(({ count, error }) => { if (error) throw error; return count || 0; }));
  }
}