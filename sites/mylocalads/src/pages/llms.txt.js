// /llms.txt — the llmstxt.org convention: a short, link-first index that an
// LLM reads to orient itself on the site without crawling every page.
import { llmsTxt } from '../lib/agent-docs.js';

export function GET() {
  return new Response(llmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
