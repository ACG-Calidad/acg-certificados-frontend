export interface SystemSettings {
  // Certificados
  default_intensity: number;          // Intensidad horaria por defecto
  default_template_id: number;        // ID de plantilla por defecto
  certificate_prefix: string;         // Prefijo para números de certificado (ej: CV-)

  // Notificaciones
  notification_email: string;         // Email del gestor de certificados
  email_from_name: string;            // Nombre del remitente
  cron_execution_time: string;        // Hora de ejecución del cron (HH:mm)

  // Google Apps Script
  gas_webhook_url: string;            // URL del webhook de GAS
  gas_api_key: string;                // API Key para autenticación con GAS
  gas_enabled: boolean;               // Si está habilitada la integración

  // Validación pública
  validation_url: string;             // URL pública de validación de certificados
}

export interface SettingsResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
  data: SystemSettings;
}

export interface UpdateSettingsResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
  data: {
    updated: boolean;
    settings: SystemSettings;
  };
}
