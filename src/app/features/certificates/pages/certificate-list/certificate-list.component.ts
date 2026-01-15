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
  styleUrls: ['./certificate-list.component.scss']
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
    console.log('📋 [CertificateList] Componente inicializado');
    this.user = this.authService.getUserData();
    console.log('👤 [CertificateList] Usuario:', this.user);

    if (this.user) {
      this.loadCertificates();
    } else {
      console.error('❌ [CertificateList] No hay usuario autenticado');
    }
  }

  loadCertificates(): void {
    if (!this.user) return;

    this.loading = true;
    this.error = null;

    console.log('🔄 [CertificateList] Cargando certificados para usuario:', this.user.userid);

    this.certificateService.getUserCertificates(this.user.userid).subscribe({
      next: (response) => {
        console.log('📥 [CertificateList] Respuesta del backend:', response);
        if (response.success && response.data) {
          this.certificates = response.data.certificates || [];
          this.filteredCertificates = this.certificates;
          console.log('✅ [CertificateList] Certificados cargados:', this.certificates.length);
        } else {
          this.error = response.error || 'Error al cargar certificados';
          console.error('❌ [CertificateList] Error:', this.error);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ [CertificateList] Error HTTP:', error);
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
      cert.course_name.toLowerCase().includes(term) ||
      cert.course_shortname.toLowerCase().includes(term) ||
      cert.numero_certificado.toLowerCase().includes(term)
    );
  }

  downloadCertificate(certificate: Certificate): void {
    const fileName = `certificado_${certificate.numero_certificado}.pdf`;
    this.certificateService.triggerPdfDownload(certificate.id, fileName);
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
