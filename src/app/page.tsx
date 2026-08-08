import { api } from '@/lib/api';
import { FeaturedSection } from '@/components/FeaturedSection';
import { CategorySection } from '@/components/CategorySection';
import { Sidebar } from '@/components/Sidebar';

export default async function HomePage() {
  const { featured, sections } = await api.getHome();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="sr-only">ArtistHeat</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <FeaturedSection articles={featured} />
        <Sidebar />
      </div>
      <div className="mt-16 flex flex-col gap-16">
        {sections.map((section) => (
          <CategorySection key={section.category.id} section={section} />
        ))}
      </div>
    </div>
  );
}
