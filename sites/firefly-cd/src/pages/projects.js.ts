// project-map: JSONP-style transport for the future paste-anywhere embed.
//
// A <script src="https://client.com/projects.js"> tag is not subject to CORS
// and never has been. This exists from day one so the phase-2 embed can never
// be blocked on a response-header question we cannot control from a static
// build. Phase 2 reads window.MLA_PROJECT_MAP.
//
// Phase 1 does not use this file — /our-work fetches /projects.json
// same-origin. It costs ~15 lines and removes a whole class of future rework.

import type { APIRoute } from 'astro';
import { buildProjectMapPayload } from '../lib/project-map-payload';

export const GET: APIRoute = async () =>
  new Response(
    `window.MLA_PROJECT_MAP=${JSON.stringify(await buildProjectMapPayload())};`,
    { headers: { 'content-type': 'application/javascript; charset=utf-8' } },
  );
