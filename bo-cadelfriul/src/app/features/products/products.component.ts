import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product, ProductRequest, Category } from '../../core/models/product.model';
import { DataGridComponent, GridColumn, GridAction } from '../../shared/components/data-grid/data-grid.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProductEditDialogComponent } from './components/product-edit-dialog/product-edit-dialog.component';
import { CategoriesComponent } from './categories.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, DataGridComponent, ConfirmDialogComponent, ProductEditDialogComponent, CategoriesComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center border-b border-brand-border">
        <button
          (click)="activeTab = 'products'"
          [class]="activeTab === 'products' ? 'px-4 py-2 text-sm font-medium text-brand-primary border-b-2 border-brand-primary' : 'px-4 py-2 text-sm font-medium text-brand-muted hover:text-brand-text'"
        >
          Products
        </button>
        <button
          (click)="activeTab = 'categories'"
          [class]="activeTab === 'categories' ? 'px-4 py-2 text-sm font-medium text-brand-primary border-b-2 border-brand-primary' : 'px-4 py-2 text-sm font-medium text-brand-muted hover:text-brand-text'"
        >
          Categories
        </button>
      </div>

      @if (activeTab === 'products') {
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-brand-text font-heading">Products Management</h1>
          <button class="px-4 py-2 text-sm font-medium text-brand-text bg-brand-primary hover:opacity-80 rounded-lg" (click)="openCreate()">+ Add Product</button>
        </div>

        @if (loading) {
          <div class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        } @else if (error) {
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-700">{{ error }}</p>
          </div>
        } @else if (products.length === 0) {
          <div class="bg-white/80 rounded-xl shadow p-8 text-center">
            <p class="text-brand-muted">No products found.</p>
          </div>
        } @else {
          <app-data-grid [data]="products" [columns]="columns" [actions]="actions"></app-data-grid>
        }
      } @else {
        <app-categories></app-categories>
      }
    </div>

    <app-confirm-dialog
      [open]="showConfirmDialog"
      title="Delete Product"
      [message]="'Are you sure you want to delete ' + (productToDelete?.name ?? '') + '?'"
      (confirm)="onConfirmDelete()"
      (cancel)="showConfirmDialog = false">
    </app-confirm-dialog>

    <app-product-edit-dialog
      [open]="showEditDialog"
      [product]="productToEdit"
      [categories]="categories"
      (save)="onSaveProduct($event)"
      (cancel)="showEditDialog = false">
    </app-product-edit-dialog>
  `,
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cdr = inject(ChangeDetectorRef);

  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  error = '';

  activeTab: 'products' | 'categories' = 'products';

  showConfirmDialog = false;
  showEditDialog = false;
  productToDelete: Product | null = null;
  productToEdit: Product | null = null;

  columns: GridColumn[] = [
    { header: 'Image', field: 'imageUrls', type: 'image' },
    { header: 'Name', field: 'name', type: 'text' },
    { header: 'Price', field: 'price', type: 'currency' },
    { header: 'VAT %', field: 'vatRate', type: 'number' },
    { header: 'Stock', field: 'stockQuantity', type: 'number' },
    { header: 'Category', field: 'categoryName', type: 'text' },
    { header: 'Available', field: 'available', type: 'boolean' },
  ];

  actions: GridAction[] = [
    { label: 'Edit', icon: 'edit', action: (row) => this.openEdit(row) },
    { label: 'Delete', icon: 'delete', action: (row) => this.openDelete(row) },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  openCreate(): void {
    this.productToEdit = null;
    this.showEditDialog = true;
  }

  openEdit(product: Product): void {
    this.productToEdit = product;
    this.showEditDialog = true;
  }

  openDelete(product: Product): void {
    this.productToDelete = product;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.productToDelete) return;
    this.productService.deleteProduct(this.productToDelete.id).subscribe({
      next: () => {
        console.log('Product deleted successfully');
        this.showConfirmDialog = false;
        this.productToDelete = null;
        this.loadProducts();
      },
      error: (err) => {
        console.error('Failed to delete product:', err);
        this.error = 'Failed to delete product.';
        this.showConfirmDialog = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSaveProduct(data: { productData: ProductRequest; imageFiles?: File[] }): void {
    if (this.productToEdit) {
      this.productService.updateProduct(this.productToEdit.id, data.productData).subscribe({
        next: (updatedProduct) => {
          console.log('Product updated successfully:', updatedProduct);
          if (data.imageFiles && data.imageFiles.length > 0) {
            this.uploadImages(updatedProduct.id, data.imageFiles);
          } else {
            this.showEditDialog = false;
            this.productToEdit = null;
            this.loadProducts();
          }
        },
        error: (err) => {
          console.error('Failed to update product:', err);
          this.error = 'Failed to update product.';
          this.showEditDialog = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.productService.createProduct(data.productData).subscribe({
        next: (createdProduct) => {
          console.log('Product created successfully:', createdProduct);
          if (data.imageFiles && data.imageFiles.length > 0) {
            this.uploadImages(createdProduct.id, data.imageFiles);
          } else {
            this.showEditDialog = false;
            this.loadProducts();
          }
        },
        error: (err) => {
          console.error('Failed to create product:', err);
          this.error = 'Failed to create product.';
          this.showEditDialog = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  private uploadImages(productId: string, files: File[]): void {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    this.productService.uploadImage(productId, formData).subscribe({
      next: () => {
        console.log('Images uploaded successfully');
        this.showEditDialog = false;
        this.productToEdit = null;
        this.loadProducts();
      },
      error: (err) => {
        console.error('Failed to upload images:', err);
        this.error = 'Failed to upload images.';
        this.showEditDialog = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadData(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load products.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });

    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.detectChanges();
      },
      error: () => {
        console.error('Failed to load categories');
      },
    });
  }

  private loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load products.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
