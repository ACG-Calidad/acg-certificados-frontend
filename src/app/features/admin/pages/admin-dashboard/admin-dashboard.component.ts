import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="admin-dashboard-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Panel de Administración</mat-card-title>
          <mat-card-subtitle>Vista general del sistema</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Funcionalidad en desarrollo...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .admin-dashboard-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }
  `]
})
export class AdminDashboardComponent {
  // TODO: Implementar dashboard administrativo
}
