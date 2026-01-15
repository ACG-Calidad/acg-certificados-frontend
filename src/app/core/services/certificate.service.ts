import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Certificate, CertificateListResponse, CertificateValidationResponse } from '@core/models/certificate.model';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de certificados de un usuario
   * @param userId ID del usuario en Moodle
   * @returns Observable con la lista de certificados
   */
  getUserCertificates(userId: number): Observable<CertificateListResponse> {
    return this.http.get<CertificateListResponse>(`${this.apiUrl}/certificates/user/${userId}`);
  }

  /**
   * Descarga el PDF de un certificado
   * @param certificateId ID del certificado
   * @returns Observable con el Blob del PDF
   */
  downloadPdf(certificateId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/certificates/${certificateId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Valida un certificado por su código de verificación (público)
   * @param verificationCode Código de verificación del certificado
   * @returns Observable con los datos del certificado si es válido
   */
  validateCertificate(verificationCode: string): Observable<CertificateValidationResponse> {
    return this.http.get<CertificateValidationResponse>(`${this.apiUrl}/certificates/validate/${verificationCode}`);
  }

  /**
   * Inicia la descarga de un PDF en el navegador
   * @param certificateId ID del certificado
   * @param fileName Nombre del archivo para la descarga
   */
  triggerPdfDownload(certificateId: number, fileName: string): void {
    this.downloadPdf(certificateId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error descargando PDF:', error);
        // TODO: Mostrar notificación de error al usuario
      }
    });
  }
}
