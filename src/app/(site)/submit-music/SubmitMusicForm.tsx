'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PENDING_KEY = 'artistheat_pending_submission';

type Tier = 'free' | 'priority';

interface FormState {
  artistName: string;
  email: string;
  title: string;
  genre: string;
  instagramUrl: string;
  content: string;
  youtubeUrl: string;
  spotifyUrl: string;
  soundcloudUrl: string;
  appleMusicUrl: string;
}

const EMPTY_FORM: FormState = {
  artistName: '',
  email: '',
  title: '',
  genre: '',
  instagramUrl: '',
  content: '',
  youtubeUrl: '',
  spotifyUrl: '',
  soundcloudUrl: '',
  appleMusicUrl: '',
};

const inputCls =
  'w-full border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:border-red-600 focus:outline-none';
const labelCls = 'block text-xs font-bold uppercase tracking-wide text-neutral-600 mb-1.5';

function Check() {
  return (
    <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function SubmitMusicForm() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [status, setStatus] = useState<'form' | 'success'>('form');
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    if (checkout === 'success') {
      sessionStorage.removeItem(PENDING_KEY);
      setStatus('success');
      window.history.replaceState({}, '', '/submit-music');
    } else if (checkout === 'canceled') {
      const saved = sessionStorage.getItem(PENDING_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setForm((p) => ({ ...p, ...parsed }));
        } catch {
          /* ignore */
        }
      }
      setTier('priority');
      setCanceled(true);
      window.history.replaceState({}, '', '/submit-music');
    }
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: '' }));
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((p) => ({ ...p, image: 'Images only' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: 'Image must be under 5MB' }));
      return;
    }
    setErrors((p) => ({ ...p, image: '' }));
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.artistName.trim()) e.artistName = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.title.trim()) e.title = 'Required';
    if (!form.content.trim()) e.content = 'Required';
    else if (form.content.trim().length < 50) e.content = 'At least 50 characters';
    if (!form.youtubeUrl && !form.spotifyUrl && !form.soundcloudUrl && !form.appleMusicUrl) e.links = 'At least one streaming link required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function uploadImageIfPresent(): Promise<string | null> {
    if (!imageFile) return null;
    const sigRes = await fetch(`${API_URL}/api/submissions/upload-signature`, { method: 'POST' });
    if (!sigRes.ok) throw new Error('Failed to prepare image upload');
    const { cloudName, apiKey, timestamp, signature, folder } = await sigRes.json();

    const fd = new FormData();
    fd.append('file', imageFile);
    fd.append('api_key', apiKey);
    fd.append('timestamp', String(timestamp));
    fd.append('signature', signature);
    fd.append('folder', folder);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
    if (!uploadRes.ok) throw new Error('Image upload failed');
    const data = await uploadRes.json();
    return data.secure_url as string;
  }

  async function handleFreeSubmit() {
    if (!validate()) return;
    setIsLoading(true);
    setServerError('');
    try {
      const imageUrl = await uploadImageIfPresent().catch(() => null);
      const res = await fetch(`${API_URL}/api/submissions/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const d = await res.json().catch(() => ({}));
        setServerError(d.error || 'Failed to submit. Please try again.');
      }
    } catch {
      setServerError('Network error. Please try again.');
    }
    setIsLoading(false);
  }

  async function handlePaidSubmit() {
    if (!validate()) return;
    setIsLoading(true);
    setServerError('');
    try {
      const imageUrl = await uploadImageIfPresent().catch(() => null);
      const res = await fetch(`${API_URL}/api/submissions/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, imageUrl }),
      });
      const d = await res.json();
      if (res.ok && d.url) {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(form));
        window.location.href = d.url;
        return;
      }
      setServerError(d.error || 'Failed to start checkout. Please try again.');
    } catch {
      setServerError('Network error. Please try again.');
    }
    setIsLoading(false);
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-[600px] px-4 py-20 text-center">
        <div className="mb-4 text-5xl">🎵</div>
        <h1 className="mb-3 text-2xl font-black uppercase tracking-wide text-neutral-900">
          {tier === 'priority' ? 'Payment received!' : 'Submission received!'}
        </h1>
        <p className="mb-2 text-neutral-700">
          {tier === 'priority'
            ? "You're at the top of the review queue. Expect to hear from us within 1–2 days."
            : "We'll review your music and get back to you within 5–7 days."}
        </p>
        <p className="mb-8 text-sm text-neutral-500">
          Confirmation sent to <span className="text-neutral-700">{form.email}</span>
        </p>
        <a href="/" className="inline-block bg-red-600 px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700">
          ← Back to ArtistHeat
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[800px] px-4 py-14">
      <h1 className="mb-2 inline-block border-b-2 border-red-600 pb-2 text-3xl font-black tracking-wide text-red-600 uppercase">
        Submit Your Music
      </h1>
      <p className="mt-4 mb-8 text-neutral-700">Get covered on ArtistHeat — music, art, and culture.</p>

      {!tier && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col border border-neutral-200 p-6">
            <h3 className="text-lg font-black uppercase tracking-wide text-neutral-900">Free Submission</h3>
            <div className="my-2 text-3xl font-black text-neutral-900">$0</div>
            <p className="mb-4 text-xs text-neutral-500">Standard review queue</p>
            <ul className="mb-6 flex-1 space-y-2 text-sm text-neutral-700">
              {['Coverage article on ArtistHeat', 'All streaming links embedded', '5–7 day turnaround'].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setTier('free')}
              className="w-full border border-neutral-300 py-2.5 text-sm font-bold uppercase tracking-wide text-neutral-700 hover:border-red-600 hover:text-red-600"
            >
              Submit Free →
            </button>
          </div>

          <div className="flex flex-col border-2 border-red-600 bg-neutral-950 p-6 text-white">
            <h3 className="text-lg font-black uppercase tracking-wide">⚡ Skip the Line</h3>
            <div className="my-2 text-3xl font-black text-red-500">$5</div>
            <p className="mb-4 text-xs text-neutral-400">Priority review queue</p>
            <ul className="mb-6 flex-1 space-y-2 text-sm text-neutral-200">
              {['Everything in Free', 'Jump to the top of the queue', '1–2 day turnaround'].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => setTier('priority')} className="w-full bg-red-600 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700">
              Skip the Line — $5 →
            </button>
          </div>
        </div>
      )}

      {tier && (
        <div className="max-w-2xl">
          <div className="mb-6 flex items-center justify-between border border-neutral-200 px-4 py-3">
            <span className="text-sm font-bold text-neutral-900">
              {tier === 'free' ? '📬 Free Submission' : '⚡ Skip the Line — $5'}
            </span>
            <button onClick={() => setTier(null)} className="text-xs text-neutral-400 underline hover:text-neutral-700">
              Change
            </button>
          </div>

          {canceled && (
            <div className="mb-5 flex items-center justify-between gap-3 border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <span>Payment canceled — your info wasn&apos;t charged. Pick up where you left off whenever you&apos;re ready.</span>
              <button onClick={() => setCanceled(false)} className="flex-shrink-0 text-amber-500 hover:text-amber-700">
                ✕
              </button>
            </div>
          )}

          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Artist Name <span className="text-red-600">*</span>
                </label>
                <input value={form.artistName} onChange={(e) => set('artistName', e.target.value)} placeholder="Your artist name" className={inputCls} disabled={isLoading} />
                {errors.artistName && <p className="mt-1 text-xs text-red-600">{errors.artistName}</p>}
              </div>
              <div>
                <label className={labelCls}>
                  Email <span className="text-red-600">*</span>
                </label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="your@email.com" className={inputCls} disabled={isLoading} />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Song / Project Title <span className="text-red-600">*</span>
              </label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Name of your song, EP, or album" className={inputCls} disabled={isLoading} />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>
                  Genre <span className="font-normal normal-case text-neutral-400">(optional)</span>
                </label>
                <input value={form.genre} onChange={(e) => set('genre', e.target.value)} placeholder="e.g. R&B, Afrobeats, Hip-Hop" className={inputCls} disabled={isLoading} />
              </div>
              <div>
                <label className={labelCls}>
                  Instagram <span className="font-normal normal-case text-neutral-400">(optional)</span>
                </label>
                <input value={form.instagramUrl} onChange={(e) => set('instagramUrl', e.target.value)} placeholder="@yourhandle" className={inputCls} disabled={isLoading} />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                About Your Sound <span className="text-red-600">*</span>
              </label>
              <textarea
                value={form.content}
                onChange={(e) => set('content', e.target.value)}
                rows={4}
                placeholder="Tell us about your music, your style, your story. (min 50 chars)"
                className={`${inputCls} resize-none`}
                disabled={isLoading}
              />
              <div className="mt-1 flex items-center justify-between">
                {errors.content ? <p className="text-xs text-red-600">{errors.content}</p> : <span className="text-[10px] text-neutral-400">min 50 chars</span>}
                <span className={`font-mono text-[10px] ${form.content.length >= 50 ? 'text-red-600' : 'text-neutral-400'}`}>{form.content.length}</span>
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Streaming Links <span className="text-red-600">*</span> <span className="font-normal normal-case text-neutral-400">(at least one)</span>
              </label>
              {errors.links && <p className="mb-2 text-xs text-red-600">{errors.links}</p>}
              <div className="space-y-2">
                {([
                  ['spotifyUrl', 'Spotify', 'https://open.spotify.com/track/...'],
                  ['youtubeUrl', 'YouTube', 'https://youtube.com/watch?v=...'],
                  ['appleMusicUrl', 'Apple Music', 'https://music.apple.com/...'],
                  ['soundcloudUrl', 'SoundCloud', 'https://soundcloud.com/...'],
                ] as const).map(([key, label, ph]) => (
                  <input
                    key={key}
                    type="url"
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={`${label} — ${ph}`}
                    className={`${inputCls} text-xs`}
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Cover Art <span className="font-normal normal-case text-neutral-400">(optional · max 5MB)</span>
              </label>
              {imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="h-44 w-full border border-neutral-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center border border-neutral-300 bg-white text-xs hover:bg-red-600 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <input type="file" accept="image/*" onChange={handleImage} disabled={isLoading} className="text-sm text-neutral-600" />
              )}
              {errors.image && <p className="mt-1 text-xs text-red-600">{errors.image}</p>}
            </div>

            {serverError && <p className="text-sm text-red-600">{serverError}</p>}

            {tier === 'free' ? (
              <button
                onClick={handleFreeSubmit}
                disabled={isLoading}
                className="w-full border border-neutral-300 py-3.5 text-sm font-bold uppercase tracking-wide text-neutral-900 hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Submitting…' : 'Submit Free →'}
              </button>
            ) : (
              <button
                onClick={handlePaidSubmit}
                disabled={isLoading}
                className="w-full bg-red-600 py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Redirecting to secure checkout…' : 'Pay $5 & Submit →'}
              </button>
            )}
            <p className="text-center text-[10px] text-neutral-400">Secure payment via Stripe. Non-refundable regardless of outcome.</p>
          </div>
        </div>
      )}
    </div>
  );
}
