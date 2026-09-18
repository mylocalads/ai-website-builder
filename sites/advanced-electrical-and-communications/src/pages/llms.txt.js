// /llms.txt — llmstxt.org convention. Generated from the content collections,
// so it can never disagree with the site it describes.
import { getEntry, getCollection } from 'astro:content';
import { llmsTxt, publishedServices, publishedAreas } from '../lib/agent-docs.js';

export async function GET() {
  const site = (await getEntry('site', 'config')).data;
  // Same caps and slug filtering the routes apply, so every link resolves.
  const services = publishedServices(await getCollection('services'));
  const areas = publishedAreas(await getCollection('service_areas'));

  return new Response(llmsTxt({ site, services, areas }), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
