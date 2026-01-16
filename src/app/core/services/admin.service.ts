import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}
