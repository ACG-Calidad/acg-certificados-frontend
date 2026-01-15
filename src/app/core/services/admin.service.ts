import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { DashboardResponse } from '@core/models/dashboard.model';

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
  getPendingCertificates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/certificates/pending`);
  }

  /**
   * Genera certificados para usuarios seleccionados
   * @param userIds Array de IDs de usuarios
   * @param courseId ID del curso
   * @returns Observable con resultado de la operación
   */
  generateCertificates(userIds: number[], courseId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/certificates/generate`, {
      user_ids: userIds,
      course_id: courseId
    });
  }

  /**
   * Envía notificaciones a usuarios
   * @param certificateIds Array de IDs de certificados
   * @returns Observable con resultado de la operación
   */
  sendNotifications(certificateIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/notifications/send`, {
      certificate_ids: certificateIds
    });
  }
}
