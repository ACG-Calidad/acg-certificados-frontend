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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AdminService, GeneratedCertificate } from '@core/services/admin.service';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-generated-certificates',
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
    MatSnackBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './generated-certificates.component.html',
  styleUrls: ['./generated-certificates.component.scss']
})
export class GeneratedCertificatesComponent implements OnInit {
  loading = false;
  actionLoading = false;
  error: string | null = null;

  certificates: GeneratedCertificate[] = [];

  // Filters
  searchTerm = '';

  // Sorting
  sortField = 'fecha_emision';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Pagination
  totalCertificates = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions = [10, 25, 50, 100];

  // Selection
  selection = new SelectionModel<GeneratedCertificate>(true, [], true,
    (c1, c2) => c1.id === c2.id
  );

  // Table columns
  displayedColumns = [
    'select',
    'numero_certificado',
    'participante',
    'idnumber',
    'course_shortname',
    'fecha_emision',
    'estado',
    'actions'
  ];

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.loading = true;
    this.error = null;
    this.selection.clear();

    this.adminService.getGeneratedCertificates(
      this.searchTerm,
      this.sortField,
      this.sortOrder,
      this.pageIndex + 1,
      this.pageSize
    ).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.certificates = response.data.certificates as GeneratedCertificate[];
          this.totalCertificates = response.data.pagination.total;
        } else {
          this.error = response.message || 'Error al cargar certificados';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando certificados:', error);
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    this.pageIndex = 0;
    this.loadCertificates();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.active || 'fecha_emision';
    this.sortOrder = (sort.direction || 'desc') as 'asc' | 'desc';
    this.pageIndex = 0;
    this.loadCertificates();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCertificates();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.pageIndex = 0;
    this.loadCertificates();
  }

  // Selection helpers
  isAllSelected(): boolean {
    return this.certificates.length > 0 &&
           this.selection.selected.length === this.certificates.length;
  }

  isIndeterminate(): boolean {
    return this.selection.selected.length > 0 &&
           this.selection.selected.length < this.certificates.length;
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.certificates.forEach(cert => this.selection.select(cert));
    }
  }

  // Download single certificate
  downloadCertificate(cert: GeneratedCertificate): void {
    this.adminService.downloadCertificate(cert.id);
  }

  // Regenerate single certificate
  regenerateCertificate(cert: GeneratedCertificate): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Regenerar certificado',
        message: `¿Está seguro de regenerar el certificado ${cert.numero_certificado}? Esto actualizará la fecha de emisión a hoy.`,
        confirmText: 'Regenerar',
        cancelText: 'Cancelar',
        confirmColor: 'primary'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.doRegenerate([cert.id]);
      }
    });
  }

  // Download selected certificates as ZIP
  downloadSelected(): void {
    if (this.selection.selected.length === 0) {
      this.snackBar.open('Seleccione al menos un certificado', 'Cerrar', { duration: 3000 });
      return;
    }

    this.actionLoading = true;
    const ids = this.selection.selected.map(c => c.id);

    this.adminService.downloadCertificatesZip(ids).subscribe({
      next: (blob) => {
        // Crear enlace de descarga
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificados_${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.snackBar.open(
          `${ids.length} certificado(s) descargado(s)`,
          'Cerrar',
          { duration: 3000 }
        );
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error descargando ZIP:', error);
        this.snackBar.open('Error al descargar certificados', 'Cerrar', { duration: 3000 });
        this.actionLoading = false;
      }
    });
  }

  // Regenerate selected certificates
  regenerateSelected(): void {
    if (this.selection.selected.length === 0) {
      this.snackBar.open('Seleccione al menos un certificado', 'Cerrar', { duration: 3000 });
      return;
    }

    const count = this.selection.selected.length;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Regenerar certificados',
        message: `¿Está seguro de regenerar ${count} certificado(s)? Esto actualizará la fecha de emisión a hoy para todos.`,
        confirmText: 'Regenerar todos',
        cancelText: 'Cancelar',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        const ids = this.selection.selected.map(c => c.id);
        this.doRegenerate(ids);
      }
    });
  }

  private doRegenerate(ids: number[]): void {
    this.actionLoading = true;

    this.adminService.regenerateCertificates(ids).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const regenerated = response.data.regenerated || 0;
          const failed = response.data.failed || 0;
          const details = response.data.details || [];

          if (failed === 0) {
            this.snackBar.open(
              `${regenerated} certificado(s) regenerado(s) correctamente`,
              'Cerrar',
              { duration: 3000 }
            );
          } else {
            this.snackBar.open(
              `${regenerated} regenerado(s), ${failed} error(es)`,
              'Cerrar',
              { duration: 5000 }
            );
            if (details && details.length > 0) {
              const errors = details.filter(d => !d.success);
              console.error('Errores regenerando:', errors);
            }
          }

          this.selection.clear();
          this.loadCertificates();
        } else {
          this.snackBar.open(
            response.message || 'Error al regenerar certificados',
            'Cerrar',
            { duration: 3000 }
          );
        }
        this.actionLoading = false;
      },
      error: (error) => {
        console.error('Error regenerando certificados:', error);
        this.snackBar.open('Error al conectar con el servidor', 'Cerrar', { duration: 3000 });
        this.actionLoading = false;
      }
    });
  }

  getEstadoClass(estado: string): string {
    return estado === 'notificado' ? 'estado-notificado' : 'estado-generado';
  }

  getEstadoLabel(estado: string): string {
    return estado === 'notificado' ? 'Notificado' : 'Pendiente';
  }
}
