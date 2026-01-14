export interface Certificate {
  id: number;
  nombre: string;
  curso: string;
  fecha_emision: string;
  codigo_verificacion: string;
  estado: 'pending' | 'approved' | 'rejected';
  pdf_path?: string;
  fecha_aprobacion?: string;
  comentarios?: string;
}

export interface CertificateListResponse {
  success: boolean;
  data: Certificate[];
  error?: string;
}

export interface CertificateValidationResponse {
  valid: boolean;
  certificate?: Certificate;
  error?: string;
}
