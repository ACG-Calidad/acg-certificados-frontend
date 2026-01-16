import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PendingUser } from '@core/models/pending-user.model';

interface DialogData {
  users: PendingUser[];
}

@Component({
  selector: 'app-approve-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>verified</mat-icon>
      Confirmar Aprobación
    </h2>

    <mat-dialog-content>
      <p class="confirm-message">
        ¿Está seguro que desea aprobar y generar certificados para
        <strong>{{ data.users.length }}</strong> usuario(s)?
      </p>

      <div class="users-summary">
        <div class="summary-header">Usuarios seleccionados:</div>
        <ul class="users-list">
          <li *ngFor="let user of displayedUsers">
            <span class="user-name">{{ user.firstname }} {{ user.lastname }}</span>
            <span class="course-name">{{ user.course_shortname }}</span>
          </li>
        </ul>
        <p class="more-users" *ngIf="data.users.length > 5">
          ... y {{ data.users.length - 5 }} más
        </p>
      </div>

      <div class="warning-box">
        <mat-icon>info</mat-icon>
        <span>Esta acción generará los certificados y los dejará listos para descarga.</span>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">
        <mat-icon>check</mat-icon>
        Aprobar y Generar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 16px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);

      mat-icon {
        color: #0066cc;
      }
    }

    mat-dialog-content {
      padding: 24px !important;
      min-width: 400px;
    }

    .confirm-message {
      margin: 0 0 16px;
      font-size: 16px;

      strong {
        color: #0066cc;
      }
    }

    .users-summary {
      background-color: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .summary-header {
      font-weight: 500;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.87);
    }

    .users-list {
      margin: 0;
      padding: 0;
      list-style: none;

      li {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);

        &:last-child {
          border-bottom: none;
        }
      }

      .user-name {
        color: rgba(0, 0, 0, 0.87);
      }

      .course-name {
        color: rgba(0, 0, 0, 0.6);
        font-size: 13px;
      }
    }

    .more-users {
      margin: 8px 0 0;
      font-size: 13px;
      color: rgba(0, 0, 0, 0.6);
      font-style: italic;
    }

    .warning-box {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      color: #1976d2;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      span {
        font-size: 14px;
      }
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid rgba(0, 0, 0, 0.12);

      button mat-icon {
        margin-right: 4px;
      }
    }
  `]
})
export class ApproveDialogComponent {
  displayedUsers: PendingUser[];

  constructor(
    public dialogRef: MatDialogRef<ApproveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.displayedUsers = data.users.slice(0, 5);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
