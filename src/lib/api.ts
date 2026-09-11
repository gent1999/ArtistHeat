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

// -- Finance ------------------------------------------------------------

export type FeeType = 'none' | 'percentage' | 'fixed';
export type SourceStatus = 'active' | 'pending' | 'inactive';
export type RevenuePaymentStatus = 'pending' | 'paid' | 'cancelled';
export type FinancePayoutStatus = 'not_ready' | 'ready_for_payout' | 'paid_out';
export type ExpenseCategory = 'domain' | 'hosting' | 'software' | 'ads' | 'other';
export type BillingCycle = 'one_time' | 'monthly' | 'yearly';
export type ExpensePaymentStatus = 'paid' | 'pending';

export interface FinanceSource {
  id: number;
  name: string;
  type: string;
  defaultGross: number;
  feeType: FeeType;
  feeValue: number;
  payoutThreshold: number;
  status: SourceStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  current_balance: number;
  lifetime_net: number;
  entry_count: number;
  last_entry_date: string | null;
}

export interface FinanceEntry {
  id: number;
  date: string;
  sourceId: number | null;
  source?: { id: number; name: string } | null;
  articleTitle: string | null;
  articleUrl: string | null;
  clientName: string | null;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  paymentStatus: RevenuePaymentStatus;
  payoutStatus: FinancePayoutStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinancePayout {
  id: number;
  sourceId: number | null;
  source?: { id: number; name: string } | null;
  amount: number;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface FinanceExpense {
  id: number;
  name: string;
  category: ExpenseCategory;
  amount: number;
  billingCycle: BillingCycle;
  vendor: string | null;
  renewalDate: string | null;
  paymentStatus: ExpensePaymentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  days_until_renewal: number | null;
}

export interface FinanceSummary {
  totalGrossRevenue: number;
  totalNetRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  totalExpenses: number;
  lifetimeProfit: number;
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  currentMonthProfit: number;
  monthlyExpenses: number;
  payoutProgressBySource: {
    sourceId: number;
    sourceName: string;
    pendingBalance: number;
    threshold: number;
    remaining: number;
    progress: number;
    ready: boolean;
  }[];
  upcomingRenewals: { id: number; name: string; amount: number; renewalDate: string; daysUntil: number }[];
}

export interface FinanceMonthlyTrend {
  trend: { month: string; label: string; revenue: number; expenses: number; profit: number }[];
  availableYears: number[];
  range: string;
}

export interface FinanceTransaction {
  id: number;
  kind: 'income' | 'expense' | 'payout';
  date: string;
  source_id: number | null;
  source_name: string | null;
  description: string;
  amount: number;
  article_title: string | null;
  client_name: string | null;
  vendor: string | null;
  category: string | null;
  billing_cycle: string | null;
  renewal_date: string | null;
  gross_amount: number | null;
  fee_amount: number | null;
  net_amount: number | null;
  payment_status: string | null;
  payout_status: string | null;
  article_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface FinanceSourceInput {
  name: string;
  type?: string;
  defaultGross?: number;
  feeType?: FeeType;
  feeValue?: number;
  payoutThreshold?: number;
  status?: SourceStatus;
  notes?: string | null;
}

export interface FinanceEntryInput {
  date?: string;
  sourceId?: number | null;
  articleTitle?: string | null;
  articleUrl?: string | null;
  clientName?: string | null;
  grossAmount: number;
  feeAmount?: number;
  netAmount?: number;
  paymentStatus?: RevenuePaymentStatus;
  payoutStatus?: FinancePayoutStatus;
  notes?: string | null;
}

export interface FinancePayoutInput {
  sourceId: number | null;
  amount: number;
  date?: string;
  notes?: string | null;
  markEntriesPaid?: boolean;
}

export interface FinanceExpenseInput {
  name: string;
  category?: ExpenseCategory;
  amount: number;
  billingCycle?: BillingCycle;
  vendor?: string | null;
  renewalDate?: string | null;
  paymentStatus?: ExpensePaymentStatus;
  notes?: string | null;
  // The effective/incurred date -- stored as createdAt, no separate column.
  date?: string;
}

// Shared on-demand cache tag for every public fetch whose result depends on
// article data (home, article detail, listings, category/tag/author
// archives). A single broad tag keeps invalidation simple: any publish/edit/
// delete/feature-toggle in admin/actions.ts calls updateTag('articles') once
// and every public page relying on article data picks up the change on its
// very next request, regardless of the time-based revalidate window below.
const ARTICLES_TAG = 'articles';
// Ceiling on how stale public content can get if a mutation ever happens
// without going through admin/actions.ts (e.g. a future script/back-office
// tool hitting the backend directly). Normal admin edits refresh instantly
// via updateTag, independent of this window.
const PUBLIC_REVALIDATE_SECONDS = 3600;

export const api = {
  getHome: () =>
    request<HomeData>('/api/home', { next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [ARTICLES_TAG] } }),

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
    // Admin callers (token present) always need the current, uncached state
    // (e.g. the featured-toggle logic reading isFeatured counts mid-edit) --
    // only anonymous/public reads are safe to cache, since the Data Cache
    // key doesn't vary on the Authorization header.
    return request<{ articles: ArticleSummary[]; pagination: Pagination }>(
      `/api/articles?${qs}`,
      token
        ? { token, cache: 'no-store' }
        : { next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [ARTICLES_TAG] } }
    );
  },

  getArticle: (slug: string, token?: string) =>
    request<{ article: ArticleDetail }>(
      `/api/articles/${encodeURIComponent(slug)}`,
      token
        ? { token, cache: 'no-store' }
        : { next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [ARTICLES_TAG] } }
    ),

  listCategories: () => request<{ categories: Category[] }>('/api/categories', { next: { revalidate: 300 } }),

  getCategory: (slug: string, page = 1) =>
    request<{ category: Category; articles: ArticleSummary[]; pagination: Pagination }>(
      `/api/categories/${encodeURIComponent(slug)}?page=${page}`,
      { next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [ARTICLES_TAG] } }
    ),

  getTag: (slug: string, page = 1) =>
    request<{ tag: Tag; articles: ArticleSummary[]; pagination: Pagination }>(
      `/api/tags/${encodeURIComponent(slug)}?page=${page}`,
      { next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [ARTICLES_TAG] } }
    ),

  getAuthor: (slug: string, page = 1) =>
    request<{ author: Author; articles: ArticleSummary[]; pagination: Pagination }>(
      `/api/authors/${encodeURIComponent(slug)}?page=${page}`,
      { next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [ARTICLES_TAG] } }
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

  getSiteSettings: () =>
    request<{ settings: SiteSettings }>('/api/settings', {
      next: { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: ['site-settings'] },
    }),

  updateSiteSettings: (data: Partial<SiteSettings>, token: string) =>
    request<{ settings: SiteSettings }>('/api/settings', { method: 'PUT', body: JSON.stringify(data), token }),

  // -- Finance ------------------------------------------------------------

  getFinanceSummary: (token: string) => request<FinanceSummary>('/api/finance/summary', { token, cache: 'no-store' }),

  getFinanceMonthlyTrend: (range: string, token: string) =>
    request<FinanceMonthlyTrend>(`/api/finance/monthly-trend?range=${encodeURIComponent(range)}`, { token, cache: 'no-store' }),

  listFinanceSources: (token: string) =>
    request<{ sources: FinanceSource[] }>('/api/finance/sources', { token, cache: 'no-store' }),

  createFinanceSource: (data: FinanceSourceInput, token: string) =>
    request<{ source: FinanceSource }>('/api/finance/sources', { method: 'POST', body: JSON.stringify(data), token }),

  updateFinanceSource: (id: number, data: Partial<FinanceSourceInput>, token: string) =>
    request<{ source: FinanceSource }>(`/api/finance/sources/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),

  deleteFinanceSource: (id: number, token: string) =>
    request<void>(`/api/finance/sources/${id}`, { method: 'DELETE', token }),

  listFinanceEntries: (
    params: {
      source_id?: number;
      payment_status?: string;
      payout_status?: string;
      from?: string;
      to?: string;
    } = {},
    token?: string
  ) => {
    const qs = new URLSearchParams();
    if (params.source_id !== undefined) qs.set('source_id', String(params.source_id));
    if (params.payment_status) qs.set('payment_status', params.payment_status);
    if (params.payout_status) qs.set('payout_status', params.payout_status);
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    return request<{ entries: FinanceEntry[]; totals: { gross: number; fee: number; net: number } }>(
      `/api/finance/entries?${qs}`,
      { token, cache: 'no-store' }
    );
  },

  createFinanceEntry: (data: FinanceEntryInput, token: string) =>
    request<{ entry: FinanceEntry }>('/api/finance/entries', { method: 'POST', body: JSON.stringify(data), token }),

  updateFinanceEntry: (id: number, data: Partial<FinanceEntryInput>, token: string) =>
    request<{ entry: FinanceEntry }>(`/api/finance/entries/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),

  deleteFinanceEntry: (id: number, token: string) =>
    request<void>(`/api/finance/entries/${id}`, { method: 'DELETE', token }),

  listFinancePayouts: (params: { source_id?: number } = {}, token?: string) => {
    const qs = new URLSearchParams();
    if (params.source_id !== undefined) qs.set('source_id', String(params.source_id));
    return request<{ payouts: FinancePayout[] }>(`/api/finance/payouts?${qs}`, { token, cache: 'no-store' });
  },

  createFinancePayout: (data: FinancePayoutInput, token: string) =>
    request<{ payout: FinancePayout }>('/api/finance/payouts', { method: 'POST', body: JSON.stringify(data), token }),

  deleteFinancePayout: (id: number, token: string) =>
    request<void>(`/api/finance/payouts/${id}`, { method: 'DELETE', token }),

  listFinanceExpenses: (token: string) =>
    request<{ expenses: FinanceExpense[]; totals: { total: number; monthly: number; yearly: number } }>(
      '/api/finance/expenses',
      { token, cache: 'no-store' }
    ),

  createFinanceExpense: (data: FinanceExpenseInput, token: string) =>
    request<{ expense: FinanceExpense }>('/api/finance/expenses', { method: 'POST', body: JSON.stringify(data), token }),

  updateFinanceExpense: (id: number, data: Partial<FinanceExpenseInput>, token: string) =>
    request<{ expense: FinanceExpense }>(`/api/finance/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data), token }),

  deleteFinanceExpense: (id: number, token: string) =>
    request<void>(`/api/finance/expenses/${id}`, { method: 'DELETE', token }),

  listFinanceTransactions: (
    params: { type?: string; source_id?: number; from?: string; to?: string; payment_status?: string; limit?: number } = {},
    token?: string
  ) => {
    const qs = new URLSearchParams();
    if (params.type) qs.set('type', params.type);
    if (params.source_id !== undefined) qs.set('source_id', String(params.source_id));
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    if (params.payment_status) qs.set('payment_status', params.payment_status);
    if (params.limit !== undefined) qs.set('limit', String(params.limit));
    return request<{ transactions: FinanceTransaction[] }>(`/api/finance/transactions?${qs}`, { token, cache: 'no-store' });
  },
};
