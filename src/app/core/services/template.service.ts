import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  TemplatesResponse,
  TemplateUploadResponse,
  SaveFieldsResponse,
  AvailableFieldsResponse,
  TemplateFields
} from '../models/template.model';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las plantillas (base y de cursos) con sus campos configurados
   */
  getTemplates(): Observable<TemplatesResponse> {
    return this.http.get<TemplatesResponse>(`${this.apiUrl}/admin/templates`);
  }

  /**
   * Obtiene los campos disponibles por tipo de plantilla
   */
  getAvailableFields(): Observable<AvailableFieldsResponse> {
    return this.http.get<AvailableFieldsResponse>(`${this.apiUrl}/admin/templates/available-fields`);
  }

  /**
   * Sube o actualiza la plantilla base (página 1)
   * @param file Archivo PDF
   * @param nombre Nombre descriptivo opcional
   */
  uploadBaseTemplate(file: File, nombre?: string): Observable<TemplateUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (nombre) {
      formData.append('nombre', nombre);
    }

    return this.http.post<TemplateUploadResponse>(
      `${this.apiUrl}/admin/templates/base`,
      formData
    );
  }

  /**
   * Sube o actualiza la plantilla de contenidos de un curso (página 2)
   * @param courseid ID del curso
   * @param file Archivo PDF
   * @param nombre Nombre descriptivo opcional
   */
  uploadCourseTemplate(courseid: number, file: File, nombre?: string): Observable<TemplateUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (nombre) {
      formData.append('nombre', nombre);
    }

    return this.http.post<TemplateUploadResponse>(
      `${this.apiUrl}/admin/templates/course/${courseid}`,
      formData
    );
  }

  /**
   * Elimina la plantilla de contenidos de un curso
   * @param courseid ID del curso
   */
  deleteCourseTemplate(courseid: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/admin/templates/course/${courseid}`
    );
  }

  /**
   * Descarga el archivo PDF de una plantilla
   * @param templateId ID de la plantilla
   */
  downloadTemplate(templateId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/admin/templates/${templateId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Obtiene la URL de la imagen PNG de preview de una plantilla
   * @param templateId ID de la plantilla
   */
  getPreviewImageUrl(templateId: number): string {
    return `${this.apiUrl}/admin/templates/${templateId}/preview-image`;
  }

  /**
   * Descarga la imagen PNG de preview de una plantilla como Blob
   * @param templateId ID de la plantilla
   */
  getPreviewImage(templateId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/admin/templates/${templateId}/preview-image`, {
      responseType: 'blob'
    });
  }

  /**
   * Guarda las coordenadas de los campos de una plantilla
   * @param templateId ID de la plantilla
   * @param campos Configuración de campos
   */
  saveTemplateFields(templateId: number, campos: TemplateFields): Observable<SaveFieldsResponse> {
    return this.http.put<SaveFieldsResponse>(
      `${this.apiUrl}/admin/templates/${templateId}/fields`,
      { campos }
    );
  }

  /**
   * Genera un PDF de preview con datos de ejemplo
   * @param courseid ID del curso
   */
  generatePreview(courseid: number): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/admin/templates/preview`, { courseid }, {
      responseType: 'blob'
    });
  }

  /**
   * Descarga un archivo Blob como archivo
   * @param blob Blob del archivo
   * @param filename Nombre del archivo
   */
  triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Abre un PDF en una nueva pestaña
   * @param blob Blob del PDF
   */
  openPdfInNewTab(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}
