// /index.md — long-form markdown mirror of the site for agents that want the
// detail without parsing HTML. /llms.txt links here as its "Optional" entry.
import { getEntry, getCollection } from 'astro:content';
import { indexMd, publishedServices, publishedAreas } from '../lib/agent-docs.js';

export async function GET() {
  const site = (await getEntry('site', 'config')).data;
  // Same caps and slug filtering the routes apply, so every link resolves.
  const services = publishedServices(await getCollection('services'));
  const areas = publishedAreas(await getCollection('service_areas'));

  return new Response(indexMd({ site, services, areas }), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
