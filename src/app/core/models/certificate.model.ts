export interface Certificate {
  id: number;
  numero_certificado: string;
  fecha_emision: number;
  fecha_emision_formatted: string;
  intensidad: number;
  calificacion: number;
  estado: string;
  course_name: string;
  course_shortname: string;
}

export interface CertificateListResponse {
  success: boolean;
  timestamp?: string;
  data: {
    certificates: Certificate[];
    total: number;
  };
  error?: string;
}

export interface CertificateValidationResponse {
  valid: boolean;
  certificate?: Certificate;
  error?: string;
}
