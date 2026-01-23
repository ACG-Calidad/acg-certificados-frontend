import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SettingsService } from '@core/services/settings.service';
import { SystemSettings } from '@core/models/settings.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  loading = true;
  saving = false;
  error: string | null = null;

  settings: SystemSettings = {
    default_intensity: 40,
    default_template_id: 1,
    certificate_prefix: 'CV-',
    notification_email: '',
    email_from_name: '',
    cron_execution_time: '07:00',
    gas_webhook_url: '',
    gas_enabled: false,
    validation_url: ''
  };

  originalSettings: SystemSettings | null = null;

  constructor(
    private settingsService: SettingsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.error = null;

    this.settingsService.getSettings().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.settings = response.data;
          this.originalSettings = { ...response.data };
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando configuración:', error);
        this.error = 'Error al cargar la configuración';
        this.loading = false;
      }
    });
  }

  saveSettings(): void {
    this.saving = true;

    this.settingsService.updateSettings(this.settings).subscribe({
      next: (response) => {
        if (response.success) {
          this.originalSettings = { ...this.settings };
          this.snackBar.open('Configuración guardada correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Error guardando configuración:', error);
        this.snackBar.open('Error al guardar la configuración', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
        this.saving = false;
      }
    });
  }

  resetSettings(): void {
    if (this.originalSettings) {
      this.settings = { ...this.originalSettings };
    }
  }

  hasChanges(): boolean {
    if (!this.originalSettings) return false;
    return JSON.stringify(this.settings) !== JSON.stringify(this.originalSettings);
  }

  copyValidationUrl(): void {
    navigator.clipboard.writeText(this.settings.validation_url).then(() => {
      this.snackBar.open('URL copiada al portapapeles', 'Cerrar', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    });
  }
}
