import Link from 'next/link';
import type { HomeSection } from '@/lib/api';
import { ArticleCard } from '@/components/ArticleCard';

export function CategorySection({ section }: { section: HomeSection }) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between border-b-2 border-neutral-900 pb-2">
        <h2 className="text-xl font-extrabold uppercase tracking-wide">{section.category.name}</h2>
        <Link href={`/category/${section.category.slug}`} className="text-sm font-semibold text-red-600 hover:underline">
          View All &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {section.articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
