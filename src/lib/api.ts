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
  isTrending?: boolean;
  isEditorsPick?: boolean;
  author: { id: number; name: string; slug: string } | null;
  featuredImage: { id: number; sourceUrl: string; altText: string | null } | null;
  articleCategories?: { isPrimary: boolean; category: { id: number; name: string; slug: string } }[];
  articleEditorialTypes?: { editorialType: string }[];
  // Admin-only: which admin account posted this. Only present when the
  // request was authenticated -- the backend never sends it to anonymous
  // (public) callers.
  publishedByAdmin?: { id: number; email: string } | null;
}

export interface HomeData {
  featured: ArticleSummary[];
  freshHeat: ArticleSummary[];
  faceOfTheHeat: ArticleSummary[];
  firstListen: ArticleSummary[];
  heatCheckStories: ArticleSummary[];
  nextUp: ArticleSummary[];
  styleReport: ArticleSummary[];
  mostHeated: ArticleSummary[];
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoFocusKeyword: string | null;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  spotifyUrl: string | null;
  soundcloudUrl: string | null;
  youtubeUrl: string | null;
  articleTags: { tag: { id: number; name: string; slug: string } }[];
  galleryImages: { media: { id: number; sourceUrl: string; altText: string | null } }[];
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

export interface Media {
  id: number;
  sourceUrl: string;
  altText: string | null;
}

export interface AdminAccount {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  createdAt: string;
}

export interface SiteSettings {
  homepageSpotifyPlaylistUrl: string | null;
}

export interface AnalyticsOverview {
  analytics: {
    last7Days: { sessions: number; activeUsers: number; pageviews: number };
    last30Days: { sessions: number; activeUsers: number; pageviews: number };
    thisMonth: { sessions: number; activeUsers: number; pageviews: number };
    lastMonth: { sessions: number; activeUsers: number; pageviews: number };
    topPages: { path: string; pageviews: number }[];
    monthlyTrend: { month: string; label: string; sessions: number }[];
  } | null;
  analyticsError: string | null;
  searchConsole: {
    last7Days: { clicks: number; impressions: number; ctr: number; position: number };
    last28Days: { clicks: number; impressions: number; ctr: number; position: number };
    thisMonth: { clicks: number; impressions: number; ctr: number; position: number };
    lastMonth: { clicks: number; impressions: number; ctr: number; position: number };
    topQueries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
    topPages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
  } | null;
  searchConsoleError: string | null;
  seoStats: {
    domainAuthority: number | null;
    pageAuthority: number | null;
    spamScore: number | null;
    linkingRootDomains: number | null;
    externalBacklinks: number | null;
    fetchedAt: string;
    stale: boolean;
  } | null;
  seoStatsError: string | null;
}

export interface ArticleWriteInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  status: 'draft' | 'published';
  authorId?: number | null;
  featuredImageId?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoFocusKeyword?: string | null;
  spotifyUrl?: string | null;
  soundcloudUrl?: string | null;
  youtubeUrl?: string | null;
  isFeatured?: boolean;
  featuredOrder?: number | null;
  editorialTypes?: string[];
  isTrending?: boolean;
  isEditorsPick?: boolean;
  categoryIds: number[];
  primaryCategoryId?: number | null;
  tagIds: number[];
  galleryImageIds?: number[];
}

export const api = {
  getHome: () => request<HomeData>('/api/home', { cache: 'no-store' }),

  listArticles: (
    params: {
      page?: number;
      pageSize?: number;
      category?: string;
      tag?: string;
      editorialType?: string;
      isFeatured?: boolean;
      isTrending?: boolean;
      isEditorsPick?: boolean;
      status?: 'draft' | 'published' | 'all';
    } = {},
    token?: string
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    if (params.category) qs.set('category', params.category);
    if (params.tag) qs.set('tag', params.tag);
    if (params.editorialType) qs.set('editorialType', params.editorialType);
    if (params.isFeatured !== undefined) qs.set('isFeatured', String(params.isFeatured));
    if (params.isTrending !== undefined) qs.set('isTrending', String(params.isTrending));
    if (params.isEditorsPick !== undefined) qs.set('isEditorsPick', String(params.isEditorsPick));
    if (params.status) qs.set('status', params.status);
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

  listAuthors: (token?: string) => request<{ authors: Author[] }>('/api/authors', { token, cache: 'no-store' }),

  listTags: (token?: string) => request<{ tags: Tag[] }>('/api/tags', { token, cache: 'no-store' }),

  createMedia: (data: { sourceUrl: string; altText?: string | null }, token: string) =>
    request<{ media: Media }>('/api/media', { method: 'POST', body: JSON.stringify(data), token }),

  getUploadSignature: (token: string) =>
    request<{ cloudName: string; apiKey: string; timestamp: number; signature: string; folder: string }>(
      '/api/media/upload-signature',
      { method: 'POST', token }
    ),

  createTag: (data: { name: string; slug: string }, token: string) =>
    request<{ tag: Tag }>('/api/tags', { method: 'POST', body: JSON.stringify(data), token }),

  createAuthor: (data: { name: string; slug: string }, token: string) =>
    request<{ author: Author }>('/api/authors', { method: 'POST', body: JSON.stringify(data), token }),

  createArticle: (data: ArticleWriteInput, token: string) =>
    request<{ article: ArticleDetail }>('/api/articles', { method: 'POST', body: JSON.stringify(data), token }),

  updateArticle: (id: number, data: Partial<ArticleWriteInput>, token: string) =>
    request<{ article: ArticleDetail }>(`/api/articles/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),

  deleteArticle: (id: number, token: string) => request<void>(`/api/articles/${id}`, { method: 'DELETE', token }),

  listAdmins: (token: string) => request<{ admins: AdminAccount[] }>('/api/auth/admins', { token, cache: 'no-store' }),

  createAdmin: (data: { email: string; password: string; name: string; role: 'admin' | 'editor' }, token: string) =>
    request<{ admin: AdminAccount }>('/api/auth/admins', { method: 'POST', body: JSON.stringify(data), token }),

  updateAdmin: (
    id: number,
    data: Partial<{ email: string; name: string; role: 'admin' | 'editor'; password: string }>,
    token: string
  ) => request<{ admin: AdminAccount }>(`/api/auth/admins/${id}`, { method: 'PATCH', body: JSON.stringify(data), token }),

  deleteAdmin: (id: number, token: string) =>
    request<void>(`/api/auth/admins/${id}`, { method: 'DELETE', token }),

  getAnalyticsOverview: (token: string) =>
    request<AnalyticsOverview>('/api/analytics/overview', { token, cache: 'no-store' }),

  getSiteSettings: () => request<{ settings: SiteSettings }>('/api/settings', { cache: 'no-store' }),

  updateSiteSettings: (data: Partial<SiteSettings>, token: string) =>
    request<{ settings: SiteSettings }>('/api/settings', { method: 'PUT', body: JSON.stringify(data), token }),
};
