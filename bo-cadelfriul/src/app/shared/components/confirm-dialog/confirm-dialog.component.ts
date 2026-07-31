import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
          <h3 class="text-lg font-semibold text-brand-text font-heading mb-2">{{ title }}</h3>
          <p class="text-brand-muted mb-6">{{ message }}</p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-sm font-medium text-brand-text bg-brand-secondary hover:opacity-80 rounded-lg"
              (click)="cancel.emit()">
              Cancel
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-brand-destructive bg-brand-destructive/10 hover:bg-brand-destructive/20 rounded-lg"
              (click)="confirm.emit()">
              Delete
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirm';
  @Input() message = 'Are you sure?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
