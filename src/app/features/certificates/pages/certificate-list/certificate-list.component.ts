import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@core/services/auth.service';
import { CertificateService } from '@core/services/certificate.service';
import { Certificate } from '@core/models/certificate.model';
import { User } from '@core/models/user.model';

@Component({
  selector: 'app-certificate-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './certificate-list.component.html',
  styleUrl: './certificate-list.component.scss'
})
export class CertificateListComponent implements OnInit {
  user: User | null = null;
  certificates: Certificate[] = [];
  filteredCertificates: Certificate[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private authService: AuthService,
    private certificateService: CertificateService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUserData();
    if (this.user) {
      this.loadCertificates();
    }
  }

  loadCertificates(): void {
    if (!this.user) return;

    this.loading = true;
    this.error = null;

    this.certificateService.getUserCertificates(this.user.userid).subscribe({
      next: (response) => {
        if (response.success) {
          this.certificates = response.data;
          this.filteredCertificates = response.data;
        } else {
          this.error = response.error || 'Error al cargar certificados';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message || 'Error al cargar certificados';
        this.loading = false;
      }
    });
  }

  filterCertificates(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCertificates = this.certificates;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCertificates = this.certificates.filter(cert =>
      cert.nombre.toLowerCase().includes(term) ||
      cert.curso.toLowerCase().includes(term) ||
      cert.codigo_verificacion.toLowerCase().includes(term)
    );
  }

  downloadCertificate(certificate: Certificate): void {
    const fileName = `${certificate.nombre.replace(/\s+/g, '_')}.pdf`;
    this.certificateService.triggerPdfDownload(certificate.id, fileName);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'approved': 'Aprobado',
      'rejected': 'Rechazado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  logout(): void {
    this.authService.logout();
    window.location.href = this.user?.role === 'admin'
      ? 'http://localhost:8082/admin'
      : 'http://localhost:8082';
  }
}
