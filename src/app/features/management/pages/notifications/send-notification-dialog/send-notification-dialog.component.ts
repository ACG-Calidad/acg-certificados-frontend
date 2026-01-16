import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PendingNotification } from '@core/models/notification.model';

interface DialogData {
  notifications: PendingNotification[];
}

@Component({
  selector: 'app-send-notification-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>send</mat-icon>
      Confirmar Envío de Notificaciones
    </h2>

    <mat-dialog-content>
      <p class="confirmation-text">
        ¿Está seguro que desea enviar notificaciones a los siguientes
        <strong>{{ data.notifications.length }}</strong> participante(s)?
      </p>

      <div class="recipients-list">
        @for (notification of data.notifications; track notification.certificate_id) {
          <div class="recipient-item">
            <div class="recipient-info">
              <span class="certificate">{{ notification.numero_certificado }}</span>
              <span class="name">{{ notification.firstname }} {{ notification.lastname }}</span>
            </div>
            <span class="email">{{ notification.email }}</span>
          </div>
        }
      </div>

      <div class="info-box">
        <mat-icon>info</mat-icon>
        <span>
          Se enviará un correo electrónico a cada participante con la información
          de su certificado y las instrucciones para descargarlo.
        </span>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">
        <mat-icon>send</mat-icon>
        Enviar Notificaciones
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;

      mat-icon {
        color: #0066CC;
      }
    }

    .confirmation-text {
      margin-bottom: 16px;
      color: rgba(0, 0, 0, 0.7);
    }

    .recipients-list {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .recipient-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);

      &:last-child {
        border-bottom: none;
      }

      .recipient-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .certificate {
          font-family: 'Roboto Mono', monospace;
          font-size: 12px;
          color: #0066CC;
        }

        .name {
          font-weight: 500;
        }
      }

      .email {
        color: rgba(0, 0, 0, 0.6);
        font-size: 13px;
      }
    }

    .info-box {
      display: flex;
      gap: 12px;
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 4px;

      mat-icon {
        color: #1976d2;
        flex-shrink: 0;
      }

      span {
        color: rgba(0, 0, 0, 0.7);
        font-size: 13px;
        line-height: 1.5;
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }
  `]
})
export class SendNotificationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SendNotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
