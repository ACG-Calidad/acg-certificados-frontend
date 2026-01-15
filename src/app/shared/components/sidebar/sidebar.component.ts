import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/user.model';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isOpen = true;

  user: User | null = null;

  menuItems: MenuItem[] = [
    {
      icon: 'dashboard',
      label: 'Dashboard',
      route: '/dashboard',
      roles: ['admin', 'gestor']
    },
    {
      icon: 'description',
      label: 'Mis Certificados',
      route: '/certificates',
      roles: ['participante', 'gestor', 'admin']
    },
    {
      icon: 'pending_actions',
      label: 'Pendientes',
      route: '/management/pending',
      roles: ['admin', 'gestor']
    },
    {
      icon: 'add_circle',
      label: 'Generar Certificados',
      route: '/management/generate',
      roles: ['admin', 'gestor']
    },
    {
      icon: 'notifications',
      label: 'Notificaciones',
      route: '/management/notifications',
      roles: ['admin', 'gestor']
    },
    {
      icon: 'assessment',
      label: 'Reportes',
      route: '/admin/reports',
      roles: ['admin']
    },
    {
      icon: 'article',
      label: 'Plantillas',
      route: '/admin/templates',
      roles: ['admin']
    },
    {
      icon: 'settings',
      label: 'Configuración',
      route: '/admin/settings',
      roles: ['admin']
    }
  ];

  constructor(private authService: AuthService) {
    this.user = this.authService.getUserData();
  }

  get visibleMenuItems(): MenuItem[] {
    const userRole = this.user?.role || '';
    return this.menuItems.filter(item => item.roles.includes(userRole));
  }
}
