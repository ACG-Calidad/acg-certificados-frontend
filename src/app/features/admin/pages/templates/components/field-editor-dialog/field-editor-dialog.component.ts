import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import {
  FieldEditorDialogData,
  TemplateFields,
  TemplateFieldConfig,
  DEFAULT_FIELD_CONFIG
} from '../../../../../../core/models/template.model';

interface FieldEntry {
  name: string;
  description: string;
  enabled: boolean;
  config: TemplateFieldConfig;
}

@Component({
  selector: 'app-field-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="title-icon">tune</mat-icon>
      Configurar Campos - {{ data.template.nombre }}
    </h2>

    <mat-dialog-content>
      <div class="info-banner">
        <mat-icon>info</mat-icon>
        <p>
          Define las coordenadas (en milímetros) donde se insertará cada campo en el PDF.
          Las coordenadas se miden desde la esquina superior izquierda de la página.
        </p>
      </div>

      <mat-accordion>
        @for (field of fields; track field.name) {
          <mat-expansion-panel [expanded]="field.enabled">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <mat-slide-toggle
                  [checked]="field.enabled"
                  (change)="toggleField(field, $event.checked)"
                  (click)="$event.stopPropagation()">
                </mat-slide-toggle>
                <span class="field-name">{{ field.name }}</span>
              </mat-panel-title>
              <mat-panel-description>
                {{ field.description }}
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="field-config" [class.disabled]="!field.enabled">
              <div class="config-row">
                <h4>Posición</h4>
                <div class="position-inputs">
                  <mat-form-field appearance="outline">
                    <mat-label>X (mm)</mat-label>
                    <input matInput type="number" [(ngModel)]="field.config.pos_x" min="0" max="300" step="0.5">
                    <mat-hint>Horizontal</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Y (mm)</mat-label>
                    <input matInput type="number" [(ngModel)]="field.config.pos_y" min="0" max="300" step="0.5">
                    <mat-hint>Vertical</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Ancho máx (mm)</mat-label>
                    <input matInput type="number" [(ngModel)]="field.config.max_width" min="0" max="300" step="1">
                    <mat-hint>0 = sin límite</mat-hint>
                  </mat-form-field>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="config-row">
                <h4>Tipografía</h4>
                <div class="typography-inputs">
                  <mat-form-field appearance="outline">
                    <mat-label>Fuente</mat-label>
                    <mat-select [(ngModel)]="field.config.font_family">
                      <mat-option value="Arial">Arial</mat-option>
                      <mat-option value="Helvetica">Helvetica</mat-option>
                      <mat-option value="Times">Times New Roman</mat-option>
                      <mat-option value="Courier">Courier</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Tamaño</mat-label>
                    <input matInput type="number" [(ngModel)]="field.config.font_size" min="6" max="72" step="1">
                    <mat-hint>pt</mat-hint>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Estilo</mat-label>
                    <mat-select [(ngModel)]="field.config.font_style">
                      <mat-option value="">Normal</mat-option>
                      <mat-option value="B">Negrita</mat-option>
                      <mat-option value="I">Cursiva</mat-option>
                      <mat-option value="BI">Negrita + Cursiva</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Alineación</mat-label>
                    <mat-select [(ngModel)]="field.config.text_align">
                      <mat-option value="L">Izquierda</mat-option>
                      <mat-option value="C">Centro</mat-option>
                      <mat-option value="R">Derecha</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>

              <mat-divider></mat-divider>

              <div class="config-row">
                <h4>Color del texto</h4>
                <div class="color-inputs">
                  <mat-form-field appearance="outline">
                    <mat-label>R</mat-label>
                    <input matInput type="number" [(ngModel)]="field.config.color.r" min="0" max="255">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>G</mat-label>
                    <input matInput type="number" [(ngModel)]="field.config.color.g" min="0" max="255">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>B</mat-label>
                    <input matInput type="number" [(ngModel)]="field.config.color.b" min="0" max="255">
                  </mat-form-field>
                  <div class="color-preview"
                       [style.background-color]="getColorStyle(field.config.color)"
                       matTooltip="Vista previa del color">
                  </div>
                </div>
              </div>
            </div>
          </mat-expansion-panel>
        }
      </mat-accordion>

      <div class="tips-section">
        <h4><mat-icon>lightbulb</mat-icon> Consejos</h4>
        <ul>
          <li>Una hoja Letter horizontal mide aprox. <strong>279 x 216 mm</strong></li>
          <li>Una hoja A4 horizontal mide aprox. <strong>297 x 210 mm</strong></li>
          <li>Usa el preview para verificar las posiciones</li>
          <li>Los campos deshabilitados no se insertarán en el PDF</li>
        </ul>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" (click)="onSave()">
        Guardar Configuración
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .title-icon {
      vertical-align: middle;
      margin-right: 8px;
    }

    mat-dialog-content {
      min-width: 600px;
      max-height: 70vh;
    }

    .info-banner {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: #e3f2fd;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;

      mat-icon {
        color: #1976d2;
        flex-shrink: 0;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.7);
      }
    }

    mat-expansion-panel-header {
      .field-name {
        margin-left: 12px;
        font-weight: 500;
      }
    }

    .field-config {
      padding: 16px 0;

      &.disabled {
        opacity: 0.5;
        pointer-events: none;
      }

      .config-row {
        margin-bottom: 16px;

        h4 {
          margin: 0 0 12px;
          font-size: 13px;
          color: rgba(0, 0, 0, 0.6);
          text-transform: uppercase;
        }
      }

      .position-inputs,
      .typography-inputs,
      .color-inputs {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;

        mat-form-field {
          flex: 1;
          min-width: 100px;
        }
      }

      .color-inputs {
        mat-form-field {
          max-width: 80px;
        }

        .color-preview {
          width: 48px;
          height: 48px;
          border-radius: 4px;
          border: 1px solid #ccc;
          align-self: center;
        }
      }

      mat-divider {
        margin: 16px 0;
      }
    }

    .tips-section {
      background: #fffde7;
      padding: 16px;
      border-radius: 4px;
      margin-top: 16px;
      border-left: 3px solid #fbc02d;

      h4 {
        margin: 0 0 8px;
        font-size: 14px;
        color: #f57f17;
        display: flex;
        align-items: center;
        gap: 8px;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
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
  `]
})
export class FieldEditorDialogComponent implements OnInit {
  fields: FieldEntry[] = [];

  constructor(
    public dialogRef: MatDialogRef<FieldEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FieldEditorDialogData
  ) {}

  ngOnInit(): void {
    // Inicializar campos a partir de los disponibles
    const currentFields = this.data.template.campos || {};

    this.fields = Object.entries(this.data.availableFields).map(([name, description]) => ({
      name,
      description,
      enabled: !!currentFields[name],
      config: currentFields[name]
        ? { ...currentFields[name] }
        : { ...DEFAULT_FIELD_CONFIG }
    }));
  }

  toggleField(field: FieldEntry, enabled: boolean): void {
    field.enabled = enabled;
  }

  getColorStyle(color: { r: number; g: number; b: number }): string {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const campos: TemplateFields = {};

    this.fields
      .filter(f => f.enabled)
      .forEach(f => {
        campos[f.name] = {
          pos_x: f.config.pos_x,
          pos_y: f.config.pos_y,
          font_size: f.config.font_size,
          font_family: f.config.font_family,
          font_style: f.config.font_style,
          text_align: f.config.text_align,
          max_width: f.config.max_width || null,
          color: { ...f.config.color }
        };
      });

    this.dialogRef.close(campos);
  }
}
