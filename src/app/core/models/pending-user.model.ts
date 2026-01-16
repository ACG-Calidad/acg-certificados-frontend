export interface PendingUser {
  userid: number;
  firstname: string;
  lastname: string;
  email: string;
  idnumber: string;
  course_id: number;
  course_name: string;
  course_shortname: string;
  grade: number | null;
  grade_date: number;
  grade_date_formatted: string;
}

export interface PendingUsersResponse {
  success: boolean;
  data: {
    pending_users: PendingUser[];
    total: number;
  };
  error?: string;
}

export interface ApproveUsersRequest {
  users: {
    userid: number;
    course_id: number;
  }[];
}

export interface ApproveUsersResponse {
  success: boolean;
  data?: {
    approved: number;
    certificates_created: number;
  };
  error?: string;
}
