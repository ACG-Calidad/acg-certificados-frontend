import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '@environments/environment';
import { User, TokenValidationResponse } from '@core/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'acg_user_session';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = this.getStoredUser();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Valida un token SSO directamente contra el Web Service de Moodle
   * @param token Token SSO generado por el plugin de Moodle
   * @returns Observable con los datos del usuario si el token es válido
   */
  validateToken(token: string): Observable<TokenValidationResponse> {
    const params = new HttpParams()
      .set('wstoken', environment.moodleWsToken)
      .set('wsfunction', 'local_certificados_sso_validate_token')
      .set('moodlewsrestformat', 'json')
      .set('token', token);

    const url = `${environment.moodleUrl}/webservice/rest/server.php`;

    console.log('🔐 [AuthService] Validando token SSO...');
    console.log('📍 URL:', url);
    console.log('📋 Params:', params.toString());

    return this.http.get<TokenValidationResponse>(url, { params }).pipe(
      tap(response => {
        console.log('✅ [AuthService] Respuesta de Moodle:', response);
        if (response.valid) {
          const user: User = {
            userid: response.userid,
            username: response.username,
            firstname: response.firstname,
            lastname: response.lastname,
            email: response.email,
            role: response.role as 'student' | 'gestor' | 'admin'
          };
          this.setSession(user);
          console.log('👤 [AuthService] Usuario autenticado:', user);
        } else {
          console.error('❌ [AuthService] Token inválido:', response.error);
        }
      })
    );
  }

  /**
   * Guarda la sesión del usuario en localStorage
   */
  private setSession(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Obtiene los datos del usuario almacenados
   */
  private getStoredUser(): User | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Retorna los datos del usuario actual
   */
  getUserData(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: 'student' | 'gestor' | 'admin'): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && user.role === role;
  }

  /**
   * Verifica si el usuario tiene al menos uno de los roles especificados
   */
  hasAnyRole(roles: ('student' | 'gestor' | 'admin')[]): boolean {
    const user = this.currentUserSubject.value;
    return user !== null && roles.includes(user.role);
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
  }
}
