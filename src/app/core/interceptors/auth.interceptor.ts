import { HttpInterceptorFn } from '@angular/common/http';

const STORAGE_KEY = 'acg_user_session';

/**
 * Interceptor para agregar información del usuario autenticado en las solicitudes HTTP.
 * Agrega el header X-User-Id para que el backend sepa quién realiza la acción.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storedUser = localStorage.getItem(STORAGE_KEY);

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user?.userid) {
        const clonedReq = req.clone({
          setHeaders: {
            'X-User-Id': user.userid.toString(),
            'X-User-Name': `${user.firstname || ''} ${user.lastname || ''}`.trim(),
            'X-User-Role': user.role || ''
          }
        });
        return next(clonedReq);
      }
    } catch (e) {
      console.error('Error parsing user session:', e);
    }
  }

  return next(req);
};
