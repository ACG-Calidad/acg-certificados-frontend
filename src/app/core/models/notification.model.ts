export interface PendingNotification {
  certificate_id: number;
  numero_certificado: string;
  userid: number;
  firstname: string;
  lastname: string;
  email: string;
  course_id: number;
  course_name: string;
  course_shortname: string;
  grade: number;
  fecha_emision: string;
  created_at: string;
}

export interface PendingNotificationsResponse {
  success: boolean;
  data?: {
    certificates: PendingNotification[];
    total: number;
  };
  error?: string;
}

export interface SendNotificationsRequest {
  certificate_ids: number[];
}

export interface SendNotificationsResponse {
  success: boolean;
  data?: {
    sent: number;
    failed: number;
    errors?: string[];
  };
  error?: string;
}

export interface NotificationLog {
  id: number;
  certificate_id: number;
  numero_certificado: string;
  recipient_email: string;
  recipient_name: string;
  sent_at: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string;
}

export interface NotificationLogsResponse {
  success: boolean;
  data?: {
    logs: NotificationLog[];
    total: number;
  };
  error?: string;
}
