import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { DashboardResponse } from '@core/models/dashboard.model';
import { PendingUsersResponse, ApproveUsersResponse } from '@core/models/pending-user.model';
import { PendingNotificationsResponse, SendNotificationsResponse } from '@core/models/notification.model';

export interface BadgeCounts {
  pending_approved: number;
  pending_notifications: number;
}

export interface BadgeCountsResponse {
  success: boolean;
  data?: BadgeCounts;
  error?: string;
}

export interface GeneratedCertificate {
  id: number;
  numero_certificado: string;
  userid: number;
  nombre: string;
  apellido: string;
  documento: string;
  course_id: number;
  course_shortname: string;
  course_name: string;
  fecha_emision: string;
  fecha_emision_formatted: string;
  estado: 'generado' | 'notificado';
  pdf_path: string | null;
}

export interface GeneratedCertificatesResponse {
  success: boolean;
  message?: string;
  data: {
    certificates: GeneratedCertificate[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
}

export interface RegenerateCertificatesResponse {
  success: boolean;
  message?: string;
  data?: {
    regenerated: number;
    failed: number;
    details: Array<{
      id: number;
      numero_certificado: string;
      success: boolean;
      error?: string;
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene las estadísticas del dashboard
   * @returns Observable con datos del dashboard
   */
  getDashboardStats(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/admin/dashboard`);
  }

  /**
   * Obtiene certificados pendientes de generar
   * @returns Observable con lista de usuarios pendientes
   */
  getPendingCertificates(): Observable<PendingUsersResponse> {
    return this.http.get<PendingUsersResponse>(`${this.apiUrl}/admin/certificates/pending`);
  }

  /**
   * Aprueba usuarios y genera sus certificados
   * @param users Array de usuarios con userid y course_id
   * @returns Observable con resultado de la operación
   */
  approveAndGenerateCertificates(users: { userid: number; course_id: number }[]): Observable<ApproveUsersResponse> {
    return this.http.post<ApproveUsersResponse>(`${this.apiUrl}/admin/certificates/approve`, { users });
  }

  /**
   * Genera certificados para usuarios seleccionados
   * @param userIds Array de IDs de usuarios
   * @param courseId ID del curso
   * @returns Observable con resultado de la operación
   */
  generateCertificates(userIds: number[], courseId: number): Observable<ApproveUsersResponse> {
    return this.http.post<ApproveUsersResponse>(`${this.apiUrl}/admin/certificates/generate`, {
      user_ids: userIds,
      course_id: courseId
    });
  }

  /**
   * Obtiene certificados generados pendientes de notificar
   * @returns Observable con lista de certificados pendientes de notificación
   */
  getPendingNotifications(): Observable<PendingNotificationsResponse> {
    return this.http.get<PendingNotificationsResponse>(`${this.apiUrl}/admin/notifications/pending`);
  }

  /**
   * Envía notificaciones a usuarios
   * @param certificateIds Array de IDs de certificados
   * @returns Observable con resultado de la operación
   */
  sendNotifications(certificateIds: number[]): Observable<SendNotificationsResponse> {
    return this.http.post<SendNotificationsResponse>(`${this.apiUrl}/admin/notifications/send`, {
      certificate_ids: certificateIds
    });
  }

  /**
   * Obtiene conteos para badges del sidebar
   * @returns Observable con conteos de pendientes y notificaciones
   */
  getBadgeCounts(): Observable<BadgeCountsResponse> {
    return this.http.get<BadgeCountsResponse>(`${this.apiUrl}/admin/badges`);
  }

  /**
   * Descarga el reporte de certificados en formato Excel
   * @returns Observable con el blob del archivo Excel
   */
  downloadCertificatesReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/admin/report/export`, {
      responseType: 'blob'
    });
  }

  /**
   * Obtiene la lista de certificados generados con paginación y filtros
   * @param search Término de búsqueda (nombre, documento, curso)
   * @param sortField Campo para ordenar
   * @param sortOrder Dirección del orden (asc/desc)
   * @param page Número de página
   * @param limit Registros por página
   * @returns Observable con certificados y paginación
   */
  getGeneratedCertificates(
    search: string = '',
    sortField: string = 'id',
    sortOrder: string = 'desc',
    page: number = 1,
    limit: number = 25
  ): Observable<GeneratedCertificatesResponse> {
    let params = new HttpParams()
      .set('sort', sortField)
      .set('order', sortOrder)
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<GeneratedCertificatesResponse>(
      `${this.apiUrl}/admin/certificates/generated`,
      { params }
    );
  }

  /**
   * Regenera certificados (actualiza fecha y genera nuevo PDF)
   * @param certificateIds IDs de certificados a regenerar
   * @returns Observable con resultado de la operación
   */
  regenerateCertificates(certificateIds: number[]): Observable<RegenerateCertificatesResponse> {
    return this.http.post<RegenerateCertificatesResponse>(
      `${this.apiUrl}/admin/certificates/regenerate`,
      { certificate_ids: certificateIds }
    );
  }

  /**
   * Descarga múltiples certificados como ZIP
   * @param certificateIds IDs de certificados a descargar
   * @returns Observable con el blob del archivo ZIP
   */
  downloadCertificatesZip(certificateIds: number[]): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/admin/certificates/download-zip`,
      { certificate_ids: certificateIds },
      { responseType: 'blob' }
    );
  }

  /**
   * Descarga un certificado individual
   * @param certificateId ID del certificado
   */
  downloadCertificate(certificateId: number): void {
    const url = `${this.apiUrl}/certificates/${certificateId}/download`;
    window.open(url, '_blank');
  }
}
