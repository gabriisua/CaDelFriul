import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';
import { Product, Category } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);

  private readonly publicUrl = `${environment.apiUrl}/api/products`;

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.publicUrl);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.publicUrl}/categories`);
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.api.post<Product>('/products', product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.api.put<Product>(`/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.api.delete<void>(`/products/${id}`);
  }

  uploadImage(productId: string, formData: FormData): Observable<Product> {
    return this.api.post<Product>(`/products/${productId}/images`, formData);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.api.post<Category>('/products/categories', category);
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category> {
    return this.api.put<Category>(`/products/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.api.delete<void>(`/products/categories/${id}`);
  }
}
