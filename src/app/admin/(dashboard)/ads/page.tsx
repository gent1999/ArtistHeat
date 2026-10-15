import { getSessionToken } from '@/lib/session';
import { api } from '@/lib/api';
import { AdsEnabledToggle } from './AdsEnabledToggle';
import { AdBannerForm } from './AdBannerForm';
import { AdBannerList } from './AdBannerList';

export default async function AdminAdsPage() {
  const token = (await getSessionToken())!;
  const [{ settings }, { banners }] = await Promise.all([api.getSiteSettings(), api.listAdBanners(token)]);

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <div>
        <h1 className="mb-6 text-2xl font-bold">Ad Settings</h1>
        <AdsEnabledToggle initialEnabled={settings.adsEnabled} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold">New Banner Ad</h2>
        <AdBannerForm />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">All Banner Ads</h2>
          <span className="text-xs text-neutral-500">{banners.length} total</span>
        </div>
        <AdBannerList banners={banners} />
      </div>
    </div>
  );
}
