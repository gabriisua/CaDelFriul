import { Component, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService, ConfirmState } from '../../../core/services/ui.service';

@Component({
  selector: 'app-global-confirm',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (state.isOpen) {
      <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
          <h3 class="text-lg font-semibold text-brand-text font-heading mb-2">{{ state.title }}</h3>
          <p class="text-brand-muted mb-6">{{ state.message }}</p>
          <div class="flex justify-end gap-3">
            <button
              class="px-4 py-2 text-sm font-medium text-brand-text bg-brand-secondary hover:opacity-80 rounded-lg"
              (click)="onCancel()">
              Cancel
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-brand-destructive bg-brand-destructive/10 hover:bg-brand-destructive/20 rounded-lg"
              (click)="onConfirm()">
              Confirm
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class GlobalConfirmComponent {
  private readonly ui = inject(UiService);
  private readonly cdr = inject(ChangeDetectorRef);
  state: ConfirmState = { isOpen: false, title: '', message: '' };

  constructor() {
    this.ui.confirm$.subscribe((s) => {
      this.state = s;
      this.cdr.markForCheck();
    });
  }

  onConfirm(): void {
    this.ui.resolveConfirm(true);
  }

  onCancel(): void {
    this.ui.resolveConfirm(false);
  }
}
