import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category } from '../../../../core/models/product.model';

@Component({
  selector: 'app-category-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
          <h3 class="text-lg font-semibold text-brand-text font-heading mb-4">{{ category ? 'Edit Category' : 'New Category' }}</h3>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Name</label>
              <input formControlName="name" type="text" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Description</label>
              <textarea formControlName="description" rows="3" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring"></textarea>
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
export class CategoryEditDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() category: Category | null = null;
  @Output() save = new EventEmitter<Category>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && this.category) {
      this.form.patchValue({
        name: this.category.name,
        description: this.category.description,
      });
    } else if (changes['open'] && this.open && !this.category) {
      this.form.reset({ name: '', description: '' });
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      this.save.emit({
        id: this.category?.id ?? '',
        name: v.name,
        description: v.description,
      });
    }
  }
}
