// project-map: JSON feed.
//
// Emits dist/projects.json (a real file — non-HTML endpoints bypass
// build.format: 'directory'; verified against this project).

import type { APIRoute } from 'astro';
import { buildProjectMapPayload } from '../lib/project-map-payload';

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildProjectMapPayload()), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // TRAP: in a static build these headers are DISCARDED. Astro writes only
      // the body to disk, so this line works in `astro dev` / `astro preview`
      // and does nothing in production. Do not trust a local CORS check.
      //
      // Production CORS, if it ever matters, comes from vercel.json — and the
      // cross-origin path that does NOT depend on any header is /projects.js.
      'access-control-allow-origin': '*',
    },
  });
