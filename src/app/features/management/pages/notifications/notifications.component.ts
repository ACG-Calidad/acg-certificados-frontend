import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AdminService } from '@core/services/admin.service';
import { PendingNotification } from '@core/models/notification.model';
import { SendNotificationDialogComponent } from './send-notification-dialog/send-notification-dialog.component';

interface CourseOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  loading = false;
  sending = false;
  error: string | null = null;

  pendingNotifications: PendingNotification[] = [];
  filteredNotifications: PendingNotification[] = [];
  courses: CourseOption[] = [];

  // Filters
  searchTerm = '';
  selectedCourse: number | null = null;

  // Selection with custom comparison function
  selection = new SelectionModel<PendingNotification>(true, [], true,
    (n1, n2) => n1.certificate_id === n2.certificate_id
  );

  // Table columns
  displayedColumns = ['select', 'certificate', 'user', 'email', 'course', 'grade', 'fecha_emision'];

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPendingNotifications();
  }

  loadPendingNotifications(): void {
    this.loading = true;
    this.error = null;
    this.selection.clear();

    this.adminService.getPendingNotifications().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.pendingNotifications = response.data.certificates;
          this.extractCourses();
          this.applyFilters();
        } else {
          this.error = response.error || 'Error al cargar notificaciones pendientes';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando notificaciones pendientes:', error);
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
        // Load mock data for development
        this.loadMockData();
      }
    });
  }

  private loadMockData(): void {
    this.pendingNotifications = [
      {
        certificate_id: 1,
        numero_certificado: 'CV-3490',
        userid: 1,
        firstname: 'Carlos',
        lastname: 'Ramírez Gómez',
        email: 'carlos.ramirez@example.com',
        course_id: 1,
        course_name: 'ISO 9001:2015 Fundamentos y Requisitos',
        course_shortname: 'ISO9001',
        grade: 92.5,
        fecha_emision: '2026-01-15',
        created_at: '2026-01-15 10:30:00'
      },
      {
        certificate_id: 2,
        numero_certificado: 'CV-3491',
        userid: 2,
        firstname: 'María',
        lastname: 'González Silva',
        email: 'maria.gonzalez@example.com',
        course_id: 1,
        course_name: 'ISO 9001:2015 Fundamentos y Requisitos',
        course_shortname: 'ISO9001',
        grade: 88.0,
        fecha_emision: '2026-01-15',
        created_at: '2026-01-15 10:30:00'
      },
      {
        certificate_id: 3,
        numero_certificado: 'CV-3492',
        userid: 3,
        firstname: 'Juan',
        lastname: 'Pérez Martínez',
        email: 'juan.perez@example.com',
        course_id: 2,
        course_name: 'Auditor Interno ISO 9001:2015',
        course_shortname: 'AUDIT9001',
        grade: 95.75,
        fecha_emision: '2026-01-14',
        created_at: '2026-01-14 15:45:00'
      },
      {
        certificate_id: 4,
        numero_certificado: 'CV-3493',
        userid: 6,
        firstname: 'Sofía',
        lastname: 'Vargas Ruiz',
        email: 'sofia.vargas@example.com',
        course_id: 3,
        course_name: 'Gestión de Riesgos ISO 31000',
        course_shortname: 'RISK',
        grade: 97.0,
        fecha_emision: '2026-01-13',
        created_at: '2026-01-13 09:15:00'
      }
    ];

    this.extractCourses();
    this.applyFilters();
    this.loading = false;
    this.error = null;
  }

  private extractCourses(): void {
    const courseMap = new Map<number, string>();
    this.pendingNotifications.forEach(notification => {
      if (!courseMap.has(notification.course_id)) {
        courseMap.set(notification.course_id, notification.course_name);
      }
    });
    this.courses = Array.from(courseMap.entries()).map(([id, name]) => ({ id, name }));
  }

  applyFilters(): void {
    let result = [...this.pendingNotifications];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(notification =>
        notification.firstname.toLowerCase().includes(term) ||
        notification.lastname.toLowerCase().includes(term) ||
        notification.email.toLowerCase().includes(term) ||
        notification.numero_certificado.toLowerCase().includes(term)
      );
    }

    // Course filter
    if (this.selectedCourse !== null) {
      result = result.filter(notification => notification.course_id === this.selectedCourse);
    }

    this.filteredNotifications = result;

    // Clear selection of notifications that are no longer visible
    const visibleIds = new Set(this.filteredNotifications.map(n => n.certificate_id));
    this.selection.selected.forEach(notification => {
      if (!visibleIds.has(notification.certificate_id)) {
        this.selection.deselect(notification);
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCourse = null;
    this.applyFilters();
  }

  // Selection helpers
  isAllSelected(): boolean {
    return this.filteredNotifications.length > 0 &&
           this.selection.selected.length === this.filteredNotifications.length;
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.filteredNotifications.forEach(notification => this.selection.select(notification));
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  openSendDialog(): void {
    const selectedNotifications = this.selection.selected;

    const dialogRef = this.dialog.open(SendNotificationDialogComponent, {
      width: '500px',
      data: { notifications: selectedNotifications }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.sendNotifications();
      }
    });
  }

  private sendNotifications(): void {
    const certificateIds = this.selection.selected.map(n => n.certificate_id);

    this.sending = true;

    this.adminService.sendNotifications(certificateIds).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const { sent, failed } = response.data;

          // Remove sent notifications from the list
          const sentIds = new Set(certificateIds);
          this.pendingNotifications = this.pendingNotifications.filter(
            n => !sentIds.has(n.certificate_id)
          );
          this.selection.clear();
          this.extractCourses();
          this.applyFilters();

          // Show success message
          if (failed === 0) {
            this.snackBar.open(
              `${sent} notificación(es) enviada(s) correctamente`,
              'Cerrar',
              { duration: 5000, panelClass: 'success-snackbar' }
            );
          } else {
            this.snackBar.open(
              `${sent} enviada(s), ${failed} fallida(s)`,
              'Cerrar',
              { duration: 5000, panelClass: 'warning-snackbar' }
            );
          }
        } else {
          this.error = response.error || 'Error al enviar notificaciones';
        }
        this.sending = false;
      },
      error: (error) => {
        console.error('Error enviando notificaciones:', error);
        this.error = 'Error al conectar con el servidor';
        this.sending = false;
      }
    });
  }

  selectAll(): void {
    this.filteredNotifications.forEach(notification => this.selection.select(notification));
  }
}
