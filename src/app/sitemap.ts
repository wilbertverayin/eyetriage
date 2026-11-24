import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://eyetriage.visibleclinic.com';
  return [
    { url: `${base}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/support`, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
