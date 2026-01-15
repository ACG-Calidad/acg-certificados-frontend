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
    // Validación pública de certificados (no requiere autenticación)
    path: 'validar',
    loadComponent: () => import('./features/validation/pages/certificate-validation/certificate-validation.component')
      .then(m => m.CertificateValidationComponent)
  },
  {
    // Rutas protegidas con layout principal (Header + Sidebar)
    path: '',
    loadComponent: () => import('./shared/layouts/main-layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/pages/admin-dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent),
        canActivate: [gestorGuard]
      },
      {
        path: 'certificates',
        loadComponent: () => import('./features/certificates/pages/certificate-list/certificate-list.component')
          .then(m => m.CertificateListComponent)
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
            path: 'generate',
            loadComponent: () => import('./features/management/pages/generate-certificates/generate-certificates.component')
              .then(m => m.GenerateCertificatesComponent)
          },
          {
            path: 'notifications',
            loadComponent: () => import('./features/management/pages/notifications/notifications.component')
              .then(m => m.NotificationsComponent)
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
            path: 'reports',
            loadComponent: () => import('./features/admin/pages/reports/reports.component')
              .then(m => m.ReportsComponent)
          },
          {
            path: 'templates',
            loadComponent: () => import('./features/admin/pages/templates/templates.component')
              .then(m => m.TemplatesComponent)
          },
          {
            path: 'settings',
            loadComponent: () => import('./features/admin/pages/settings/settings.component')
              .then(m => m.SettingsComponent)
          },
          {
            path: '',
            redirectTo: 'reports',
            pathMatch: 'full'
          }
        ]
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
