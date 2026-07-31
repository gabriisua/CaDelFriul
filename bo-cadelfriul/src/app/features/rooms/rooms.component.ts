import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomService } from '../../core/services/room.service';
import { Room, RoomRequest } from '../../core/models/room.model';
import { DataGridComponent, GridColumn, GridAction } from '../../shared/components/data-grid/data-grid.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { RoomEditDialogComponent } from './components/room-edit-dialog/room-edit-dialog.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, DataGridComponent, ConfirmDialogComponent, RoomEditDialogComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-brand-text font-heading">Rooms Management</h1>
        <button class="px-4 py-2 text-sm font-medium text-brand-text bg-brand-primary hover:opacity-80 rounded-lg" (click)="openCreate()">+ Add Room</button>
      </div>

      @if (loading) {
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
        </div>
      } @else if (error) {
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <p class="text-red-700">{{ error }}</p>
        </div>
      } @else if (rooms.length === 0) {
        <div class="bg-white/80 rounded-xl shadow p-8 text-center">
          <p class="text-brand-muted">No rooms found.</p>
        </div>
      } @else {
        <app-data-grid [data]="rooms" [columns]="columns" [actions]="actions"></app-data-grid>
      }
    </div>

    <app-confirm-dialog
      [open]="showConfirmDialog"
      title="Delete Room"
      [message]="'Are you sure you want to delete ' + (roomToDelete?.name ?? '') + '?'"
      (confirm)="onConfirmDelete()"
      (cancel)="showConfirmDialog = false">
    </app-confirm-dialog>

    <app-room-edit-dialog
      [open]="showEditDialog"
      [room]="roomToEdit"
      (save)="onSaveRoom($event)"
      (cancel)="showEditDialog = false">
    </app-room-edit-dialog>
  `,
})
export class RoomsComponent implements OnInit {
  private readonly roomService = inject(RoomService);
  private readonly cdr = inject(ChangeDetectorRef);

  rooms: Room[] = [];
  loading = true;
  error = '';

  showConfirmDialog = false;
  showEditDialog = false;
  roomToDelete: Room | null = null;
  roomToEdit: Room | null = null;

  columns: GridColumn[] = [
    { header: 'Image', field: 'coverImage', type: 'image' },
    { header: 'Name', field: 'name', type: 'text' },
    { header: 'Price/Night', field: 'pricePerNight', type: 'currency' },
    { header: 'Capacity', field: 'capacity', type: 'number' },
  ];

  actions: GridAction[] = [
    { label: 'Edit', icon: 'edit', action: (row) => this.openEdit(row) },
    { label: 'Delete', icon: 'delete', action: (row) => this.openDelete(row) },
  ];

  ngOnInit(): void {
    this.loadRooms();
  }

  openCreate(): void {
    this.roomToEdit = null;
    this.showEditDialog = true;
  }

  openEdit(room: Room): void {
    this.roomToEdit = room;
    this.showEditDialog = true;
  }

  openDelete(room: Room): void {
    this.roomToDelete = room;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (!this.roomToDelete) return;
    this.roomService.deleteRoom(this.roomToDelete.id).subscribe({
      next: () => {
        console.log('Room deleted successfully');
        this.showConfirmDialog = false;
        this.roomToDelete = null;
        this.loadRooms();
      },
      error: (err) => {
        console.error('Failed to delete room:', err);
        this.error = 'Failed to delete room.';
        this.showConfirmDialog = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSaveRoom(data: { roomData: RoomRequest; imageFiles?: File[] }): void {
    if (this.roomToEdit) {
      this.roomService.updateRoom(this.roomToEdit.id, data.roomData).subscribe({
        next: (updatedRoom) => {
          console.log('Room updated successfully:', updatedRoom);
          if (data.imageFiles && data.imageFiles.length > 0) {
            this.uploadImages(updatedRoom.id, data.imageFiles);
          } else {
            this.showEditDialog = false;
            this.roomToEdit = null;
            this.loadRooms();
          }
        },
        error: (err) => {
          console.error('Failed to update room:', err);
          this.error = 'Failed to update room.';
          this.showEditDialog = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.roomService.createRoom(data.roomData).subscribe({
        next: (createdRoom) => {
          console.log('Room created successfully:', createdRoom);
          if (data.imageFiles && data.imageFiles.length > 0) {
            this.uploadImages(createdRoom.id, data.imageFiles);
          } else {
            this.showEditDialog = false;
            this.loadRooms();
          }
        },
        error: (err) => {
          console.error('Failed to create room:', err);
          this.error = 'Failed to create room.';
          this.showEditDialog = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  private uploadImages(roomId: string, files: File[]): void {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    this.roomService.uploadImages(roomId, formData).subscribe({
      next: () => {
        console.log('Images uploaded successfully');
        this.showEditDialog = false;
        this.roomToEdit = null;
        this.loadRooms();
      },
      error: (err) => {
        console.error('Failed to upload images:', err);
        this.error = 'Failed to upload images.';
        this.showEditDialog = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms.map((room: any) => ({
          ...room,
          coverImage: room.imageUrls && room.imageUrls.length > 0 ? room.imageUrls[0] : null
        }));

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load rooms.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
