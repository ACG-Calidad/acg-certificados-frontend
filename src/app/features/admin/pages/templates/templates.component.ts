import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';

import { TemplateService } from '../../../../core/services/template.service';
import {
  Template,
  AvailableFields,
  CourseWithoutTemplate,
  TemplateFields,
  UploadDialogData,
  VisualFieldEditorDialogData
} from '../../../../core/models/template.model';
import { TemplateCardComponent } from './components/template-card/template-card.component';
import { TemplateUploadDialogComponent, UploadDialogResult } from './components/template-upload-dialog/template-upload-dialog.component';
import { VisualFieldEditorDialogComponent } from './components/visual-field-editor-dialog/visual-field-editor-dialog.component';

@Component({
  selector: 'app-templates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    TemplateCardComponent
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>
          <mat-icon>article</mat-icon>
          Plantillas de Certificados
        </h1>
        <p class="subtitle">Gestiona las plantillas PDF para generar certificados</p>
      </div>

      @if (loading) {
        <div class="loading-container">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando plantillas...</p>
        </div>
      } @else if (error) {
        <mat-card class="error-card">
          <mat-card-content>
            <mat-icon>error</mat-icon>
            <p>{{ error }}</p>
            <button mat-flat-button color="primary" (click)="loadTemplates()">
              <mat-icon>refresh</mat-icon>
              Reintentar
            </button>
          </mat-card-content>
        </mat-card>
      } @else {
        <mat-tab-group animationDuration="200ms">
          <!-- Tab: Plantilla Base -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>description</mat-icon>
              <span>Plantilla Base</span>
            </ng-template>

            <div class="tab-content">
              <div class="section-header">
                <div class="header-left">
                  <h2>Plantilla Base (Página 1)</h2>
                  <p>Esta plantilla se usa para la primera página de todos los certificados</p>
                </div>
                @if (baseTemplate) {
                  <button mat-flat-button color="primary"
                          class="define-fields-btn"
                          (click)="onEditFields(baseTemplate)"
                          [disabled]="!baseTemplate.imagen_preview">
                    <mat-icon>tune</mat-icon>
                    Definir campos
                  </button>
                }
              </div>

              <app-template-card
                [template]="baseTemplate"
                type="base"
                [availableFields]="availableFieldsBase"
                [loading]="baseLoading"
                [canPreview]="canGeneratePreview"
                (upload)="onUploadBase()"
                (download)="onDownload(baseTemplate!)"
                (preview)="onPreview()">
              </app-template-card>
            </div>
          </mat-tab>

          <!-- Tab: Plantillas de Cursos -->
          <mat-tab>
            <ng-template mat-tab-label>
              <mat-icon>school</mat-icon>
              <span>Plantillas de Cursos</span>
              @if (courseTemplates.length > 0) {
                <span class="badge">{{ courseTemplates.length }}</span>
              }
            </ng-template>

            <div class="tab-content">
              <div class="section-header">
                <div class="header-left">
                  <h2>Plantillas de Cursos (Página 2)</h2>
                  <p>Cada curso puede tener una plantilla personalizada para la página de contenidos</p>
                </div>
                @if (courseTemplates.length > 0) {
                  <button mat-flat-button color="primary"
                          class="define-fields-btn"
                          (click)="onEditSecondPageFields()"
                          [disabled]="!baseTemplate">
                    <mat-icon>tune</mat-icon>
                    Definir campos (Segunda página)
                  </button>
                }
              </div>

              <!-- Selector para agregar plantilla a curso sin configurar -->
              @if (coursesWithoutTemplate.length > 0) {
                <mat-card class="add-course-card">
                  <mat-card-content>
                    <div class="add-course-form">
                      <mat-form-field appearance="outline">
                        <mat-label>Agregar plantilla a curso</mat-label>
                        <mat-select [(value)]="selectedCourseToAdd">
                          @for (course of coursesWithoutTemplate; track course.courseid) {
                            <mat-option [value]="course">
                              {{ course.course_name }} ({{ course.course_shortname }})
                            </mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                      <button mat-flat-button color="primary"
                              [disabled]="!selectedCourseToAdd"
                              (click)="onAddCourseTemplate()">
                        <mat-icon>add</mat-icon>
                        Subir Plantilla
                      </button>
                    </div>
                  </mat-card-content>
                </mat-card>
              }

              <!-- Lista de plantillas de cursos -->
              @if (courseTemplates.length > 0) {
                <div class="course-templates-grid">
                  @for (template of courseTemplates; track template.id) {
                    <app-template-card
                      [template]="template"
                      type="curso"
                      [courseid]="template.courseid!"
                      [courseName]="template.course_name"
                      [availableFields]="availableFieldsCurso"
                      [loading]="courseLoadingMap[template.courseid!]"
                      (upload)="onUploadCourse(template)"
                      (download)="onDownload(template)"
                      (delete)="onDeleteCourse(template)">
                    </app-template-card>
                  }
                </div>
              } @else {
                <mat-card class="empty-state">
                  <mat-card-content>
                    <mat-icon>folder_open</mat-icon>
                    <p>No hay plantillas de cursos configuradas</p>
                    @if (coursesWithoutTemplate.length > 0) {
                      <p class="hint">Selecciona un curso arriba para agregar una plantilla</p>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </mat-tab>

          <!-- Tab: Preview -->
          <mat-tab [disabled]="!canGeneratePreview">
            <ng-template mat-tab-label>
              <mat-icon>visibility</mat-icon>
              <span>Preview</span>
            </ng-template>

            <div class="tab-content">
              <div class="section-header">
                <h2>Generar Preview</h2>
                <p>Genera un certificado de ejemplo para verificar la configuración</p>
              </div>

              <mat-card class="preview-card">
                <mat-card-content>
                  @if (!canGeneratePreview) {
                    <div class="preview-disabled">
                      <mat-icon>warning</mat-icon>
                      <p>Para generar un preview necesitas:</p>
                      <ul>
                        <li [class.done]="baseTemplate">
                          <mat-icon>{{ baseTemplate ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                          Plantilla base subida
                        </li>
                        <li [class.done]="hasBaseTemplateFields">
                          <mat-icon>{{ hasBaseTemplateFields ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                          Campos de la plantilla base configurados
                        </li>
                      </ul>
                    </div>
                  } @else {
                    <div class="preview-form">
                      <mat-form-field appearance="outline">
                        <mat-label>Seleccionar curso para preview</mat-label>
                        <mat-select [(value)]="selectedCourseForPreview">
                          @for (template of courseTemplates; track template.id) {
                            <mat-option [value]="template.courseid">
                              {{ template.course_name }}
                            </mat-option>
                          }
                        </mat-select>
                        <mat-hint>Si no seleccionas un curso, solo se generará la página 1</mat-hint>
                      </mat-form-field>

                      <button mat-flat-button color="primary"
                              [disabled]="previewLoading"
                              (click)="onGeneratePreview()">
                        @if (previewLoading) {
                          <mat-spinner diameter="20"></mat-spinner>
                          Generando...
                        } @else {
                          <ng-container>
                            <mat-icon>visibility</mat-icon>
                            Generar Preview
                          </ng-container>
                        }
                      </button>
                    </div>

                    <div class="preview-info">
                      <mat-icon>info</mat-icon>
                      <p>
                        El preview se generará con datos de ejemplo para verificar que las coordenadas
                        de los campos son correctas.
                      </p>
                    </div>
                  }
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>
        </mat-tab-group>
      }
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }

    .page-header {
      margin-bottom: 24px;

      h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0 0 8px;
        color: #333;
        font-size: 28px;

        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
          color: #0066CC;
        }
      }

      .subtitle {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px;
      gap: 16px;

      p {
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .error-card {
      mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px;
        text-align: center;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: #d32f2f;
          margin-bottom: 16px;
        }

        p {
          color: rgba(0, 0, 0, 0.7);
          margin-bottom: 16px;
        }
      }
    }

    mat-tab-group {
      ::ng-deep .mat-mdc-tab-labels {
        background: #fafafa;
        border-radius: 8px 8px 0 0;
      }

      ::ng-deep .mat-mdc-tab {
        mat-icon {
          margin-right: 8px;
        }

        .badge {
          background: #0066CC;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          margin-left: 8px;
        }
      }
    }

    .tab-content {
      padding: 24px 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 16px;

      .header-left {
        flex: 1;

        h2 {
          margin: 0 0 4px;
          font-size: 20px;
          color: #333;
        }

        p {
          margin: 0;
          color: rgba(0, 0, 0, 0.6);
          font-size: 14px;
        }
      }

      .define-fields-btn {
        flex-shrink: 0;

        mat-icon {
          margin-right: 4px;
        }
      }
    }

    .add-course-card {
      margin-bottom: 24px;
      background: #e3f2fd;

      .add-course-form {
        display: flex;
        gap: 16px;
        align-items: flex-start;

        mat-form-field {
          flex: 1;
        }

        button {
          margin-top: 4px;
        }
      }
    }

    .course-templates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 16px;
    }

    .empty-state {
      mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px;
        text-align: center;

        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          color: rgba(0, 0, 0, 0.3);
          margin-bottom: 16px;
        }

        p {
          margin: 0;
          color: rgba(0, 0, 0, 0.6);

          &.hint {
            font-size: 13px;
            margin-top: 8px;
          }
        }
      }
    }

    .preview-card {
      max-width: 600px;

      .preview-disabled {
        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          color: #ff9800;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 16px 0 0;

          li {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 0;
            color: rgba(0, 0, 0, 0.6);

            mat-icon {
              font-size: 20px;
              width: 20px;
              height: 20px;
              color: #bdbdbd;
            }

            &.done {
              color: #2e7d32;

              mat-icon {
                color: #4caf50;
              }
            }
          }
        }
      }

      .preview-form {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        margin-bottom: 16px;

        mat-form-field {
          flex: 1;
        }

        button {
          margin-top: 4px;
          display: flex;
          align-items: center;
          gap: 8px;

          mat-spinner {
            margin-right: 8px;
          }
        }
      }

      .preview-info {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: #fff8e1;
        padding: 12px;
        border-radius: 4px;
        border-left: 3px solid #fbc02d;

        mat-icon {
          color: #f57f17;
          flex-shrink: 0;
        }

        p {
          margin: 0;
          font-size: 13px;
          color: rgba(0, 0, 0, 0.7);
        }
      }
    }
  `]
})
export class TemplatesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = true;
  error = '';

  baseTemplate: Template | null = null;
  courseTemplates: Template[] = [];
  coursesWithoutTemplate: CourseWithoutTemplate[] = [];

  availableFieldsBase: AvailableFields = {};
  availableFieldsCurso: AvailableFields = {};

  baseLoading = false;
  courseLoadingMap: Record<number, boolean> = {};
  previewLoading = false;

  selectedCourseToAdd: CourseWithoutTemplate | null = null;
  selectedCourseForPreview: number | null = null;

  constructor(
    private templateService: TemplateService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.loadAvailableFields();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get canGeneratePreview(): boolean {
    return this.hasBaseTemplateFields;
  }

  get hasBaseTemplateFields(): boolean {
    return !!this.baseTemplate &&
           !!this.baseTemplate.campos &&
           Object.keys(this.baseTemplate.campos).length > 0;
  }

  loadTemplates(): void {
    this.loading = true;
    this.error = '';

    this.templateService.getTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.baseTemplate = response.data.base_template;
            this.courseTemplates = response.data.course_templates;
            this.coursesWithoutTemplate = response.data.courses_without_template;
          } else {
            this.error = response.message || 'Error al cargar plantillas';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error de conexión al cargar plantillas';
        }
      });
  }

  loadAvailableFields(): void {
    this.templateService.getAvailableFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.availableFieldsBase = response.data.base;
            this.availableFieldsCurso = response.data.curso;
          }
        },
        error: () => {
          // Silently fail, fields will be empty
        }
      });
  }

  onUploadBase(): void {
    const dialogData: UploadDialogData = {
      type: 'base',
      existingTemplate: this.baseTemplate || undefined
    };

    const dialogRef = this.dialog.open(TemplateUploadDialogComponent, {
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: UploadDialogResult | undefined) => {
      if (result) {
        this.uploadBaseTemplate(result.file, result.nombre);
      }
    });
  }

  onUploadCourse(template: Template): void {
    const dialogData: UploadDialogData = {
      type: 'curso',
      courseid: template.courseid!,
      courseName: template.course_name,
      existingTemplate: template
    };

    const dialogRef = this.dialog.open(TemplateUploadDialogComponent, {
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: UploadDialogResult | undefined) => {
      if (result) {
        this.uploadCourseTemplate(template.courseid!, result.file, result.nombre);
      }
    });
  }

  onAddCourseTemplate(): void {
    if (!this.selectedCourseToAdd) return;

    const dialogData: UploadDialogData = {
      type: 'curso',
      courseid: this.selectedCourseToAdd.courseid,
      courseName: this.selectedCourseToAdd.course_name
    };

    const dialogRef = this.dialog.open(TemplateUploadDialogComponent, {
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result: UploadDialogResult | undefined) => {
      if (result && this.selectedCourseToAdd) {
        this.uploadCourseTemplate(this.selectedCourseToAdd.courseid, result.file, result.nombre);
        this.selectedCourseToAdd = null;
      }
    });
  }

  private uploadBaseTemplate(file: File, nombre: string): void {
    this.baseLoading = true;

    this.templateService.uploadBaseTemplate(file, nombre || undefined)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.baseLoading = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.baseTemplate = response.data;
            this.showSuccess('Plantilla base subida correctamente');
          } else {
            this.showError(response.message || 'Error al subir plantilla');
          }
        },
        error: (err) => {
          this.showError(err.error?.message || 'Error al subir plantilla');
        }
      });
  }

  private uploadCourseTemplate(courseid: number, file: File, nombre: string): void {
    this.courseLoadingMap[courseid] = true;

    this.templateService.uploadCourseTemplate(courseid, file, nombre || undefined)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.courseLoadingMap[courseid] = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTemplates(); // Reload to update lists
            this.showSuccess('Plantilla de curso subida correctamente');
          } else {
            this.showError(response.message || 'Error al subir plantilla');
          }
        },
        error: (err) => {
          this.showError(err.error?.message || 'Error al subir plantilla');
        }
      });
  }

  onDownload(template: Template): void {
    this.templateService.downloadTemplate(template.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          this.templateService.triggerDownload(blob, template.archivo);
        },
        error: () => {
          this.showError('Error al descargar la plantilla');
        }
      });
  }

  onEditFields(template: Template): void {
    // Verificar que la plantilla tiene imagen de preview
    if (!template.imagen_preview) {
      this.showError('La plantilla no tiene imagen de preview. Por favor, vuelve a subir el PDF.');
      return;
    }

    const availableFields = template.tipo === 'base'
      ? this.availableFieldsBase
      : this.availableFieldsCurso;

    // Obtener URL de la imagen de preview
    const previewImageUrl = this.templateService.getPreviewImageUrl(template.id);

    // Preparar lista de cursos para selector (solo para plantilla base)
    const courses = template.tipo === 'base'
      ? this.courseTemplates.map(t => ({ id: t.courseid!, name: t.course_name || '' }))
      : undefined;

    const dialogData: VisualFieldEditorDialogData = {
      template,
      availableFields,
      previewImageUrl,
      courses,
      isSecondPage: template.tipo === 'curso'
    };

    const dialogRef = this.dialog.open(VisualFieldEditorDialogComponent, {
      data: dialogData,
      panelClass: 'visual-editor-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((campos: TemplateFields | undefined) => {
      if (campos) {
        this.saveTemplateFields(template, campos);
      }
    });
  }

  /**
   * Abre el editor visual para los campos de segunda página.
   * Los campos de segunda página se almacenan asociados a la plantilla base.
   * Se usa la primera plantilla de curso disponible como preview visual.
   */
  onEditSecondPageFields(): void {
    if (!this.baseTemplate) {
      this.showError('Debe existir una plantilla base primero');
      return;
    }

    if (this.courseTemplates.length === 0) {
      this.showError('Debe existir al menos una plantilla de curso');
      return;
    }

    // Usar la primera plantilla de curso como preview
    const firstCourseTemplate = this.courseTemplates[0];

    if (!firstCourseTemplate.imagen_preview) {
      this.showError('La plantilla de curso no tiene imagen de preview. Por favor, vuelve a subir el PDF.');
      return;
    }

    // Obtener URL de la imagen de preview del primer curso
    const previewImageUrl = this.templateService.getPreviewImageUrl(firstCourseTemplate.id);

    // Preparar lista de cursos para selector (para cambiar el preview visual)
    const courses = this.courseTemplates.map(t => ({ id: t.courseid!, name: t.course_name || '' }));

    const dialogData: VisualFieldEditorDialogData = {
      template: firstCourseTemplate, // Usamos la plantilla de curso para el preview visual
      availableFields: this.availableFieldsCurso,
      previewImageUrl,
      courses,
      isSecondPage: true
    };

    const dialogRef = this.dialog.open(VisualFieldEditorDialogComponent, {
      data: dialogData,
      panelClass: 'visual-editor-dialog',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((campos: TemplateFields | undefined) => {
      if (campos) {
        // Los campos de segunda página se guardan asociados a la plantilla de curso,
        // pero el backend los asocia internamente a la plantilla base
        this.saveTemplateFields(firstCourseTemplate, campos);
      }
    });
  }

  private saveTemplateFields(template: Template, campos: TemplateFields): void {
    const loadingKey = template.tipo === 'base' ? 'baseLoading' : template.courseid!;

    if (template.tipo === 'base') {
      this.baseLoading = true;
    } else {
      this.courseLoadingMap[template.courseid!] = true;
    }

    this.templateService.saveTemplateFields(template.id, campos)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          if (template.tipo === 'base') {
            this.baseLoading = false;
          } else {
            this.courseLoadingMap[template.courseid!] = false;
          }
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Update template with new campos
            if (template.tipo === 'base' && this.baseTemplate) {
              this.baseTemplate.campos = response.data.campos;
            } else {
              const idx = this.courseTemplates.findIndex(t => t.id === template.id);
              if (idx !== -1) {
                this.courseTemplates[idx].campos = response.data.campos;
              }
            }
            this.showSuccess('Campos guardados correctamente');
          } else {
            this.showError(response.message || 'Error al guardar campos');
          }
        },
        error: (err) => {
          this.showError(err.error?.message || 'Error al guardar campos');
        }
      });
  }

  onDeleteCourse(template: Template): void {
    if (!confirm(`¿Estás seguro de eliminar la plantilla de "${template.course_name}"?`)) {
      return;
    }

    this.courseLoadingMap[template.courseid!] = true;

    this.templateService.deleteCourseTemplate(template.courseid!)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.courseLoadingMap[template.courseid!] = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.loadTemplates();
            this.showSuccess('Plantilla eliminada correctamente');
          } else {
            this.showError(response.message || 'Error al eliminar plantilla');
          }
        },
        error: (err) => {
          this.showError(err.error?.message || 'Error al eliminar plantilla');
        }
      });
  }

  onPreview(): void {
    this.onGeneratePreview();
  }

  onGeneratePreview(): void {
    this.previewLoading = true;

    // Use first course with template if none selected
    const courseid = this.selectedCourseForPreview ||
                     (this.courseTemplates.length > 0 ? this.courseTemplates[0].courseid! : 0);

    this.templateService.generatePreview(courseid)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.previewLoading = false)
      )
      .subscribe({
        next: (blob) => {
          this.templateService.openPdfInNewTab(blob);
        },
        error: (err) => {
          this.showError(err.error?.message || 'Error al generar preview');
        }
      });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
