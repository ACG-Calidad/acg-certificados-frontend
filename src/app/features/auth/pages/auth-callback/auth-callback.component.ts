import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="auth-callback-container">
      <div class="auth-card">
        <!-- Loading State -->
        <div *ngIf="loading" class="state-container">
          <mat-spinner diameter="60"></mat-spinner>
          <h2>Validando credenciales...</h2>
          <p>Por favor espere mientras verificamos su identidad</p>
        </div>

        <!-- Error State -->
        <div *ngIf="error" class="state-container error">
          <mat-icon>error_outline</mat-icon>
          <h2>Error de autenticación</h2>
          <p>{{ error }}</p>
          <button mat-raised-button color="primary" (click)="goToValidation()">
            Ir a validación de certificados
          </button>
          <button mat-button (click)="goToMoodle()">
            Volver a Moodle
          </button>
        </div>

        <!-- Success State (brief) -->
        <div *ngIf="success" class="state-container success">
          <mat-icon>check_circle</mat-icon>
          <h2>¡Bienvenido!</h2>
          <p>Redirigiendo a sus certificados...</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0066CC 0%, #004999 100%);
      padding: 24px;
    }

    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    }

    .state-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;

      mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
      }

      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
      }

      p {
        margin: 0;
        color: rgba(0, 0, 0, 0.6);
        font-size: 14px;
      }

      button {
        margin-top: 8px;
      }

      &.error mat-icon {
        color: #EF4444;
      }

      &.success mat-icon {
        color: #10B981;
      }
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  loading = true;
  error: string | null = null;
  success = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.processToken();
  }

  private processToken(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('moodle_token');

    // Si no hay token, verificar si ya está autenticado
    if (!token) {
      if (this.authService.isAuthenticated()) {
        // Ya autenticado, ir a certificados
        console.log('👤 [AuthCallback] Usuario ya autenticado, redirigiendo a certificados');
        this.router.navigate(['/certificates'], { replaceUrl: true });
      } else {
        // No autenticado y sin token, ir a validación
        console.log('⚠️ [AuthCallback] Sin token y sin sesión, redirigiendo a validación');
        this.router.navigate(['/validar'], { replaceUrl: true });
      }
      return;
    }

    console.log('🎫 [AuthCallback] Procesando token:', token);

    this.authService.validateToken(token).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.valid) {
          console.log('✅ [AuthCallback] Token válido, usuario:', response);
          this.success = true;
          // Redirigir después de un breve delay para mostrar el estado de éxito
          setTimeout(() => {
            this.router.navigate(['/certificates'], { replaceUrl: true });
          }, 1000);
        } else {
          console.error('❌ [AuthCallback] Token inválido:', response.error);
          this.error = response.error || 'El token de autenticación no es válido o ha expirado.';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ [AuthCallback] Error validando token:', error);
        this.error = 'Error al comunicarse con el servidor de autenticación.';
      }
    });
  }

  goToValidation(): void {
    this.router.navigate(['/validar']);
  }

  goToMoodle(): void {
    window.location.href = 'http://localhost:8082';
  }
}
