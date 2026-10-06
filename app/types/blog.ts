export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  tags: string[];
  status: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  deleted_at?: string;
  views_count: number;
  category?: string; // Pour la compatibilité avec BlogGrid
}
