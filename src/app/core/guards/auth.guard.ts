import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

/**
 * Guard para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirigir a página de error o login si no está autenticado
  console.warn('Usuario no autenticado, redirigiendo...');
  router.navigate(['/']);
  return false;
};

/**
 * Guard para proteger rutas que requieren rol de gestor
 */
export const gestorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasAnyRole(['gestor', 'admin'])) {
    return true;
  }

  console.warn('Acceso denegado: se requiere rol de gestor o admin');
  router.navigate(['/']);
  return false;
};

/**
 * Guard para proteger rutas que requieren rol de administrador
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('admin')) {
    return true;
  }

  console.warn('Acceso denegado: se requiere rol de admin');
  router.navigate(['/']);
  return false;
};
