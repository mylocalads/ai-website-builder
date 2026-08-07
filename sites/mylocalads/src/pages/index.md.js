// /index.md — long-form markdown mirror of the site for agents that want the
// detail without parsing HTML. /llms.txt links here as its "Optional" entry.
import { indexMd } from '../lib/agent-docs.js';

export function GET() {
  return new Response(indexMd(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
