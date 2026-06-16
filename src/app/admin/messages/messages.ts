import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LocationService } from '../../services/location.service';
import { ContactMessage } from '../../models';

@Component({
  selector: 'app-messages',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="messages-page">
      <div class="page-header">
        <div>
          <h1>Messages</h1>
          <p>Customer enquiries submitted through the contact form.</p>
        </div>
        <div class="header-stats">
          <div class="unread-badge" [class.has-unread]="unreadCount() > 0">
            <mat-icon>mark_email_unread</mat-icon>
            {{ unreadCount() }} unread
          </div>
          <button mat-raised-button (click)="loadMessages()" class="refresh-btn">
            <mat-icon>refresh</mat-icon> Refresh
          </button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-container"><mat-spinner></mat-spinner></div>
      } @else if (messages().length === 0) {
        <div class="empty-state">
          <mat-icon>inbox</mat-icon>
          <h3>No messages yet</h3>
          <p>Customer messages from the contact form will appear here.</p>
        </div>
      } @else {
        <div class="messages-list">
          @for (msg of messages(); track msg.id) {
            <div class="message-card" [class.unread]="!msg.is_read" (click)="markRead(msg)">
              <div class="msg-header">
                <div class="msg-avatar">{{ msg.name.charAt(0).toUpperCase() }}</div>
                <div class="msg-meta">
                  <div class="msg-name-row">
                    <strong>{{ msg.name }}</strong>
                    @if (!msg.is_read) { <span class="new-dot"></span> }
                  </div>
                  <div class="msg-contacts">
                    <span><mat-icon>phone</mat-icon> {{ msg.phone }}</span>
                    @if (msg.email) {
                      <span><mat-icon>email</mat-icon> {{ msg.email }}</span>
                    }
                  </div>
                </div>
                <div class="msg-time">{{ formatDate(msg.created_at!) }}</div>
              </div>

              <div class="msg-body">{{ msg.message }}</div>

              <div class="msg-actions">
                @if (!msg.is_read) {
                  <button mat-button class="read-btn" (click)="markRead(msg); $event.stopPropagation()">
                    <mat-icon>done</mat-icon> Mark as Read
                  </button>
                } @else {
                  <span class="read-label"><mat-icon>done_all</mat-icon> Read</span>
                }
                <button mat-icon-button color="warn" (click)="deleteMessage(msg); $event.stopPropagation()"
                  matTooltip="Delete message">
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
    .messages-page { max-width: 900px; }

    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px;
      h1 { font-family: 'Playfair Display', serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 4px; }
      p { color: var(--text-secondary); }
    }

    .header-stats { display: flex; align-items: center; gap: 12px; }

    .unread-badge { display: flex; align-items: center; gap: 6px; background: #f5f5f5; color: var(--text-secondary); padding: 8px 16px; border-radius: var(--radius-full); font-size: 0.875rem; font-weight: 600;
      mat-icon { font-size: 18px; }
      &.has-unread { background: rgba(255,107,53,0.1); color: var(--primary); }
    }

    .refresh-btn { display: flex !important; align-items: center !important; gap: 6px !important; border-radius: var(--radius-full) !important; }

    .messages-list { display: flex; flex-direction: column; gap: 16px; }

    .message-card { background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: var(--radius); padding: 22px; box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.25s ease;
      &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
      &.unread { border-left: 4px solid var(--primary); background: rgba(255,107,53,0.03); }
    }

    .msg-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }

    .msg-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--gradient-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; flex-shrink: 0; }

    .msg-meta { flex: 1; }

    .msg-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
      strong { font-size: 1rem; font-weight: 700; }
    }

    .new-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--primary); }

    .msg-contacts { display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
      span { display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 0.825rem;
        mat-icon { font-size: 14px; }
      }
    }

    .msg-time { color: var(--text-secondary); font-size: 0.8rem; white-space: nowrap; }

    .msg-body { background: rgba(0,0,0,0.03); border-radius: var(--radius-sm); padding: 14px 16px; font-size: 0.9rem; line-height: 1.6; color: var(--text-primary); margin-bottom: 14px; border-left: 3px solid var(--border); }

    .msg-actions { display: flex; align-items: center; justify-content: space-between; }

    .read-btn { color: var(--success) !important; font-weight: 600 !important; display: flex !important; align-items: center !important; gap: 4px !important; }

    .read-label { display: flex; align-items: center; gap: 4px; color: var(--text-secondary); font-size: 0.85rem;
      mat-icon { font-size: 16px; }
    }

    .empty-state { text-align: center; padding: 60px; color: var(--text-secondary);
      mat-icon { font-size: 56px; width: 56px; height: 56px; opacity: 0.3; margin-bottom: 16px; display: block; }
      h3 { font-size: 1.2rem; margin-bottom: 8px; }
    }
  `]
})
export class Messages implements OnInit {
  messages = signal<ContactMessage[]>([]);
  loading = signal(true);
  unreadCount = signal(0);

  constructor(private locationService: LocationService, private snackBar: MatSnackBar) {}

  ngOnInit() { this.loadMessages(); }

  loadMessages() {
    this.loading.set(true);
    this.locationService.getMessages().subscribe({
      next: msgs => {
        this.messages.set(msgs);
        this.unreadCount.set(msgs.filter(m => !m.is_read).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  markRead(msg: ContactMessage) {
    if (msg.is_read) return;
    this.locationService.markAsRead(msg.id!).subscribe({
      next: () => this.loadMessages(),
      error: () => {}
    });
  }

  deleteMessage(msg: ContactMessage) {
    if (!confirm('Delete this message?')) return;
    this.locationService.deleteMessage(msg.id!).subscribe({
      next: () => { this.snackBar.open('Message deleted.', '✕', { duration: 2000 }); this.loadMessages(); },
      error: e => this.snackBar.open('Error: ' + e.message, '✕', { duration: 3000, panelClass: 'error-snack' })
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }
}