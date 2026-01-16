import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { Subscription, interval } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';
import { AdminService, BadgeCounts } from '@core/services/admin.service';
import { User } from '@core/models/user.model';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  roles: string[];
  badgeKey?: keyof BadgeCounts;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = true;

  user: User | null = null;
  badgeCounts: BadgeCounts = {
    pending_approved: 0,
    pending_notifications: 0
  };

  private badgeSubscription?: Subscription;

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
      roles: ['admin', 'gestor'],
      badgeKey: 'pending_approved'
    },
    {
      icon: 'notifications',
      label: 'Notificaciones',
      route: '/management/notifications',
      roles: ['admin', 'gestor'],
      badgeKey: 'pending_notifications'
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

  constructor(
    private authService: AuthService,
    private adminService: AdminService
  ) {
    this.user = this.authService.getUserData();
  }

  ngOnInit(): void {
    // Solo cargar badges si el usuario es admin o gestor
    if (this.user?.role === 'admin' || this.user?.role === 'gestor') {
      this.loadBadgeCounts();
    }
  }

  ngOnDestroy(): void {
    this.badgeSubscription?.unsubscribe();
  }

  private loadBadgeCounts(): void {
    // Cargar badges inmediatamente y luego cada 60 segundos
    this.badgeSubscription = interval(60000)
      .pipe(
        startWith(0),
        switchMap(() => this.adminService.getBadgeCounts())
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.badgeCounts = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading badge counts:', error);
        }
      });
  }

  get visibleMenuItems(): MenuItem[] {
    const userRole = this.user?.role || '';
    return this.menuItems.filter(item => item.roles.includes(userRole));
  }

  getBadgeValue(item: MenuItem): number | null {
    if (!item.badgeKey) return null;
    const count = this.badgeCounts[item.badgeKey];
    return count > 0 ? count : null;
  }
}
