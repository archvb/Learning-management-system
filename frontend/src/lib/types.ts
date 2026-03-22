// Shared TypeScript interfaces for the LMS frontend

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export interface Subject {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
}

export interface Video {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  video_url: string;
  duration_seconds: number | null;
  order_index: number;
  is_locked?: boolean;
  is_completed?: boolean;
}

export interface Section {
  id: string;
  title: string;
  order_index: number;
  videos: Video[];
}

export interface SubjectContent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  sections: Section[];
}

export interface VideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  last_position_seconds: number;
  is_completed: boolean;
  updated_at: string;
}

export interface VideoWithNavigation {
  video: Video;
  previous: Video | null;
  next: Video | null;
  previous_video_id?: string;
  next_video_id?: string;
  is_locked?: boolean;
  is_completed?: boolean;
  unlock_reason?: string;
}
