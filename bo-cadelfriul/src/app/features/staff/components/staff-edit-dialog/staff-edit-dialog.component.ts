import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Staff, StaffRequest, StaffRole } from '../../../../core/models/staff.model';

@Component({
  selector: 'app-staff-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
          <h3 class="text-lg font-semibold text-brand-text font-heading mb-4">{{ staffMember ? 'Edit Staff' : 'New Staff' }}</h3>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Full Name</label>
              <input formControlName="fullName" type="text" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Email</label>
              <input formControlName="email" type="email" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Role</label>
              <select formControlName="role" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring">
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
            @if (!staffMember) {
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1">Password</label>
                <input formControlName="password" type="password" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
              </div>
            }
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
export class StaffEditDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() staffMember: Staff | null = null;
  @Output() save = new EventEmitter<StaffRequest>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: [StaffRole.ADMIN, Validators.required],
    password: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['staffMember'] && this.staffMember) {
      this.form.patchValue({
        fullName: this.staffMember.fullName,
        email: this.staffMember.email,
        role: this.staffMember.role,
      });
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else if (changes['open'] && this.open && !this.staffMember) {
      this.form.reset({ fullName: '', email: '', role: StaffRole.ADMIN, password: '' });
      this.form.get('password')?.setValidators([Validators.required]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      const request: StaffRequest = {
        fullName: v.fullName,
        email: v.email,
        role: v.role,
      };
      if (v.password && !this.staffMember) {
        request.password = v.password;
      }
      this.save.emit(request);
    }
  }
}
