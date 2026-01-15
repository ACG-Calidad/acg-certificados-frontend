import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page-container">
      <h1>Configuración</h1>
      <mat-card>
        <mat-card-content>
          <div class="placeholder">
            <mat-icon>settings</mat-icon>
            <p>Módulo de configuración del sistema</p>
            <p class="subtitle">En desarrollo</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 24px; color: #333; }
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      text-align: center;
      mat-icon { font-size: 64px; width: 64px; height: 64px; color: #0066CC; opacity: 0.5; }
      p { margin: 16px 0 0; color: rgba(0,0,0,0.6); }
      .subtitle { font-size: 14px; }
    }
  `]
})
export class SettingsComponent {}
