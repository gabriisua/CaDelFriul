import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Customer } from '../../../../core/models/customer.model';

@Component({
  selector: 'app-customer-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
          <h3 class="text-lg font-semibold text-brand-text font-heading mb-4">{{ customer ? 'Edit Customer' : 'New Customer' }}</h3>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1">First Name</label>
                <input formControlName="firstName" type="text" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1">Last Name</label>
                <input formControlName="lastName" type="text" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Email</label>
              <input formControlName="email" type="email" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Phone</label>
              <input formControlName="phone" type="tel" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
            </div>
            <div class="flex items-center gap-2">
              <input formControlName="active" type="checkbox" id="active" class="h-4 w-4 text-brand-primary border-brand-border rounded focus:ring-brand-ring" />
              <label for="active" class="text-sm font-medium text-brand-text">Active</label>
            </div>
            <div class="flex justify-end gap-3 pt-4">
              <button type="button" class="px-4 py-2 text-sm font-medium text-brand-text bg-brand-secondary hover:opacity-80 rounded-lg" (click)="cancel.emit()">Cancel</button>
              <button type="submit" [disabled]="form.invalid" class="px-4 py-2 text-sm font-medium text-brand-text bg-brand-primary hover:opacity-80 rounded-lg font-medium disabled:opacity-50">Save</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class CustomerEditDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() customer: Customer | null = null;
  @Output() save = new EventEmitter<{firstName: string; lastName: string; email: string; phone: string; active: boolean}>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    active: [true],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] && this.customer) {
      this.form.patchValue({
        firstName: this.customer.firstName,
        lastName: this.customer.lastName,
        email: this.customer.email,
        phone: this.customer.phone,
        active: this.customer.active,
      });
    } else if (changes['open'] && this.open && !this.customer) {
      this.form.reset({ firstName: '', lastName: '', email: '', phone: '', active: true });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.save.emit({
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phone: v.phone,
        active: v.active,
      });
    }
  }
}
