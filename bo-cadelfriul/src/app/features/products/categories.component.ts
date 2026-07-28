import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Category } from '../../core/models/product.model';
import { DataGridComponent, GridColumn, GridAction } from '../../shared/components/data-grid/data-grid.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CategoryEditDialogComponent } from './components/category-edit-dialog/category-edit-dialog.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, DataGridComponent, ConfirmDialogComponent, CategoryEditDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-brand-text font-heading">Categories Management</h1>
        <button class="px-4 py-2 text-sm font-medium text-brand-text bg-brand-primary hover:opacity-80 rounded-lg" (click)="openEditDialog(null)">+ Add Category</button>
      </div>

      @if (loading) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      } @else if (error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700">{{ error }}</p>
        </div>
      } @else if (categories.length === 0) {
        <div class="bg-white/80 rounded-xl shadow p-8 text-center">
          <p class="text-brand-muted">No categories found.</p>
        </div>
      } @else {
        <app-data-grid [data]="categories" [columns]="columns" [actions]="actions"></app-data-grid>
      }
    </div>

    <app-confirm-dialog
      [open]="showConfirmDialog"
      title="Delete Category"
      [message]="'Are you sure you want to delete ' + (categoryToDelete?.name ?? '') + '?'"
      (confirm)="onConfirmDelete()"
      (cancel)="showConfirmDialog = false">
    </app-confirm-dialog>

    <app-category-edit-dialog
      [open]="showEditDialog"
      [category]="categoryToEdit"
      (save)="onSaveCategory($event)"
      (cancel)="showEditDialog = false">
    </app-category-edit-dialog>
  `,
})
export class CategoriesComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cdr = inject(ChangeDetectorRef);

  categories: Category[] = [];
  loading = true;
  error = '';

  showConfirmDialog = false;
  showEditDialog = false;
  categoryToDelete: Category | null = null;
  categoryToEdit: Category | null = null;

  columns: GridColumn[] = [
    { header: 'ID', field: 'id', type: 'text' },
    { header: 'Name', field: 'name', type: 'text' },
    { header: 'Description', field: 'description', type: 'text' },
  ];

  actions: GridAction[] = [
    { label: 'Edit', icon: 'edit', action: (row) => this.openEditDialog(row) },
    { label: 'Delete', icon: 'delete', action: (row) => this.openConfirmDialog(row) },
  ];

  ngOnInit(): void {
    this.loadCategories();
  }

  openEditDialog(category: Category | null): void {
    this.categoryToEdit = category;
    this.showEditDialog = true;
  }

  openConfirmDialog(category: Category): void {
    this.categoryToDelete = category;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.categoryToDelete) return;
    this.productService.deleteCategory(this.categoryToDelete.id).subscribe({
      next: () => {
        this.showConfirmDialog = false;
        this.categoryToDelete = null;
        this.loadCategories();
      },
      error: () => {
        this.error = 'Failed to delete category.';
        this.showConfirmDialog = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSaveCategory(data: Category): void {
    if (this.categoryToEdit) {
      this.productService.updateCategory(this.categoryToEdit.id, data).subscribe({
        next: () => {
          this.showEditDialog = false;
          this.categoryToEdit = null;
          this.loadCategories();
        },
        error: () => {
          this.error = 'Failed to update category.';
          this.showEditDialog = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.productService.createCategory(data).subscribe({
        next: () => {
          this.showEditDialog = false;
          this.loadCategories();
        },
        error: () => {
          this.error = 'Failed to create category.';
          this.showEditDialog = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load categories.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
