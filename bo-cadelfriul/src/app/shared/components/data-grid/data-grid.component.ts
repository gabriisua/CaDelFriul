import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

export interface GridColumn {
  header: string;
  field: string;
  type?: 'text' | 'date' | 'currency' | 'status' | 'number' | 'boolean' | 'image';
}

export interface GridAction {
  label: string;
  icon: string;
  action: (row: any) => void;
}

@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white/80 rounded-xl shadow overflow-hidden">
      <table class="min-w-full divide-y divide-brand-border">
        <thead class="bg-brand-secondary/30">
        <tr>
          @for (col of columns; track col.field) {
            <th class="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider font-heading">
              {{ col.header }}
            </th>
          }
          @if (actions.length > 0) {
            <th class="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider font-heading">
              Actions
            </th>
          }
        </tr>
        </thead>
        <tbody class="bg-white divide-y divide-brand-border">
          @for (row of data; track row.id) {
            <tr class="hover:bg-brand-bg/50">
              @for (col of columns; track col.field) {
                <td class="px-6 py-4 whitespace-nowrap text-sm text-brand-text">
                  @if (col.type === 'date') {
                    {{ row[col.field] | date:'medium' }}
                  } @else if (col.type === 'currency') {
                    {{ row[col.field] | currency:'EUR' }}
                  } @else if (col.type === 'status') {
                    <span [class]="getStatusClass(row[col.field])">
                      {{ row[col.field] }}
                    </span>
                  } @else if (col.type === 'boolean') {
                    @if (row[col.field]) {
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Yes
                      </span>
                    } @else {
                      <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        No
                      </span>
                    }
                  } @else if (col.type === 'image') {
                    @if (row[col.field] && row[col.field].length > 0) {
                      <img [src]="getImageUrl(row[col.field])" class="h-10 w-10 rounded object-cover"/>
                    } @else {
                      <div class="h-10 w-10 rounded bg-brand-secondary flex items-center justify-center">
                        <span class="text-brand-muted text-xs">No img</span>
                      </div>
                    }
                  } @else {
                    {{ row[col.field] }}
                  }
                </td>
              }
              @if (actions.length > 0) {
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  @for (act of actions; track act.label) {
                    <button
                      (click)="act.action(row)"
                      class="mr-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-brand-text bg-brand-primary hover:opacity-80 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-ring"
                    >
                      {{ act.label }}
                    </button>
                  }
                </td>
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DataGridComponent {
  @Input() data: any[] = [];
  @Input() columns: GridColumn[] = [];
  @Input() actions: GridAction[] = [];

  environment = environment;

  getStatusClass(status: string): string {
    const base = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'PENDING':
        return `${base} bg-yellow-100 text-yellow-800`;
      case 'PAID':
        return `${base} bg-blue-100 text-blue-800`;
      case 'PROCESSING':
        return `${base} bg-indigo-100 text-indigo-800`;
      case 'SHIPPED':
        return `${base} bg-purple-100 text-purple-800`;
      case 'DELIVERED':
        return `${base} bg-green-100 text-green-800`;
      case 'CANCELLED':
        return `${base} bg-red-100 text-red-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  }
  getImageUrl(value: any): string {
    if (!value) return '';

    // Gestiamo sia un Array (il nostro nuovo imageUrls) sia una Stringa singola
    const imgPath = Array.isArray(value) ? value[0] : value;

    if (!imgPath) return '';

    // Se l'URL è già pulito e completo dal backend (inizia con /api/)
    if (imgPath.startsWith('/api/')) {
      return this.environment.apiUrl + imgPath;
    }

    // Fallback di sicurezza se arriva solo il nome del file
    return this.environment.apiUrl + '/api/products/images/' + imgPath;
  }
}
