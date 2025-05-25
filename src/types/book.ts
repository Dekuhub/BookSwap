import type { Tag } from './tag';

export interface BookState {
  id: number;
  name: string;
}

export interface BookPhoto {
  id: number;
  photo_url: string;
  is_main: boolean;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  state: BookState;
  tags: Tag[];
  photos: BookPhoto[];
  coverUrl?: string;
  thumbnailUrl?: string;
}

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  state_id: number;
  tag_ids: number[];
  photos: BookPhotoData[];
}

export interface BookPhotoData {
  photo_url: string;
  is_main: boolean;
} 