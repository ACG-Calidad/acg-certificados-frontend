# Frontend - Sistema de Certificados ACG

Frontend Angular 21 para la gestión de certificados de ACG Calidad.

## Tecnologías

- **Framework**: Angular 21
- **UI**: Angular Material 21
- **Estilos**: SCSS + Material Design
- **HTTP**: HttpClient
- **Routing**: Angular Router con guards
- **State**: RxJS + Services

## Arquitectura

```
src/app/
├── core/              # Servicios singleton, guards, interceptors
├── features/          # Módulos por funcionalidad
├── shared/            # Componentes, pipes, directivas compartidas
└── app.routes.ts      # Configuración de rutas
```

## Flujo de Autenticación

1. Usuario hace clic en "Mis Certificados" en Moodle
2. Plugin genera token SSO y redirige: `http://localhost:4200/?token=xxx`
3. **Angular captura el token de la URL**
4. **Angular llama directamente al Web Service de Moodle** para validar:
   ```
   GET http://localhost:8082/webservice/rest/server.php
     ?wstoken=bd327edf1c4e86ee7276600be6190ae2
     &wsfunction=local_certificados_sso_validate_token
     &moodlewsrestformat=json
     &token=xxx
   ```
5. Moodle responde con datos del usuario (userid, nombre, email, rol)
6. Angular guarda la sesión en localStorage
7. Angular llama al backend para obtener certificados: `GET /certificates/user/{userid}`

## Instalación

```bash
cd frontend
npm install
```

## Desarrollo

```bash
npm start
# Abre http://localhost:4200
```

## Build Producción

```bash
npm run build
# Los archivos se generan en dist/
```

## Despliegue en Green

El frontend se despliega en:
```
/var/www/html/certificados/app/
```

Accesible en:
```
https://aulavirtual.acgcalidad.co/certificados/
```

## Variables de Entorno

### Desarrollo (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082/certificados/api',
  moodleUrl: 'http://localhost:8082',
  moodleWsToken: 'bd327edf1c4e86ee7276600be6190ae2'
};
```

### Producción (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://aulavirtual.acgcalidad.co/certificados/api',
  moodleUrl: 'https://aulavirtual.acgcalidad.co',
  moodleWsToken: 'TOKEN_REAL_DE_PRODUCCION'
};
```

## Estructura de Rutas

- `/` - Lista de certificados (requiere auth)
- `/validar` - Validación pública de certificados
- `/management/pending` - Usuarios pendientes (requiere rol gestor)
- `/admin/dashboard` - Dashboard administrativo (requiere rol admin)

## Servicios Principales

### AuthService
- `validateToken(token: string)`: Valida token SSO contra Moodle
- `getUserData()`: Obtiene datos del usuario actual
- `logout()`: Cierra sesión

### CertificateService
- `getUserCertificates(userId: number)`: Lista certificados
- `downloadPdf(id: number)`: Descarga PDF
- `validateCertificate(id: string)`: Validación pública

## Desarrollo

Ver [FLUJO-AUTENTICACION.md](../docs/FLUJO-AUTENTICACION.md) para más detalles sobre el flujo de autenticación.
