import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  title?: string;
}

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  resolve?: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly toastsSubject = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  private readonly confirmSubject = new BehaviorSubject<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
  });
  readonly confirm$ = this.confirmSubject.asObservable();

  constructor(private readonly ngZone: NgZone) {}

  showToast(type: Toast['type'], message: string, title?: string): void {
    const id = crypto.randomUUID();
    const toast: Toast = { id, type, message, title };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);
    this.ngZone.run(() => {
      setTimeout(() => this.removeToast(id), 3000);
    });
  }

  showSuccess(message: string, title?: string): void {
    this.showToast('success', message, title);
  }

  showError(message: string, title?: string): void {
    this.showToast('error', message, title);
  }

  showInfo(message: string, title?: string): void {
    this.showToast('info', message, title);
  }

  confirm(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmSubject.next({ isOpen: true, title, message, resolve });
    });
  }

  resolveConfirm(value: boolean): void {
    const state = this.confirmSubject.value;
    state.resolve?.(value);
    this.confirmSubject.next({ isOpen: false, title: '', message: '' });
  }

  private removeToast(id: string): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((t) => t.id !== id));
  }
}
