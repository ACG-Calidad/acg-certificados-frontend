import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background-color: #f5f5f5;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'ACG Certificados';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Capturar el token SSO de la URL si existe
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.validateToken(token);
      }
    });
  }

  private validateToken(token: string): void {
    this.authService.validateToken(token).subscribe({
      next: (response) => {
        if (response.valid) {
          console.log('Token validado correctamente:', response);
          // Redirigir a la lista de certificados
          this.router.navigate(['/'], { replaceUrl: true });
        } else {
          console.error('Token inválido:', response.error);
          // Redirigir a validación de certificados si el token es inválido
          this.router.navigate(['/validar'], { replaceUrl: true });
        }
      },
      error: (error) => {
        console.error('Error validando token:', error);
        // Redirigir a validación de certificados en caso de error
        this.router.navigate(['/validar'], { replaceUrl: true });
      }
    });
  }
}
