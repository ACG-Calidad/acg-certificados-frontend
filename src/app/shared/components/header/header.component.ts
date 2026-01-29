import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  user: User | null = null;

  constructor(private authService: AuthService) {
    this.user = this.authService.getUserData();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/certificados';
  }

  getRoleLabel(): string {
    const labels: Record<string, string> = {
      'admin': 'Administrador',
      'gestor': 'Gestor',
      'participante': 'Participante'
    };
    return labels[this.user?.role || ''] || 'Usuario';
  }
}
