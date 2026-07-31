import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product, ProductRequest, Category } from '../../../../core/models/product.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
          <h3 class="text-lg font-semibold text-brand-text font-heading mb-4">{{ product ? 'Edit Product' : 'New Product' }}</h3>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Name</label>
              <input formControlName="name" type="text" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Description</label>
              <textarea formControlName="description" rows="3" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring"></textarea>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1">Price</label>
                <input formControlName="price" type="number" step="0.01" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1">VAT Rate (%)</label>
                <input formControlName="vatRate" type="number" step="0.01" min="0" max="100" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1">Stock Quantity</label>
                <input formControlName="stockQuantity" type="number" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Category</label>
              <select formControlName="categoryId" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring">
                <option value="">Select a category</option>
                @for (cat of categories; track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
            <div class="flex items-center gap-2">
              <input formControlName="available" type="checkbox" id="available" class="h-4 w-4 text-brand-primary border-brand-border rounded focus:ring-brand-ring" />
              <label for="available" class="text-sm font-medium text-brand-text">Available</label>
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Images</label>
              @if (existingImageUrls.length > 0) {
                <div class="flex gap-3 mt-2 flex-wrap">
                  @for (url of existingImageUrls; track url; let i = $index) {
                    <div class="relative">
                      <img [src]="url" class="w-20 h-20 object-cover rounded-md shadow-sm border border-gray-200" />
                      <button
                        type="button"
                        (click)="removeExistingImage(i)"
                        class="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-sm hover:bg-red-600"
                        [attr.aria-label]="'Remove image ' + (i + 1)"
                      >&times;</button>
                    </div>
                  }
                </div>
              }
              @if (imagePreviewUrls.length > 0) {
                <div class="flex gap-2 mt-2 flex-wrap">
                  @for (url of imagePreviewUrls; track url) {
                    <img [src]="url" class="h-20 w-20 rounded object-cover" />
                  }
                </div>
              }
              <input type="file" accept="image/*" multiple (change)="onFilesSelected($event)" class="mt-2 block w-full text-sm text-brand-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-secondary/50 file:text-brand-text hover:file:bg-brand-secondary" />
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
export class ProductEditDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() product: Product | null = null;
  @Input() categories: Category[] = [];
  @Output() save = new EventEmitter<{ productData: ProductRequest; imageFiles?: File[] }>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    vatRate: [22, [Validators.required, Validators.min(0), Validators.max(100)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
    available: [true],
  });

  imagePreviewUrls: string[] = [];
  existingImageUrls: string[] = [];
  selectedFiles: File[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.form.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        vatRate: this.product.vatRate ?? 22,
        stockQuantity: this.product.stockQuantity,
        categoryId: this.product.categoryId,
        available: this.product.available,
      });
      this.existingImageUrls = this.product.imageUrls?.map(url =>
        url.startsWith('http') ? url : `${environment.apiUrl}${url}`
      ) ?? [];
      this.imagePreviewUrls = [];
      this.selectedFiles = [];
    } else if (changes['open'] && this.open && !this.product) {
      this.form.reset({ name: '', description: '', price: 0, vatRate: 22, stockQuantity: 0, categoryId: '', available: true });
      this.existingImageUrls = [];
      this.imagePreviewUrls = [];
      this.selectedFiles = [];
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrls.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeExistingImage(index: number): void {
    this.existingImageUrls.splice(index, 1);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      const productData: ProductRequest = {
        name: v.name,
        description: v.description,
        price: v.price,
        vatRate: v.vatRate,
        stockQuantity: v.stockQuantity,
        categoryId: v.categoryId,
        attributes: this.product?.attributes ?? {},
        available: v.available,
      };
      this.save.emit({
        productData,
        imageFiles: this.selectedFiles.length > 0 ? this.selectedFiles : undefined,
      });
    }
  }
}
