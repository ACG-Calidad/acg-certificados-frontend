import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-pending-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  template: `
    <div class="pending-users-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Usuarios Pendientes de Aprobación</mat-card-title>
          <mat-card-subtitle>Gestión de solicitudes de usuarios</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Funcionalidad en desarrollo...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .pending-users-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }
  `]
})
export class PendingUsersComponent {
  // TODO: Implementar lógica de gestión de usuarios pendientes
}
