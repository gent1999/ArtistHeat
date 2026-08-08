// Server-side client for the ArtistHeat backend API. Only ever called
// from Server Components / route handlers / server actions -- the
// browser never talks to the backend directly, so there's no CORS
// surface and the API URL never ships to the client bundle.

const API_URL = process.env.API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  const { token, ...rest } = init || {};
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || `Request to ${path} failed with ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface ArticleSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  status: 'draft' | 'published';
  publishedAt: string | null;
  updatedAt?: string | null;
  isFeatured?: boolean;
  featuredOrder?: number | null;
  author: { id: number; name: string; slug: string } | null;
  featuredImage: { id: number; sourceUrl: string; altText: string | null } | null;
  articleCategories?: { isPrimary: boolean; category: { id: number; name: string; slug: string } }[];
}

export interface HomeSection {
  category: { id: number; name: string; slug: string };
  articles: ArticleSummary[];
}

export interface HomeData {
  featured: ArticleSummary[];
  sections: HomeSection[];
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoFocusKeyword: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  articleTags: { tag: { id: number; name: string; slug: string } }[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  articleCount?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  articleCount?: number;
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  email: string | null;
  bio: string | null;
}

export const api = {
  getHome: () => request<HomeData>('/api/home', { cache: 'no-store' }),

  listArticles: (params: { page?: number; pageSize?: number; category?: string; tag?: string } = {}, token?: string) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    if (params.category) qs.set('category', params.category);
    if (params.tag) qs.set('tag', params.tag);
    return request<{ articles: ArticleSummary[]; pagination: Pagination }>(`/api/articles?${qs}`, { token, cache: 'no-store' });
  },

  getArticle: (slug: string, token?: string) =>
    request<{ article: ArticleDetail }>(`/api/articles/${encodeURIComponent(slug)}`, { token, cache: 'no-store' }),

  listCategories: () => request<{ categories: Category[] }>('/api/categories', { next: { revalidate: 300 } }),

  getCategory: (slug: string, page = 1) =>
    request<{ category: Category; articles: ArticleSummary[]; pagination: Pagination }>(
      `/api/categories/${encodeURIComponent(slug)}?page=${page}`,
      { cache: 'no-store' }
    ),

  getTag: (slug: string, page = 1) =>
    request<{ tag: Tag; articles: ArticleSummary[]; pagination: Pagination }>(
      `/api/tags/${encodeURIComponent(slug)}?page=${page}`,
      { cache: 'no-store' }
    ),

  getAuthor: (slug: string, page = 1) =>
    request<{ author: Author; articles: ArticleSummary[]; pagination: Pagination }>(
      `/api/authors/${encodeURIComponent(slug)}?page=${page}`,
      { cache: 'no-store' }
    ),

  lookupRedirect: (path: string) =>
    request<{ redirect: { toPath: string; statusCode: number } }>(`/api/redirects/lookup?path=${encodeURIComponent(path)}`),

  login: (email: string, password: string) =>
    request<{ token: string; admin: { id: number; email: string; name: string; role: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: (token: string) => request<{ admin: { id: number; email: string; name: string; role: string } }>('/api/auth/me', { token }),
};
