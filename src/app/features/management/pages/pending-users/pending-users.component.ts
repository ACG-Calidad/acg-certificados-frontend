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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AdminService } from '@core/services/admin.service';
import { PendingUser, PendingUsersResponse, ApproveUsersResponse } from '@core/models/pending-user.model';
import { ApproveDialogComponent } from './approve-dialog/approve-dialog.component';

interface CourseOption {
  id: number;
  name: string;
}

@Component({
  selector: 'app-pending-users',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './pending-users.component.html',
  styleUrls: ['./pending-users.component.scss']
})
export class PendingUsersComponent implements OnInit {
  loading = false;
  error: string | null = null;

  pendingUsers: PendingUser[] = [];
  filteredUsers: PendingUser[] = [];
  courses: CourseOption[] = [];

  // Filters
  searchTerm = '';
  selectedCourse: number | null = null;
  dateFrom: Date | null = null;
  dateTo: Date | null = null;

  // Selection with custom comparison function
  selection = new SelectionModel<PendingUser>(true, [], true,
    (u1, u2) => u1.userid === u2.userid && u1.course_id === u2.course_id
  );

  // Table columns
  displayedColumns = ['select', 'user', 'document', 'course', 'grade', 'grade_date'];

  // Filter for minimum grade (80% default)
  minGradeFilter: number | null = null;

  constructor(
    private adminService: AdminService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPendingUsers();
  }

  loadPendingUsers(): void {
    this.loading = true;
    this.error = null;
    this.selection.clear();

    this.adminService.getPendingCertificates().subscribe({
      next: (response: PendingUsersResponse) => {
        if (response.success && response.data) {
          this.pendingUsers = response.data.pending_users;
          this.extractCourses();
          this.applyFilters();
        } else {
          this.error = response.error || 'Error al cargar usuarios pendientes';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios pendientes:', error);
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
        // Load mock data for development
        this.loadMockData();
      }
    });
  }

  private loadMockData(): void {
    this.pendingUsers = [
      {
        userid: 1,
        firstname: 'Carlos',
        lastname: 'Ramírez Gómez',
        email: 'carlos.ramirez@example.com',
        idnumber: '1001234567',
        course_id: 1,
        course_name: 'ISO 9001:2015 Fundamentos y Requisitos',
        course_shortname: 'ISO9001',
        grade: 92.5,
        grade_date: Math.floor(Date.now() / 1000) - 86400 * 1,
        grade_date_formatted: ''
      },
      {
        userid: 2,
        firstname: 'María',
        lastname: 'González Silva',
        email: 'maria.gonzalez@example.com',
        idnumber: '1007654321',
        course_id: 1,
        course_name: 'ISO 9001:2015 Fundamentos y Requisitos',
        course_shortname: 'ISO9001',
        grade: 88.0,
        grade_date: Math.floor(Date.now() / 1000) - 86400 * 2,
        grade_date_formatted: ''
      },
      {
        userid: 3,
        firstname: 'Juan',
        lastname: 'Pérez Martínez',
        email: 'juan.perez@example.com',
        idnumber: '1009876543',
        course_id: 2,
        course_name: 'Auditor Interno ISO 9001:2015',
        course_shortname: 'AUDIT9001',
        grade: 95.75,
        grade_date: Math.floor(Date.now() / 1000) - 86400 * 3,
        grade_date_formatted: ''
      },
      {
        userid: 4,
        firstname: 'Laura',
        lastname: 'Hernández Díaz',
        email: 'laura.hernandez@example.com',
        idnumber: '1002345678',
        course_id: 2,
        course_name: 'Auditor Interno ISO 9001:2015',
        course_shortname: 'AUDIT9001',
        grade: 78.5,  // < 80%
        grade_date: Math.floor(Date.now() / 1000) - 86400 * 6,
        grade_date_formatted: ''
      },
      {
        userid: 5,
        firstname: 'Ricardo',
        lastname: 'Mendoza Parra',
        email: 'ricardo.mendoza@example.com',
        idnumber: '1005551234',
        course_id: 3,
        course_name: 'Gestión de Riesgos ISO 31000',
        course_shortname: 'RISK',
        grade: 65.0,  // < 80%
        grade_date: Math.floor(Date.now() / 1000) - 86400 * 1,
        grade_date_formatted: ''
      },
      {
        userid: 6,
        firstname: 'Sofía',
        lastname: 'Vargas Ruiz',
        email: 'sofia.vargas@example.com',
        idnumber: '1006789012',
        course_id: 3,
        course_name: 'Gestión de Riesgos ISO 31000',
        course_shortname: 'RISK',
        grade: 97.0,
        grade_date: Math.floor(Date.now() / 1000) - 86400 * 8,
        grade_date_formatted: ''
      }
    ];

    this.extractCourses();
    this.applyFilters();
    this.loading = false;
    this.error = null;
  }

  private extractCourses(): void {
    const courseMap = new Map<number, string>();
    this.pendingUsers.forEach(user => {
      if (!courseMap.has(user.course_id)) {
        courseMap.set(user.course_id, user.course_name);
      }
    });
    this.courses = Array.from(courseMap.entries()).map(([id, name]) => ({ id, name }));
  }

  applyFilters(): void {
    let result = [...this.pendingUsers];

    // Search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(user =>
        user.firstname.toLowerCase().includes(term) ||
        user.lastname.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.idnumber && user.idnumber.toLowerCase().includes(term))
      );
    }

    // Course filter
    if (this.selectedCourse !== null) {
      result = result.filter(user => user.course_id === this.selectedCourse);
    }

    // Minimum grade filter
    if (this.minGradeFilter !== null) {
      result = result.filter(user => user.grade !== null && user.grade >= this.minGradeFilter!);
    }

    // Date filters (using grade_date)
    if (this.dateFrom) {
      const fromTimestamp = this.dateFrom.getTime() / 1000;
      result = result.filter(user => user.grade_date >= fromTimestamp);
    }

    if (this.dateTo) {
      const toTimestamp = (this.dateTo.getTime() / 1000) + 86400; // Include the whole day
      result = result.filter(user => user.grade_date <= toTimestamp);
    }

    this.filteredUsers = result;

    // Clear selection of users that are no longer visible
    const visibleIds = new Set(this.filteredUsers.map(u => `${u.userid}-${u.course_id}`));
    this.selection.selected.forEach(user => {
      if (!visibleIds.has(`${user.userid}-${user.course_id}`)) {
        this.selection.deselect(user);
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCourse = null;
    this.minGradeFilter = null;
    this.dateFrom = null;
    this.dateTo = null;
    this.applyFilters();
  }

  // Quick filter for approved users (>= 80%)
  filterApproved(): void {
    this.minGradeFilter = 80;
    this.applyFilters();
  }

  // Selection helpers
  isAllSelected(): boolean {
    return this.filteredUsers.length > 0 &&
           this.selection.selected.length === this.filteredUsers.length;
  }

  isSomeSelected(): boolean {
    return this.selection.selected.length > 0 &&
           this.selection.selected.length < this.filteredUsers.length;
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.filteredUsers.forEach(user => this.selection.select(user));
    }
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  openApproveDialog(): void {
    const selectedUsers = this.selection.selected;

    const dialogRef = this.dialog.open(ApproveDialogComponent, {
      width: '500px',
      data: { users: selectedUsers }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.approveSelectedUsers();
      }
    });
  }

  private approveSelectedUsers(): void {
    const usersToApprove = this.selection.selected.map(user => ({
      userid: user.userid,
      course_id: user.course_id
    }));

    this.loading = true;

    this.adminService.approveAndGenerateCertificates(usersToApprove).subscribe({
      next: (response: ApproveUsersResponse) => {
        if (response.success) {
          // Remove approved users from the list
          const approvedIds = new Set(usersToApprove.map(u => `${u.userid}-${u.course_id}`));
          this.pendingUsers = this.pendingUsers.filter(
            user => !approvedIds.has(`${user.userid}-${user.course_id}`)
          );
          this.selection.clear();
          this.extractCourses();
          this.applyFilters();
        } else {
          this.error = response.error || 'Error al aprobar usuarios';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error aprobando usuarios:', error);
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }
}
