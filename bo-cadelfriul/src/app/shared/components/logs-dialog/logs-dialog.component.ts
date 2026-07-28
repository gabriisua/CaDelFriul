import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logs-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[80vh] flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-brand-text font-heading">{{ title }}</h3>
            <button class="text-brand-muted hover:text-brand-text text-xl leading-none" (click)="close.emit()">&times;</button>
          </div>

          <div class="flex-1 overflow-y-auto">
            @if (logs.length === 0) {
              <div class="text-center py-8">
                <p class="text-brand-muted">No logs available</p>
              </div>
            } @else {
              <table class="w-full text-sm text-left">
                <thead class="text-xs text-brand-muted uppercase bg-brand-secondary/30">
                  <tr>
                    <th class="px-4 py-3">Action</th>
                    <th class="px-4 py-3">Details</th>
                    <th class="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-brand-border">
                  @for (log of logs; track log.id) {
                    <tr>
                      <td class="px-4 py-3 text-brand-text">{{ log.action }}</td>
                      <td class="px-4 py-3 text-brand-text">{{ log.details }}</td>
                      <td class="px-4 py-3 text-brand-muted">{{ log.timestamp | date:'medium' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>

          <div class="flex justify-end mt-4">
            <button class="px-4 py-2 text-sm font-medium text-brand-text bg-brand-secondary hover:opacity-80 rounded-lg" (click)="close.emit()">Close</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class LogsDialogComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() logs: any[] = [];
  @Output() close = new EventEmitter<void>();
}
