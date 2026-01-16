import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';

import { AdminService } from '@core/services/admin.service';
import { StatsCardComponent } from '@shared/components/stats-card/stats-card.component';
import {
  DashboardStats,
  MonthlyData,
  TopCourse,
  RecentActivity
} from '@core/models/dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    StatsCardComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  error: string | null = null;
  downloadingReport = false;

  stats: DashboardStats = {
    total_certificates: 0,
    pending_certificates: 0,
    this_month_certificates: 0,
    pending_notifications: 0
  };

  monthlyData: MonthlyData[] = [];
  topCourses: TopCourse[] = [];
  recentActivity: RecentActivity[] = [];

  displayedColumns = ['course_name', 'certificate_count'];

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.stats = response.data.stats;
          this.monthlyData = response.data.monthly_data;
          this.topCourses = response.data.top_courses;
          this.recentActivity = response.data.recent_activity;
        } else {
          this.error = response.error || 'Error al cargar datos del dashboard';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando dashboard:', error);
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
        // Cargar datos de ejemplo para desarrollo
        this.loadMockData();
      }
    });
  }

  private loadMockData(): void {
    this.stats = {
      total_certificates: 2510,
      pending_certificates: 25,
      this_month_certificates: 45,
      pending_notifications: 3
    };

    this.monthlyData = [
      { month: 'Ago', count: 180 },
      { month: 'Sep', count: 220 },
      { month: 'Oct', count: 195 },
      { month: 'Nov', count: 240 },
      { month: 'Dic', count: 185 },
      { month: 'Ene', count: 45 }
    ];

    this.topCourses = [
      { course_id: 1, course_name: 'ISO 9001:2015 Fundamentos', course_shortname: 'ISO9001', certificate_count: 450 },
      { course_id: 2, course_name: 'Auditor Interno ISO 9001', course_shortname: 'AUDIT9001', certificate_count: 320 },
      { course_id: 3, course_name: 'Gestión de Riesgos', course_shortname: 'RISK', certificate_count: 280 },
      { course_id: 4, course_name: 'ISO 14001:2015 Ambiental', course_shortname: 'ISO14001', certificate_count: 195 },
      { course_id: 5, course_name: 'ISO 45001 Seguridad', course_shortname: 'ISO45001', certificate_count: 165 }
    ];

    this.recentActivity = [
      { id: 1, action: 'certificate_generated', description: 'Certificado generado para Juan Pérez - ISO 9001', timestamp: '2025-01-14T10:30:00', user_name: 'Admin' },
      { id: 2, action: 'notification_sent', description: '15 notificaciones enviadas', timestamp: '2025-01-14T09:15:00', user_name: 'Sistema' },
      { id: 3, action: 'certificate_downloaded', description: 'María García descargó su certificado', timestamp: '2025-01-14T08:45:00' },
      { id: 4, action: 'certificate_validated', description: 'Certificado ABC123 validado desde IP externa', timestamp: '2025-01-13T16:20:00' }
    ];

    this.loading = false;
    this.error = null;
  }

  getActivityIcon(action: string): string {
    const icons: Record<string, string> = {
      'certificate_generated': 'add_circle',
      'notification_sent': 'email',
      'certificate_downloaded': 'download',
      'certificate_validated': 'verified'
    };
    return icons[action] || 'info';
  }

  getActivityColor(action: string): string {
    const colors: Record<string, string> = {
      'certificate_generated': 'primary',
      'notification_sent': 'accent',
      'certificate_downloaded': 'primary',
      'certificate_validated': 'primary'
    };
    return colors[action] || '';
  }

  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMaxMonthlyCount(): number {
    return Math.max(...this.monthlyData.map(d => d.count), 1);
  }

  getBarHeight(count: number): number {
    return (count / this.getMaxMonthlyCount()) * 100;
  }

  downloadReport(): void {
    this.downloadingReport = true;
    this.adminService.downloadCertificatesReport().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const today = new Date().toISOString().split('T')[0];
        link.download = `reporte-certificados-${today}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloadingReport = false;
      },
      error: (error) => {
        console.error('Error descargando reporte:', error);
        this.downloadingReport = false;
      }
    });
  }
}
