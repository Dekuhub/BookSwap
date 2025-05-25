export interface Tag {
  id: number;
  name: string;
  photo?: string;
}

export interface TagWithCount {
  tag: Tag;
  book_count: number;
}

export interface CreateTagData {
  name: string;
  photo: string;
} 