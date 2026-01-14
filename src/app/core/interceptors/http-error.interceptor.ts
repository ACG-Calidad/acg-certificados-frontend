import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor para manejar errores HTTP globalmente
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 401:
            errorMessage = 'No autorizado. Por favor inicie sesión nuevamente.';
            // Opcional: redirigir al login o limpiar sesión
            break;
          case 403:
            errorMessage = 'No tiene permisos para acceder a este recurso.';
            break;
          case 404:
            errorMessage = 'El recurso solicitado no fue encontrado.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Por favor intente más tarde.';
            break;
          default:
            errorMessage = error.error?.error || error.message || errorMessage;
        }
      }

      console.error('Error HTTP:', {
        status: error.status,
        message: errorMessage,
        url: error.url
      });

      // TODO: Integrar con servicio de notificaciones/snackbar
      return throwError(() => new Error(errorMessage));
    })
  );
};
