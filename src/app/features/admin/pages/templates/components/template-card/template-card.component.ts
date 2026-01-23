import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Template, AvailableFields } from '../../../../../../core/models/template.model';

@Component({
  selector: 'app-template-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  template: `
    <mat-card class="template-card" [class.has-template]="template" [class.no-template]="!template">
      <mat-card-header>
        <mat-icon mat-card-avatar [class]="type === 'base' ? 'icon-base' : 'icon-course'">
          {{ type === 'base' ? 'description' : 'school' }}
        </mat-icon>
        <mat-card-title>
          @if (type === 'base') {
            Plantilla Base (Página 1)
          } @else {
            {{ courseName || 'Curso' }}
          }
        </mat-card-title>
        <mat-card-subtitle>
          @if (template) {
            {{ template.nombre }}
          } @else {
            Sin plantilla configurada
          }
        </mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        @if (template) {
          <div class="template-info">
            <div class="info-row">
              <span class="label">Archivo:</span>
              <span class="value">{{ template.archivo }}</span>
            </div>
            <div class="info-row">
              <span class="label">Tamaño:</span>
              <span class="value">{{ template.archivo_size_formatted }}</span>
            </div>
            <div class="info-row">
              <span class="label">Versión:</span>
              <span class="value">{{ template.version }}</span>
            </div>
            <div class="info-row">
              <span class="label">Actualizado:</span>
              <span class="value">{{ template.updated_at_formatted }}</span>
            </div>
          </div>

          <div class="fields-section">
            <div class="fields-header">
              <span class="label">Campos configurados:</span>
              @if (configuredFieldsCount > 0) {
                <mat-chip class="configured-chip">{{ configuredFieldsCount }} / {{ totalFieldsCount }}</mat-chip>
              } @else {
                <mat-chip class="warning-chip">Sin configurar</mat-chip>
              }
            </div>
            @if (template.campos && configuredFieldsCount > 0) {
              <div class="fields-list">
                @for (fieldName of configuredFieldNames; track fieldName) {
                  <mat-chip class="field-chip">{{ fieldName }}</mat-chip>
                }
              </div>
            }
          </div>
        } @else {
          <div class="no-template-message">
            <mat-icon>cloud_upload</mat-icon>
            <p>Sube un archivo PDF para configurar esta plantilla</p>
          </div>
        }
      </mat-card-content>

      <mat-card-actions align="end">
        @if (template) {
          <button mat-button color="primary" (click)="onDownload()" [disabled]="loading" matTooltip="Descargar PDF">
            <mat-icon>download</mat-icon>
            Descargar
          </button>
          <button mat-button color="accent" (click)="onUpload()" [disabled]="loading" matTooltip="Actualizar plantilla">
            <mat-icon>cloud_upload</mat-icon>
            Actualizar
          </button>
          @if (type === 'base' && template.campos && configuredFieldsCount > 0) {
            <button mat-button color="primary" (click)="onPreview()" [disabled]="loading || !canPreview" matTooltip="Ver preview del certificado">
              <mat-icon>visibility</mat-icon>
              Preview
            </button>
          }
          @if (type === 'curso') {
            <button mat-icon-button color="warn" (click)="onDelete()" [disabled]="loading" matTooltip="Eliminar plantilla">
              <mat-icon>delete</mat-icon>
            </button>
          }
        } @else {
          <button mat-flat-button color="primary" (click)="onUpload()" [disabled]="loading">
            <mat-icon>cloud_upload</mat-icon>
            Subir Plantilla
          </button>
        }

        @if (loading) {
          <mat-spinner diameter="24"></mat-spinner>
        }
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .template-card {
      margin-bottom: 16px;
      transition: box-shadow 0.2s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &.has-template {
        border-left: 4px solid #4caf50;
      }

      &.no-template {
        border-left: 4px solid #ff9800;
        background-color: #fff8e1;
      }
    }

    mat-card-header {
      mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;

        &.icon-base {
          color: #1976d2;
        }

        &.icon-course {
          color: #7b1fa2;
        }
      }
    }

    .template-info {
      margin-bottom: 16px;

      .info-row {
        display: flex;
        padding: 4px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }

        .label {
          width: 100px;
          color: rgba(0, 0, 0, 0.6);
          font-size: 13px;
        }

        .value {
          flex: 1;
          font-size: 13px;
        }
      }
    }

    .fields-section {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;

      .fields-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;

        .label {
          font-size: 13px;
          color: rgba(0, 0, 0, 0.6);
        }
      }

      .fields-list {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
    }

    .configured-chip {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    .warning-chip {
      background-color: #fff3e0 !important;
      color: #e65100 !important;
    }

    .field-chip {
      font-size: 11px !important;
    }

    .no-template-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      text-align: center;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #ff9800;
        opacity: 0.7;
      }

      p {
        margin-top: 8px;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    mat-card-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-spinner {
        margin-left: 8px;
      }
    }
  `]
})
export class TemplateCardComponent {
  @Input() template: Template | null = null;
  @Input() type: 'base' | 'curso' = 'base';
  @Input() courseid?: number;
  @Input() courseName?: string;
  @Input() availableFields: AvailableFields = {};
  @Input() loading = false;
  @Input() canPreview = false;

  @Output() upload = new EventEmitter<void>();
  @Output() download = new EventEmitter<void>();
  @Output() preview = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  get configuredFieldsCount(): number {
    return this.template?.campos ? Object.keys(this.template.campos).length : 0;
  }

  get totalFieldsCount(): number {
    return Object.keys(this.availableFields).length;
  }

  get configuredFieldNames(): string[] {
    return this.template?.campos ? Object.keys(this.template.campos) : [];
  }

  onUpload(): void {
    this.upload.emit();
  }

  onDownload(): void {
    this.download.emit();
  }

  onPreview(): void {
    this.preview.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }
}
