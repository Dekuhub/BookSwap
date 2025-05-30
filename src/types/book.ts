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
  photos: Array<{
    id: number;
    photo_url: string;
    is_main: boolean;
  }>;
  state_id: number;
  tags: Tag[];
  user_id: number;
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

export interface UpdateBookData {
  title: string;
  author: string;
  description: string;
  photos: string[];
  state_id: number;
  tag_ids: number[];
}

export interface CreateBookData {
  title: string;
  author: string;
  description: string;
  photos: string[];
  state_id: number;
  tag_ids: number[];
} 