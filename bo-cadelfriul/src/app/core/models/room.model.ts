export interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
  imageUrls: string[];
  isArchived: boolean;
}

export interface RoomRequest {
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  amenities: string[];
}
