import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="stats-card" [ngClass]="colorClass">
      <div class="stats-content">
        <div class="stats-icon">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
        <div class="stats-info">
          <span class="stats-value">{{ value | number }}</span>
          <span class="stats-label">{{ label }}</span>
        </div>
      </div>
      @if (subtitle) {
        <div class="stats-subtitle">{{ subtitle }}</div>
      }
    </mat-card>
  `,
  styles: [`
    .stats-card {
      padding: 20px;
      border-radius: 12px;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
      }

      &.primary {
        background: linear-gradient(135deg, #0066CC 0%, #004999 100%);
        color: white;
      }

      &.success {
        background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%);
        color: white;
      }

      &.warning {
        background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
        color: white;
      }

      &.info {
        background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
        color: white;
      }
    }

    .stats-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stats-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;

      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
    }

    .stats-info {
      display: flex;
      flex-direction: column;
    }

    .stats-value {
      font-size: 32px;
      font-weight: 600;
      line-height: 1.2;
    }

    .stats-label {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 4px;
    }

    .stats-subtitle {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 13px;
      opacity: 0.8;
    }
  `]
})
export class StatsCardComponent {
  @Input() icon = 'analytics';
  @Input() value = 0;
  @Input() label = '';
  @Input() subtitle = '';
  @Input() color: 'primary' | 'success' | 'warning' | 'info' = 'primary';

  get colorClass(): string {
    return this.color;
  }
}
