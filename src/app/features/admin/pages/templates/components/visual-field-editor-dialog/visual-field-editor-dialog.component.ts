import { Component, Inject, OnInit, ElementRef, ViewChild, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkDrag, CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import {
  TemplateFieldConfig,
  TemplateFields,
  DEFAULT_FIELD_CONFIG,
  DEFAULT_PREFIXES,
  FontFamily,
  FontStyle,
  TextAlign,
  FONT_SIZES,
  FONT_FAMILIES,
  VisualFieldEditorDialogData
} from '../../../../../../core/models/template.model';

/**
 * Datos de ejemplo para preview (sincronizados con backend TemplateService.php línea 790)
 */
const PREVIEW_DATA: Record<string, string> = {
  participante: 'Juan Carlos Pérez García',
  documento: 'CC 1.234.567.890',
  curso: 'Nombre del Curso Virtual de Ejemplo',
  intensidad: 'INTENSIDAD 40 HORAS',
  fecha: 'Enero de 2026',
  certificado_id: '1234',
  certificado_id_pagina2: '1234'
};

/**
 * Campos cuyos prefijos son editables y se almacenan en BD
 */
const FIELDS_WITH_EDITABLE_PREFIX = ['curso', 'fecha'];

interface DraggableField {
  name: string;
  description: string;
  config: TemplateFieldConfig;
  displayText: string;
  editableText: string; // Texto que el usuario puede editar
  showToolbar: boolean;
  isEditing: boolean;
}

@Component({
  selector: 'app-visual-field-editor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    DragDropModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>
          <mat-icon>tune</mat-icon>
          Definir Campos - {{ data.template.nombre }}
        </h2>
        @if (data.courses && data.courses.length > 0 && !data.isSecondPage) {
          <mat-form-field appearance="outline" class="course-selector">
            <mat-label>Curso de ejemplo</mat-label>
            <mat-select [(value)]="selectedCourseId" (selectionChange)="onCourseChange()">
              @for (course of data.courses; track course.id) {
                <mat-option [value]="course.id">{{ course.name }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      </div>

      <div class="editor-container" #editorContainer>
        @if (loading) {
          <div class="loading-overlay">
            <mat-spinner diameter="48"></mat-spinner>
            <p>Cargando plantilla...</p>
          </div>
        }

        <div class="canvas-wrapper"
             [style.width.px]="canvasWidth"
             [style.height.px]="canvasHeight">
          <img [src]="data.previewImageUrl"
               class="template-background"
               (load)="onImageLoad($event)"
               (error)="onImageError()">

          @for (field of fields; track field.name; let i = $index) {
            <div class="draggable-field"
                 #fieldElement
                 cdkDrag
                 [cdkDragFreeDragPosition]="getFieldPosition(field)"
                 (cdkDragEnded)="onDragEnd($event, field, i)"
                 (click)="selectField(field)"
                 [class.selected]="selectedField === field"
                 [style.font-family]="getFontFamily(field.config.font_family)"
                 [style.font-size.px]="getScaledFontSize(field.config.font_size)"
                 [style.font-weight]="field.config.font_style === 'bold' ? 'bold' : 'normal'"
                 [style.font-style]="field.config.font_style === 'italic' ? 'italic' : 'normal'"
                 [style.text-decoration]="field.config.font_style === 'underline' ? 'underline' : 'none'"
                 [style.text-align]="field.config.text_align"
                 [style.color]="getColorStyle(field.config.color)">

              <!-- Toolbar toggle button (left) -->
              <button mat-icon-button
                      class="field-action-btn left"
                      (click)="toggleToolbar(field, $event)"
                      [matTooltip]="'Estilos'">
                <mat-icon>palette</mat-icon>
              </button>

              <!-- Field content -->
              <div class="field-content">
                @if (field.isEditing) {
                  <input type="text"
                         [(ngModel)]="field.editableText"
                         (blur)="onEditComplete(field)"
                         (keyup.enter)="onEditComplete(field)"
                         class="edit-input">
                } @else {
                  <span>{{ field.displayText }}</span>
                }
              </div>

              <!-- Edit button (right) -->
              <button mat-icon-button
                      class="field-action-btn right"
                      (click)="startEditing(field, $event)"
                      [matTooltip]="getEditTooltip(field.name)">
                <mat-icon>edit</mat-icon>
              </button>

              <!-- Mini toolbar -->
              @if (field.showToolbar) {
                <div class="mini-toolbar" (click)="$event.stopPropagation()">
                  <!-- Font family -->
                  <mat-form-field appearance="outline" class="toolbar-select font-family">
                    <mat-select [(ngModel)]="field.config.font_family">
                      @for (font of fontFamilies; track font.value) {
                        <mat-option [value]="font.value">{{ font.label }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <!-- Font size -->
                  <mat-form-field appearance="outline" class="toolbar-select size">
                    <mat-select [(ngModel)]="field.config.font_size">
                      @for (size of fontSizes; track size) {
                        <mat-option [value]="size">{{ size }}pt</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>

                  <div class="toolbar-divider"></div>

                  <!-- Style toggles -->
                  <mat-button-toggle-group multiple class="style-toggles">
                    <mat-button-toggle value="bold"
                                       [checked]="field.config.font_style === 'bold'"
                                       (change)="toggleStyle(field, 'bold')"
                                       matTooltip="Negrita">
                      <mat-icon>format_bold</mat-icon>
                    </mat-button-toggle>
                    <mat-button-toggle value="italic"
                                       [checked]="field.config.font_style === 'italic'"
                                       (change)="toggleStyle(field, 'italic')"
                                       matTooltip="Cursiva">
                      <mat-icon>format_italic</mat-icon>
                    </mat-button-toggle>
                    <mat-button-toggle value="underline"
                                       [checked]="field.config.font_style === 'underline'"
                                       (change)="toggleStyle(field, 'underline')"
                                       matTooltip="Subrayado">
                      <mat-icon>format_underlined</mat-icon>
                    </mat-button-toggle>
                  </mat-button-toggle-group>

                  <div class="toolbar-divider"></div>

                  <!-- Alignment -->
                  <mat-button-toggle-group [value]="field.config.text_align" class="align-toggles">
                    <mat-button-toggle value="left"
                                       (change)="setAlignment(field, 'left')"
                                       matTooltip="Izquierda">
                      <mat-icon>format_align_left</mat-icon>
                    </mat-button-toggle>
                    <mat-button-toggle value="center"
                                       (change)="setAlignment(field, 'center')"
                                       matTooltip="Centro">
                      <mat-icon>format_align_center</mat-icon>
                    </mat-button-toggle>
                    <mat-button-toggle value="right"
                                       (change)="setAlignment(field, 'right')"
                                       matTooltip="Derecha">
                      <mat-icon>format_align_right</mat-icon>
                    </mat-button-toggle>
                  </mat-button-toggle-group>

                  <!-- Close toolbar -->
                  <button mat-icon-button
                          class="close-toolbar"
                          (click)="closeToolbar(field)">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              }

              <!-- Drag handle indicator (positioned based on text alignment as anchor point) -->
              <div class="drag-indicator"
                   [class.align-left]="field.config.text_align === 'left'"
                   [class.align-center]="field.config.text_align === 'center'"
                   [class.align-right]="field.config.text_align === 'right'"
                   cdkDragHandle>
                <mat-icon>drag_indicator</mat-icon>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="dialog-footer">
        <div class="coordinates-info">
          @if (selectedField) {
            <span>
              <strong>{{ getFieldLabel(selectedField.name) }}:</strong>
              X={{ selectedField.config.pos_x | number:'1.1-1' }}mm,
              Y={{ selectedField.config.pos_y | number:'1.1-1' }}mm
            </span>
          } @else {
            <span class="hint">Arrastra los campos para posicionarlos</span>
          }
        </div>
        <div class="actions">
          <button mat-button (click)="onCancel()">Cancelar</button>
          <button mat-flat-button color="primary" (click)="onSave()">
            <mat-icon>save</mat-icon>
            Guardar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
      flex-shrink: 0;

      h2 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 20px;

        mat-icon {
          color: #0066CC;
        }
      }

      .course-selector {
        width: 300px;

        ::ng-deep .mat-mdc-form-field-subscript-wrapper {
          display: none;
        }
      }
    }

    .editor-container {
      flex: 1;
      overflow: auto;
      background: #e0e0e0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 24px;
      position: relative;
      min-height: 0;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16px;
      z-index: 100;

      p {
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .canvas-wrapper {
      position: relative;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      flex-shrink: 0;
      line-height: 0; // Elimina espacio extra debajo de la imagen
    }

    .template-background {
      display: block;
      width: 100%;
      height: auto;
      position: absolute;
    }

    .draggable-field {
      position: absolute;
      cursor: move;
      padding: 4px 8px;
      background: rgba(255, 255, 255, 0.9);
      border: 2px dashed #0066CC;
      border-radius: 4px;
      min-width: 80px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: box-shadow 0.2s, border-color 0.2s;
      line-height: 1.2;

      &:hover, &.selected {
        box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
        border-color: #0044AA;
      }

      &.cdk-drag-dragging {
        box-shadow: 0 4px 16px rgba(0, 102, 204, 0.4);
        z-index: 1000;
      }
    }

    .field-action-btn {
      width: 28px;
      height: 28px;
      line-height: 28px;
      opacity: 0;
      transition: opacity 0.2s;
      flex-shrink: 0;
      background-color: var(--mat-button-filled-container-color);
      color: var(--mat-button-filled-label-text-color);

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        position: absolute;
        top: 5px;
        left: 5px;
      }

      &.left {
        margin-right: 4px;
      }

      &.right {
        margin-left: 4px;
      }
    }

    .draggable-field:hover .field-action-btn,
    .draggable-field.selected .field-action-btn {
      opacity: 1;
    }

    .field-content {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 50px;
    }

    .edit-input {
      border: none;
      background: rgba(255, 255, 255, 0.95);
      font: inherit;
      width: 100%;
      outline: 2px solid #0066CC;
      border-radius: 2px;
      padding: 2px 4px;
    }

    .mini-toolbar {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 8px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
      padding: 8px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 1001;
      white-space: nowrap;
    }

    .toolbar-select {
      width: 100px;

      &.font-family {
        width: 180px;
      }

      &.size {
        width: 75px;
      }

      ::ng-deep {
        .mat-mdc-form-field-subscript-wrapper {
          display: none;
        }

        .mat-mdc-text-field-wrapper {
          height: 36px;
          padding: 0 8px;
        }

        .mat-mdc-form-field-infix {
          padding: 6px 0 !important;
          min-height: auto;
        }
      }
    }

    .toolbar-divider {
      width: 1px;
      height: 24px;
      background: #e0e0e0;
    }

    .style-toggles, .align-toggles {
      ::ng-deep .mat-button-toggle {
        height: 32px;

        .mat-button-toggle-button {
          height: 32px;
          padding: 0 8px;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .close-toolbar {
      margin-left: 4px;
    }

    .drag-indicator {
      position: absolute;
      top: -22px;
      background: #0066CC;
      color: white;
      border-radius: 4px 4px 0 0;
      padding: 2px 6px;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s, left 0.2s, transform 0.2s;
      line-height: 1;
      cursor: grab;

      // Posición según alineación (representa el punto de anclaje del texto)
      &.align-left {
        left: 0;
        transform: translateX(0);
      }

      &.align-center {
        left: 50%;
        transform: translateX(-50%);
      }

      &.align-right {
        left: 100%;
        transform: translateX(-100%);
      }

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .draggable-field:hover .drag-indicator,
    .draggable-field.selected .drag-indicator {
      opacity: 1;
    }

    .dialog-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      background: #f5f5f5;
      border-top: 1px solid #e0e0e0;
      flex-shrink: 0;

      .coordinates-info {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.7);
        font-family: monospace;

        .hint {
          font-family: inherit;
          color: rgba(0, 0, 0, 0.5);
        }
      }

      .actions {
        display: flex;
        gap: 8px;

        button mat-icon {
          margin-right: 4px;
        }
      }
    }
  `]
})
export class VisualFieldEditorDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('editorContainer') editorContainer!: ElementRef;
  @ViewChildren('fieldElement') fieldElements!: QueryList<ElementRef>;
  @ViewChildren(CdkDrag) dragElements!: QueryList<CdkDrag>;

  fields: DraggableField[] = [];
  loading = true;
  selectedField: DraggableField | null = null;
  selectedCourseId: number | null = null;
  selectedCourseName = '';

  // Canvas dimensions (will be set after image loads)
  canvasWidth = 800;
  canvasHeight = 600;

  // Scale factor for converting mm to pixels
  private scaleX = 1;
  private scaleY = 1;

  // PDF dimensions in mm (obtenidas del backend, fallback a Letter horizontal)
  private pdfWidthMm = 279.4;
  private pdfHeightMm = 215.9;

  // Offset en píxeles del texto dentro del campo (border + padding + botones)
  // Estos valores deben coincidir con el CSS del .draggable-field
  // X: border(2) + padding-left(8) + botón(28) + margin-right(4) = 42px
  // Y: border(2) + padding-top(4) = 6px
  private readonly FIELD_OFFSET_X_PX = 42;
  private readonly FIELD_OFFSET_Y_PX = 6;

  fontSizes = FONT_SIZES;
  fontFamilies = FONT_FAMILIES;

  constructor(
    public dialogRef: MatDialogRef<VisualFieldEditorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VisualFieldEditorDialogData
  ) {
    // Usar dimensiones del PDF si están disponibles
    if (data.template.pdf_dimensions) {
      this.pdfWidthMm = data.template.pdf_dimensions.width;
      this.pdfHeightMm = data.template.pdf_dimensions.height;
    }
  }

  ngOnInit(): void {
    this.initializeFields();
    if (this.data.courses && this.data.courses.length > 0) {
      this.selectedCourseId = this.data.courses[0].id;
      this.selectedCourseName = this.data.courses[0].name;
    }
  }

  ngAfterViewInit(): void {
    // Los elementos están disponibles después de la vista inicial
  }

  private initializeFields(): void {
    const currentFields = this.data.template.campos || {};

    this.fields = Object.entries(this.data.availableFields).map(([name, description]) => {
      const existingConfig = currentFields[name];
      const config: TemplateFieldConfig = existingConfig
        ? { ...existingConfig }
        : { ...DEFAULT_FIELD_CONFIG };

      // Set default prefix if applicable and not already set
      if (this.hasEditablePrefix(name) && !config.prefix) {
        config.prefix = DEFAULT_PREFIXES[name] || '';
      }

      const displayText = this.buildDisplayText(name, config.prefix);
      const editableText = this.getEditableText(name, config.prefix);

      return {
        name,
        description,
        config,
        displayText,
        editableText,
        showToolbar: false,
        isEditing: false
      };
    });
  }

  /**
   * Construye el texto a mostrar para un campo
   */
  private buildDisplayText(fieldName: string, prefix?: string | null): string {
    const baseText = PREVIEW_DATA[fieldName] || fieldName;

    if (this.hasEditablePrefix(fieldName)) {
      const actualPrefix = prefix ?? DEFAULT_PREFIXES[fieldName] ?? '';
      if (fieldName === 'curso' && this.selectedCourseName) {
        return actualPrefix + this.selectedCourseName;
      }
      return actualPrefix + baseText;
    }

    return baseText;
  }

  /**
   * Obtiene el texto editable (todo el contenido para campos normales, solo el prefijo para campos con prefijo)
   */
  private getEditableText(fieldName: string, prefix?: string | null): string {
    if (this.hasEditablePrefix(fieldName)) {
      return prefix ?? DEFAULT_PREFIXES[fieldName] ?? '';
    }
    return PREVIEW_DATA[fieldName] || fieldName;
  }

  /**
   * Verifica si un campo tiene prefijo editable que se almacena en BD
   */
  hasEditablePrefix(fieldName: string): boolean {
    return FIELDS_WITH_EDITABLE_PREFIX.includes(fieldName);
  }

  /**
   * Obtiene el tooltip para el botón de editar según el tipo de campo
   */
  getEditTooltip(fieldName: string): string {
    if (this.hasEditablePrefix(fieldName)) {
      return 'Editar prefijo';
    }
    return 'Editar texto de ejemplo';
  }

  /**
   * Obtiene label legible para un campo
   */
  getFieldLabel(fieldName: string): string {
    return this.data.availableFields[fieldName] || fieldName;
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.canvasWidth = img.naturalWidth;
    this.canvasHeight = img.naturalHeight;

    // Calculate scale factors (pixels per mm)
    this.scaleX = this.canvasWidth / this.pdfWidthMm;
    this.scaleY = this.canvasHeight / this.pdfHeightMm;

    this.loading = false;
  }

  onImageError(): void {
    this.loading = false;
    console.error('Error loading template preview image');
  }

  getFieldPosition(field: DraggableField): { x: number; y: number } {
    // Convertir coordenadas mm (posición del texto en PDF) a píxeles (posición del div)
    // La coordenada pos_x representa el punto de anclaje según la alineación:
    // - left: inicio del texto (esquina izquierda)
    // - center: centro del texto
    // - right: fin del texto (esquina derecha)
    //
    // El div siempre se posiciona por su esquina superior izquierda,
    // así que debemos ajustar según la alineación y el ancho del campo
    const fieldIndex = this.fields.indexOf(field);
    const fieldWidth = this.getFieldContentWidth(fieldIndex);

    let xOffset = this.FIELD_OFFSET_X_PX;

    // Ajustar offset según alineación
    if (field.config.text_align === 'center') {
      // La coordenada representa el centro, mover el div hacia la izquierda
      xOffset += fieldWidth / 2;
    } else if (field.config.text_align === 'right') {
      // La coordenada representa el extremo derecho, mover el div hacia la izquierda
      xOffset += fieldWidth;
    }

    return {
      x: (field.config.pos_x * this.scaleX) - xOffset,
      y: (field.config.pos_y * this.scaleY) - this.FIELD_OFFSET_Y_PX
    };
  }

  /**
   * Obtiene el ancho del contenido del texto de un campo (sin botones)
   */
  private getFieldContentWidth(fieldIndex: number): number {
    if (!this.fieldElements || fieldIndex < 0) {
      return 0;
    }

    const elements = this.fieldElements.toArray();
    if (fieldIndex >= elements.length) {
      return 0;
    }

    const fieldEl = elements[fieldIndex].nativeElement as HTMLElement;
    const contentEl = fieldEl.querySelector('.field-content') as HTMLElement;

    if (contentEl) {
      return contentEl.offsetWidth;
    }

    return 0;
  }

  onDragEnd(event: CdkDragEnd, field: DraggableField, fieldIndex: number): void {
    const position = event.source.getFreeDragPosition();

    // Obtener el ancho del contenido del campo
    const fieldWidth = this.getFieldContentWidth(fieldIndex);

    // Calcular la posición del punto de anclaje según la alineación
    let anchorOffsetX = this.FIELD_OFFSET_X_PX;

    if (field.config.text_align === 'center') {
      // El punto de anclaje está en el centro del texto
      anchorOffsetX += fieldWidth / 2;
    } else if (field.config.text_align === 'right') {
      // El punto de anclaje está en el extremo derecho del texto
      anchorOffsetX += fieldWidth;
    }

    // Convertir posición del div (píxeles) a posición del punto de anclaje (mm)
    const anchorPosX = position.x + anchorOffsetX;
    const anchorPosY = position.y + this.FIELD_OFFSET_Y_PX;

    // Convertir a mm
    field.config.pos_x = Math.round((anchorPosX / this.scaleX) * 10) / 10;
    field.config.pos_y = Math.round((anchorPosY / this.scaleY) * 10) / 10;

    // Ensure within bounds
    field.config.pos_x = Math.max(0, Math.min(field.config.pos_x, this.pdfWidthMm));
    field.config.pos_y = Math.max(0, Math.min(field.config.pos_y, this.pdfHeightMm));

    this.selectedField = field;
  }

  selectField(field: DraggableField): void {
    this.selectedField = field;
  }

  getScaledFontSize(ptSize: number): number {
    // Convert pt to pixel size for the preview image
    // pt is 1/72 of an inch, so we need to scale based on image DPI
    // imageDPI = (canvasWidth / pdfWidthMm) * 25.4
    // pixelSize = pt * (imageDPI / 72) = pt * (canvasWidth / pdfWidthMm) * 25.4 / 72
    // Simplified: pixelSize = pt * scaleX * (25.4 / 72) = pt * scaleX * 0.3528
    return Math.round(ptSize * this.scaleX * 0.3528);
  }

  getFontFamily(family: FontFamily): string {
    switch (family) {
      case 'times': return '"Times New Roman", Times, serif';
      case 'courier': return '"Courier New", Courier, monospace';
      case 'cinzel': return '"Times New Roman", Times, serif'; // Mapea a Times en backend
      case 'norms': return 'Arial, Helvetica, sans-serif'; // Mapea a Helvetica en backend
      case 'arial':
      default: return 'Arial, Helvetica, sans-serif';
    }
  }

  getColorStyle(color: { r: number; g: number; b: number }): string {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  toggleToolbar(field: DraggableField, event: Event): void {
    event.stopPropagation();
    // Close other toolbars
    this.fields.forEach(f => {
      if (f !== field) f.showToolbar = false;
    });
    field.showToolbar = !field.showToolbar;
    this.selectedField = field;
  }

  closeToolbar(field: DraggableField): void {
    field.showToolbar = false;
  }

  toggleStyle(field: DraggableField, style: FontStyle): void {
    if (field.config.font_style === style) {
      field.config.font_style = 'normal';
    } else {
      field.config.font_style = style;
    }
  }

  setAlignment(field: DraggableField, align: TextAlign): void {
    field.config.text_align = align;

    // Forzar actualización de la posición del drag element
    const fieldIndex = this.fields.indexOf(field);
    if (fieldIndex >= 0 && this.dragElements) {
      const dragArray = this.dragElements.toArray();
      if (fieldIndex < dragArray.length) {
        const newPos = this.getFieldPosition(field);
        dragArray[fieldIndex].setFreeDragPosition(newPos);
      }
    }
  }

  startEditing(field: DraggableField, event: Event): void {
    event.stopPropagation();
    field.isEditing = true;
    this.selectedField = field;
  }

  onEditComplete(field: DraggableField): void {
    field.isEditing = false;

    if (this.hasEditablePrefix(field.name)) {
      // Para campos con prefijo editable, guardamos el prefijo
      field.config.prefix = field.editableText;
      field.displayText = this.buildDisplayText(field.name, field.editableText);
    } else {
      // Para otros campos, actualizamos el display text (solo visual, no se guarda)
      field.displayText = field.editableText;
    }
  }

  onCourseChange(): void {
    if (this.data.courses) {
      const course = this.data.courses.find(c => c.id === this.selectedCourseId);
      if (course) {
        this.selectedCourseName = course.name;

        // Update curso field display
        const cursoField = this.fields.find(f => f.name === 'curso');
        if (cursoField) {
          cursoField.displayText = this.buildDisplayText('curso', cursoField.config.prefix);
        }
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    const campos: TemplateFields = {};

    this.fields.forEach(field => {
      campos[field.name] = {
        pos_x: field.config.pos_x,
        pos_y: field.config.pos_y,
        font_size: field.config.font_size,
        font_family: field.config.font_family,
        font_style: field.config.font_style,
        text_align: field.config.text_align,
        max_width: field.config.max_width,
        color: { ...field.config.color },
        // Solo guardar prefix para campos que lo soportan
        prefix: this.hasEditablePrefix(field.name) ? field.config.prefix : null
      };
    });

    this.dialogRef.close(campos);
  }
}
