/**
 * Modelos para el módulo de Plantillas de Certificados
 */

/**
 * Alineación de texto permitida
 */
export type TextAlign = 'left' | 'center' | 'right';

/**
 * Estilos de fuente permitidos
 */
export type FontStyle = 'normal' | 'bold' | 'italic' | 'underline';

/**
 * Familias de fuentes disponibles
 * El backend soporta fuentes estándar FPDF y personalizadas:
 * - arial, times, courier: Fuentes estándar FPDF
 * - cinzel, norms: Fuentes TTF personalizadas (Cinzel, TT Norms)
 */
export type FontFamily = 'arial' | 'times' | 'courier' | 'cinzel' | 'norms';

/**
 * Opciones de fuente para el selector del editor visual
 * Las fuentes personalizadas (Cinzel, TT Norms) están disponibles en el backend
 */
export const FONT_FAMILIES: Array<{ value: FontFamily; label: string }> = [
  { value: 'arial', label: 'Arial' },
  { value: 'times', label: 'Times' },
  { value: 'courier', label: 'Courier' },
  { value: 'cinzel', label: 'Cinzel' },
  { value: 'norms', label: 'TT Norms' }
];

/**
 * Tamaños de fuente disponibles
 */
export const FONT_SIZES = [5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 32, 36, 48] as const;
export type FontSize = typeof FONT_SIZES[number];

/**
 * Configuración de posición y estilo de un campo en la plantilla
 */
export interface TemplateFieldConfig {
  pos_x: number;
  pos_y: number;
  font_size: number;
  font_family: FontFamily;
  font_style: FontStyle;
  text_align: TextAlign;
  max_width: number | null;
  color: {
    r: number;
    g: number;
    b: number;
  };
  prefix?: string | null;
}

/**
 * Mapa de campos configurados para una plantilla
 */
export type TemplateFields = Record<string, TemplateFieldConfig>;

/**
 * Campos disponibles con sus descripciones
 */
export type AvailableFields = Record<string, string>;

/**
 * Dimensiones del PDF en milímetros
 */
export interface PdfDimensions {
  width: number;
  height: number;
}

/**
 * Plantilla de certificado
 */
export interface Template {
  id: number;
  tipo: 'base' | 'curso';
  courseid: number | null;
  course_name?: string;
  course_shortname?: string;
  nombre: string;
  archivo: string;
  archivo_size: number;
  archivo_size_formatted?: string;
  imagen_preview?: string | null;
  version: number;
  activo: boolean;
  uploaded_by: number;
  uploaded_by_name?: string;
  uploaded_by_lastname?: string;
  created_at: number;
  updated_at: number;
  updated_at_formatted?: string;
  campos?: TemplateFields;
  available_fields?: AvailableFields;
  pdf_dimensions?: PdfDimensions | null;
}

/**
 * Curso sin plantilla configurada
 */
export interface CourseWithoutTemplate {
  courseid: number;
  course_name: string;
  course_shortname: string;
}

/**
 * Respuesta del endpoint GET /admin/templates
 */
export interface TemplatesResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
  data: {
    base_template: Template | null;
    course_templates: Template[];
    courses_without_template: CourseWithoutTemplate[];
    second_page_fields?: TemplateFields;
  };
}

/**
 * Respuesta del endpoint POST upload de plantilla
 */
export interface TemplateUploadResponse {
  success: boolean;
  message?: string;
  data: Template;
}

/**
 * Respuesta del endpoint PUT /admin/templates/{id}/fields
 */
export interface SaveFieldsResponse {
  success: boolean;
  message?: string;
  data: {
    template_id: number;
    campos: TemplateFields;
  };
}

/**
 * Respuesta del endpoint GET /admin/templates/available-fields
 */
export interface AvailableFieldsResponse {
  success: boolean;
  data: {
    base: AvailableFields;
    curso: AvailableFields;
  };
}

/**
 * Datos para el diálogo de upload
 */
export interface UploadDialogData {
  type: 'base' | 'curso';
  courseid?: number;
  courseName?: string;
  existingTemplate?: Template;
}

/**
 * Datos para el diálogo de edición de campos
 */
export interface FieldEditorDialogData {
  template: Template;
  availableFields: AvailableFields;
}

/**
 * Valor por defecto para un campo nuevo
 */
export const DEFAULT_FIELD_CONFIG: TemplateFieldConfig = {
  pos_x: 100,
  pos_y: 100,
  font_size: 12,
  font_family: 'arial',
  font_style: 'normal',
  text_align: 'left',
  max_width: null,
  color: { r: 0, g: 0, b: 0 },
  prefix: null
};

/**
 * Datos de ejemplo para campos (usados en el editor visual)
 */
export const SAMPLE_FIELD_DATA: Record<string, string> = {
  participante: 'NOMBRE APELLIDO PARTICIPANTE',
  documento: '1234567890',
  curso: 'Nombre del curso virtual de ejemplo',
  intensidad: '40 HORAS',
  fecha: 'Enero de 2026',
  certificado_id: 'CV-3490',
  certificado_id_pagina2: 'CV-3490'
};

/**
 * Prefijos por defecto para campos que los soportan
 */
export const DEFAULT_PREFIXES: Record<string, string> = {
  curso: 'EN EL CURSO ',
  fecha: 'BOGOTÁ, COLOMBIA, '
};

/**
 * Campos que permiten edición de prefijo
 */
export const FIELDS_WITH_PREFIX = ['curso', 'fecha'];

/**
 * Campos que NO son editables (contenido fijo)
 */
export const NON_EDITABLE_FIELDS = ['certificado_id', 'intensidad', 'certificado_id_pagina2'];

/**
 * Datos para el diálogo visual de edición de campos
 */
export interface VisualFieldEditorDialogData {
  template: Template;
  availableFields: AvailableFields;
  previewImageUrl: string;
  courses?: Array<{ id: number; name: string }>;
  isSecondPage?: boolean;
}
