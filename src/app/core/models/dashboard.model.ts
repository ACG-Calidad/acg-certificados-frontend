export interface DashboardStats {
  total_certificates: number;
  pending_certificates: number;
  this_month_certificates: number;
  pending_notifications: number;
}

export interface MonthlyData {
  month: string;
  count: number;
}

export interface TopCourse {
  course_id: number;
  course_name: string;
  course_shortname: string;
  certificate_count: number;
}

export interface RecentActivity {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  user_name?: string;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    stats: DashboardStats;
    monthly_data: MonthlyData[];
    top_courses: TopCourse[];
    recent_activity: RecentActivity[];
  };
  error?: string;
}
