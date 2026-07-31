import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Room, RoomRequest } from '../../../../core/models/room.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-room-edit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
          <h3 class="text-lg font-semibold text-brand-text font-heading mb-4">{{ room ? 'Edit Room' : 'New Room' }}</h3>
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Name</label>
              <input formControlName="name" type="text" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Description</label>
              <textarea formControlName="description" rows="3" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1">Price per Night</label>
                <input formControlName="pricePerNight" type="number" step="0.01" min="0" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-text mb-1">Capacity</label>
                <input formControlName="capacity" type="number" min="1" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Amenities (comma-separated)</label>
              <input formControlName="amenitiesText" type="text" placeholder="e.g. WiFi, Pool, Parking" class="w-full border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-ring" />
            </div>
            <div>
              <label class="block text-sm font-medium text-brand-text mb-1">Images</label>
              @if (imagePreviewUrls.length > 0) {
                <div class="flex gap-2 mt-2 flex-wrap">
                  @for (url of imagePreviewUrls; track url) {
                    <div class="relative">
                      <img [src]="url" class="h-20 w-20 rounded object-cover" />
                      <button type="button" (click)="removeExistingImage(url)" class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                    </div>
                  }
                </div>
              }
              @if (newImagePreviews.length > 0) {
                <div class="flex gap-2 mt-2 flex-wrap">
                  @for (preview of newImagePreviews; track preview) {
                    <div class="relative">
                      <img [src]="preview" class="h-20 w-20 rounded object-cover" />
                    </div>
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
export class RoomEditDialogComponent implements OnChanges {
  @Input() open = false;
  @Input() room: Room | null = null;
  @Output() save = new EventEmitter<{ roomData: RoomRequest; imageFiles?: File[] }>();
  @Output() cancel = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    pricePerNight: [0, [Validators.required, Validators.min(0)]],
    capacity: [1, [Validators.required, Validators.min(1)]],
    amenitiesText: [''],
  });

  imagePreviewUrls: string[] = [];
  newImagePreviews: string[] = [];
  selectedFiles: File[] = [];
  removedImageUrls: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['room'] && this.room) {
      this.form.patchValue({
        name: this.room.name,
        description: this.room.description,
        pricePerNight: this.room.pricePerNight,
        capacity: this.room.capacity,
        amenitiesText: this.room.amenities?.join(', ') ?? '',
      });
      this.imagePreviewUrls = this.room.imageUrls?.map(url =>
        url.startsWith('http') ? url : `${environment.apiUrl}${url}`
      ) ?? [];
      this.newImagePreviews = [];
      this.selectedFiles = [];
      this.removedImageUrls = [];
    } else if (changes['open'] && this.open && !this.room) {
      this.form.reset({ name: '', description: '', pricePerNight: 0, capacity: 1, amenitiesText: '' });
      this.imagePreviewUrls = [];
      this.newImagePreviews = [];
      this.selectedFiles = [];
      this.removedImageUrls = [];
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        this.selectedFiles.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.newImagePreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeExistingImage(url: string): void {
    this.imagePreviewUrls = this.imagePreviewUrls.filter(u => u !== url);
    const originalUrl = this.room?.imageUrls?.find(u =>
      url === u || url === `${environment.apiUrl}${u}`
    );
    if (originalUrl) {
      this.removedImageUrls.push(originalUrl);
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      const v = this.form.value;
      const amenities = v.amenitiesText
        ? v.amenitiesText.split(',').map((s: string) => s.trim()).filter((s: string) => s)
        : [];
      const roomData: RoomRequest = {
        name: v.name,
        description: v.description,
        pricePerNight: v.pricePerNight,
        capacity: v.capacity,
        amenities,
      };
      this.save.emit({
        roomData,
        imageFiles: this.selectedFiles.length > 0 ? this.selectedFiles : undefined,
      });
    }
  }
}
