import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/auth', '/profile'] },
    sitemap: 'https://eyetriage.visibleclinic.com/sitemap.xml',
  };
}
