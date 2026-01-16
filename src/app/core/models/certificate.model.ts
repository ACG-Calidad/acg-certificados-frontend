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
  participant_name?: string; // Solo presente en respuestas de validación pública
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
  success: boolean;
  message?: string;
  timestamp?: string;
  data: {
    valid: boolean;
    certificate?: Certificate;
  };
}
