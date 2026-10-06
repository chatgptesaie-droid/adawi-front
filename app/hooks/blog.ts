// types/blog.ts - Types unifiés pour les posts de blog

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  tags: string[];
  status: "draft" | "published";
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at?: string;
  published_at: string | null;
  deleted_at?: string | null;
  views_count: number;
}

// Type pour la grille de blog (version allégée)
export interface BlogPostPreview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string;
  author_name: string;
  published_at: string;
  views_count: number;
}

// Type pour les réponses d'API
export interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
}