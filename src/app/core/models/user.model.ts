export interface User {
  userid: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: 'student' | 'gestor' | 'admin';
}

export interface TokenValidationResponse {
  valid: boolean;
  error: string;
  userid: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
}
