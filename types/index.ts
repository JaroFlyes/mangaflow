export type MangaStatus = 'ongoing' | 'completed' | 'hiatus';
export type UserRole = 'user' | 'admin';

export interface Manga {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  status: MangaStatus;
  genres: string[];
  author: string | null;
  created_at: string;
}

export interface Chapter {
  id: string;
  manga_id: string;
  number: number;
  title: string | null;
  created_at: string;
}

export interface Page {
  id: string;
  chapter_id: string;
  page_number: number;
  image_url: string;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  manga_id: string;
  chapter_id: string;
  page_number: number;
  progress: number;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  manga_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface MangaWithLastChapter extends Manga {
  last_chapter?: Chapter | null;
}

export interface ContinueReadingItem extends ReadingHistory {
  manga: Manga;
  chapter: Chapter;
}

export type Database = {
  public: {
    Tables: {
      mangas: {
        Row: Manga;
        Insert: Omit<Manga, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Manga, 'id'>>;
        Relationships: [];
      };
      chapters: {
        Row: Chapter;
        Insert: Omit<Chapter, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Chapter, 'id'>>;
        Relationships: [];
      };
      pages: {
        Row: Page;
        Insert: Omit<Page, 'id'> & { id?: string };
        Update: Partial<Omit<Page, 'id'>>;
        Relationships: [];
      };
      reading_history: {
        Row: ReadingHistory;
        Insert: Omit<ReadingHistory, 'id' | 'updated_at'> & { id?: string; updated_at?: string };
        Update: Partial<Omit<ReadingHistory, 'id'>>;
        Relationships: [];
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Favorite, 'id'>>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<Omit<Profile, 'id'>>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
