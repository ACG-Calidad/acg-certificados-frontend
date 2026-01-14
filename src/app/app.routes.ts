import { Routes } from '@angular/router';
import { authGuard, gestorGuard, adminGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    // Ruta de entrada: procesa el token SSO si existe, o redirige a validación
    path: '',
    loadComponent: () => import('./features/auth/pages/auth-callback/auth-callback.component')
      .then(m => m.AuthCallbackComponent)
  },
  {
    // Lista de certificados del usuario (requiere autenticación)
    path: 'certificates',
    loadComponent: () => import('./features/certificates/pages/certificate-list/certificate-list.component')
      .then(m => m.CertificateListComponent),
    canActivate: [authGuard]
  },
  {
    // Validación pública de certificados (no requiere autenticación)
    path: 'validar',
    loadComponent: () => import('./features/validation/pages/certificate-validation/certificate-validation.component')
      .then(m => m.CertificateValidationComponent)
  },
  {
    path: 'management',
    canActivate: [gestorGuard],
    children: [
      {
        path: 'pending',
        loadComponent: () => import('./features/management/pages/pending-users/pending-users.component')
          .then(m => m.PendingUsersComponent)
      },
      {
        path: '',
        redirectTo: 'pending',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/pages/admin-dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
