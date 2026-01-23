import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { SystemSettings, SettingsResponse, UpdateSettingsResponse } from '@core/models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la configuración actual del sistema
   * @returns Observable con la configuración
   */
  getSettings(): Observable<SettingsResponse> {
    return this.http.get<SettingsResponse>(`${this.apiUrl}/admin/settings`);
  }

  /**
   * Actualiza la configuración del sistema
   * @param settings Configuración a actualizar (parcial o completa)
   * @returns Observable con la configuración actualizada
   */
  updateSettings(settings: Partial<SystemSettings>): Observable<UpdateSettingsResponse> {
    return this.http.put<UpdateSettingsResponse>(`${this.apiUrl}/admin/settings`, settings);
  }
}
