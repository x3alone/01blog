import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (confirmationService.confirmation()) {
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>{{ confirmationService.confirmation()?.title }}</h3>
          <p>{{ confirmationService.confirmation()?.message }}</p>
          <div class="modal-actions">
            <button class="btn-cancel" (click)="confirmationService.confirmation()?.reject && confirmationService.confirmation()?.reject!()">Cancel</button>
            <button class="btn-confirm" (click)="confirmationService.confirmation()?.accept()">Confirm</button>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }

    .modal-content {
      background: rgb(255 255 255 / 5%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 24px;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      color: white;
      text-align: center;
    }

    h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 1.25rem;
      font-weight: 600;
    }

    p {
      color: #cbd5e1;
      margin-bottom: 24px;
    }

    .modal-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    button {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-cancel {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #e2e8f0;
    }
    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .btn-confirm {
      background: linear-gradient(-30deg, #009860, rgba(255, 255, 255, 0.2));
      color: white;
    }
    .btn-confirm:hover {
      box-shadow: 0 0 10px  rgba(94, 177, 94, 1)
    }
  `]
})
export class ConfirmationModalComponent {
    confirmationService = inject(ConfirmationService);
}
