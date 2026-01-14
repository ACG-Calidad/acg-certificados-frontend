import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CertificateService } from '@core/services/certificate.service';
import { Certificate } from '@core/models/certificate.model';

@Component({
  selector: 'app-certificate-validation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './certificate-validation.component.html',
  styleUrls: ['./certificate-validation.component.scss']
})
export class CertificateValidationComponent {
  verificationCode = '';
  loading = false;
  validated = false;
  isValid = false;
  certificate: Certificate | null = null;
  errorMessage = '';

  constructor(private certificateService: CertificateService) {}

  validateCertificate(): void {
    if (!this.verificationCode.trim()) {
      return;
    }

    this.loading = true;
    this.validated = false;
    this.errorMessage = '';

    this.certificateService.validateCertificate(this.verificationCode.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        this.validated = true;
        this.isValid = response.valid;
        this.certificate = response.certificate || null;
        this.errorMessage = response.error || '';
      },
      error: (error) => {
        this.loading = false;
        this.validated = true;
        this.isValid = false;
        this.errorMessage = error.message || 'Error al validar el certificado';
      }
    });
  }

  reset(): void {
    this.verificationCode = '';
    this.validated = false;
    this.isValid = false;
    this.certificate = null;
    this.errorMessage = '';
  }
}
