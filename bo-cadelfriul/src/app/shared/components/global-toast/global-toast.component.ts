import { Component, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService, Toast } from '../../../core/services/ui.service';

@Component({
  selector: 'app-global-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      @for (toast of toasts; track toast.id) {
        <div
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg min-w-[280px] max-w-[400px] animate-slide-in shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
          [ngClass]="{
            'bg-[#f8f4ef] border border-brand-primary text-brand-text': toast.type === 'success',
            'bg-red-50 border border-red-300 text-red-800': toast.type === 'error',
            'bg-blue-50 border border-blue-300 text-blue-800': toast.type === 'info'
          }">
          <span class="text-lg">
            @switch (toast.type) {
              @case ('success') { &#10003; }
              @case ('error') { &#10007; }
              @case ('info') { &#8505; }
            }
          </span>
          <div class="flex-1">
            @if (toast.title) {
              <p class="font-medium text-sm">{{ toast.title }}</p>
            }
            <p class="text-sm">{{ toast.message }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `],
})
export class GlobalToastComponent {
  private readonly ui = inject(UiService);
  private readonly cdr = inject(ChangeDetectorRef);
  toasts: Toast[] = [];

  constructor() {
    this.ui.toasts$.subscribe((t) => {
      this.toasts = t;
      this.cdr.markForCheck();
    });
  }
}
