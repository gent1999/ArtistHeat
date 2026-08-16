import { api } from '@/lib/api';
import { FeaturedSection } from '@/components/FeaturedSection';
import { CategorySection } from '@/components/CategorySection';
import { Sidebar } from '@/components/Sidebar';

export default async function HomePage() {
  const { featured, sections } = await api.getHome();

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-10 pb-6">
      <h1 className="sr-only">ArtistHeat</h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          <FeaturedSection articles={featured} />
          {sections.map((section) => (
            <CategorySection key={section.category.id} section={section} />
          ))}
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
