'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const ROTATE_MS = 4500;
const FADE_MS = 300;

interface TrendingItem {
  id: number;
  slug: string;
  title: string;
}

export function TrendingBarTicker({ items }: { items: TrendingItem[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (items.length < 2) return;

    const interval = setInterval(() => {
      setVisible(false);
      fadeTimeout.current = setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimeout.current);
    };
  }, [items.length]);

  const current = items[index];
  if (!current) return null;

  return (
    <Link
      href={`/${current.slug}`}
      className={`truncate text-sm font-semibold text-red-400 transition-opacity hover:text-red-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      {current.title}
    </Link>
  );
}
