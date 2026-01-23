import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UploadDialogData } from '../../../../../../core/models/template.model';

export interface UploadDialogResult {
  file: File;
  nombre: string;
}

@Component({
  selector: 'app-template-upload-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      @if (data.type === 'base') {
        <mat-icon class="title-icon">description</mat-icon>
        {{ data.existingTemplate ? 'Actualizar' : 'Subir' }} Plantilla Base
      } @else {
        <mat-icon class="title-icon">school</mat-icon>
        {{ data.existingTemplate ? 'Actualizar' : 'Subir' }} Plantilla de Curso
      }
    </h2>

    <mat-dialog-content>
      @if (data.type === 'curso') {
        <div class="course-info">
          <strong>Curso:</strong> {{ data.courseName }}
        </div>
      }

      @if (data.existingTemplate) {
        <div class="existing-info">
          <mat-icon>info</mat-icon>
          <span>Se reemplazará la plantilla actual (v{{ data.existingTemplate.version }})</span>
        </div>
      }

      <div class="upload-area"
           [class.drag-over]="isDragOver"
           [class.has-file]="selectedFile"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           (click)="fileInput.click()">

        <input type="file"
               #fileInput
               accept=".pdf"
               (change)="onFileSelected($event)"
               hidden>

        @if (selectedFile) {
          <mat-icon class="file-icon">picture_as_pdf</mat-icon>
          <div class="file-info">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <button mat-icon-button color="warn" (click)="clearFile($event)" class="clear-btn">
            <mat-icon>close</mat-icon>
          </button>
        } @else {
          <mat-icon class="upload-icon">cloud_upload</mat-icon>
          <p class="upload-text">Arrastra un archivo PDF aquí</p>
          <p class="upload-hint">o haz clic para seleccionar</p>
        }
      </div>

      @if (error) {
        <div class="error-message">
          <mat-icon>error</mat-icon>
          {{ error }}
        </div>
      }

      <mat-form-field appearance="outline" class="name-field">
        <mat-label>Nombre descriptivo (opcional)</mat-label>
        <input matInput [(ngModel)]="nombre" placeholder="Ej: Certificado ACG 2026">
        <mat-hint>Si no se especifica, se generará automáticamente</mat-hint>
      </mat-form-field>

      <div class="instructions">
        <h4>Instrucciones:</h4>
        <ul>
          <li>El archivo debe estar en formato <strong>PDF</strong></li>
          <li>Tamaño máximo: <strong>10 MB</strong></li>
          <li>Exporta la presentación desde Google Slides como PDF</li>
          @if (data.type === 'base') {
            <li>La plantilla base contiene los campos: participante, documento, curso, intensidad, fecha, ID certificado</li>
          } @else {
            <li>La plantilla de curso solo contiene el campo: ID certificado</li>
          }
          <li>Deja los espacios de los campos <strong>vacíos</strong> en el PDF</li>
        </ul>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="!selectedFile || uploading" (click)="onConfirm()">
        @if (uploading) {
          Subiendo...
        } @else {
          {{ data.existingTemplate ? 'Actualizar' : 'Subir' }}
        }
      </button>
    </mat-dialog-actions>

    @if (uploading) {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
  `,
  styles: [`
    .title-icon {
      vertical-align: middle;
      margin-right: 8px;
    }

    mat-dialog-content {
      min-width: 450px;
    }

    .course-info {
      background: #e3f2fd;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .existing-info {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #fff3e0;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      color: #e65100;

      mat-icon {
        color: #ff9800;
      }
    }

    .upload-area {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      margin-bottom: 16px;

      &:hover {
        border-color: #1976d2;
        background: #f5f5f5;
      }

      &.drag-over {
        border-color: #1976d2;
        background: #e3f2fd;
      }

      &.has-file {
        border-style: solid;
        border-color: #4caf50;
        background: #e8f5e9;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 16px;
      }

      .upload-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #1976d2;
        opacity: 0.7;
      }

      .file-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #d32f2f;
      }

      .upload-text {
        margin: 8px 0 4px;
        font-size: 16px;
        color: rgba(0, 0, 0, 0.7);
      }

      .upload-hint {
        margin: 0;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.5);
      }

      .file-info {
        display: flex;
        flex-direction: column;
        text-align: left;

        .file-name {
          font-weight: 500;
        }

        .file-size {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.6);
        }
      }

      .clear-btn {
        position: absolute;
        right: 8px;
        top: 8px;
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #d32f2f;
      background: #ffebee;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;

      mat-icon {
        color: #d32f2f;
      }
    }

    .name-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .instructions {
      background: #fafafa;
      padding: 16px;
      border-radius: 4px;
      border-left: 3px solid #1976d2;

      h4 {
        margin: 0 0 8px;
        font-size: 14px;
        color: #1976d2;
      }

      ul {
        margin: 0;
        padding-left: 20px;

        li {
          margin-bottom: 4px;
          font-size: 13px;
          color: rgba(0, 0, 0, 0.7);
        }
      }
    }

    mat-progress-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }
  `]
})
export class TemplateUploadDialogComponent {
  selectedFile: File | null = null;
  nombre = '';
  error = '';
  isDragOver = false;
  uploading = false;

  private readonly MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  constructor(
    public dialogRef: MatDialogRef<TemplateUploadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UploadDialogData
  ) {
    if (data.existingTemplate) {
      this.nombre = data.existingTemplate.nombre;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.validateAndSetFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  validateAndSetFile(file: File): void {
    this.error = '';

    // Validar extensión
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      this.error = 'Solo se permiten archivos PDF';
      return;
    }

    // Validar tipo MIME
    if (file.type !== 'application/pdf') {
      this.error = 'El archivo no es un PDF válido';
      return;
    }

    // Validar tamaño
    if (file.size > this.MAX_SIZE) {
      this.error = 'El archivo supera el tamaño máximo de 10 MB';
      return;
    }

    this.selectedFile = file;
  }

  clearFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.error = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    }
    return bytes + ' bytes';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.selectedFile) {
      this.dialogRef.close({
        file: this.selectedFile,
        nombre: this.nombre.trim()
      } as UploadDialogResult);
    }
  }
}
