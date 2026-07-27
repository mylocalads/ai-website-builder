import type { APIRoute } from 'astro';

// Runs on demand as a serverless function even though the rest of the site is
// prerendered. Without this the route would be baked to a static file at build
// time and could never accept a POST.
export const prerender = false;

const REQUIRED = ['full_name', 'email', 'phone', 'address', 'service'] as const;

const SERVICES = new Set([
  'Attic venting',
  'Gutter installation',
  'Gutter repair',
  'Other',
  'Roof damage repair',
  'Roof inspection',
  'Roof installation',
  'Roof repair',
  'Skylight installation',
  'Skylight repair',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function redirect(to: string, status = 303): Response {
  return new Response(null, { status, headers: { Location: to } });
}

/**
 * Verifies a Cloudflare Turnstile or Google reCAPTCHA token when a secret is
 * configured. With no secret configured this returns true — the honeypot and
 * field validation still apply, but a captcha that was never set up must not
 * hard-block real submissions.
 */
async function captchaOk(form: FormData, ip: string | null): Promise<boolean> {
  const turnstile = process.env.TURNSTILE_SECRET_KEY;
  const recaptcha = process.env.RECAPTCHA_SECRET_KEY;
  if (!turnstile && !recaptcha) return true;

  const endpoint = turnstile
    ? 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
    : 'https://www.google.com/recaptcha/api/siteverify';
  const token =
    (form.get('cf-turnstile-response') as string | null) ??
    (form.get('g-recaptcha-response') as string | null);
  if (!token) return false;

  const body = new URLSearchParams({ secret: (turnstile ?? recaptcha)!, response: token });
  if (ip) body.set('remoteip', ip);

  try {
    const res = await fetch(endpoint, { method: 'POST', body });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirect('/book?error=invalid');
  }

  const get = (k: string) => ((form.get(k) as string | null) ?? '').trim();

  // Honeypot. A real person never sees this field, so any value is a bot.
  // Answer 303 as though it succeeded so the bot gets no signal to retry.
  if (get('company') !== '') return redirect('/thank-you');

  const missing = REQUIRED.filter((k) => get(k) === '');
  if (missing.length) return redirect('/book?error=missing');
  if (!EMAIL_RE.test(get('email'))) return redirect('/book?error=email');
  if (!SERVICES.has(get('service'))) return redirect('/book?error=service');
  // TCPA consent is the legal basis for calling or texting this person. No
  // checkbox, no lead — this is not a field to be lenient about.
  if (!form.get('tcpa_consent')) return redirect('/book?error=consent');

  const ip = clientAddress ?? null;
  if (!(await captchaOk(form, ip))) return redirect('/book?error=captcha');

  const lead = {
    full_name: get('full_name'),
    email: get('email'),
    phone: get('phone'),
    address: get('address'),
    service: get('service'),
    tcpa_consent: true,
    tcpa_consent_text:
      'I consent to receive informational and marketing Emails, Text messages, and Calls. I understand that I can opt-out at any time and that communication frequency may vary.',
    source_url: request.headers.get('referer') ?? null,
    submitted_at: new Date().toISOString(),
    ip,
  };

  const webhook = process.env.LEAD_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const notifyTo = process.env.LEAD_NOTIFY_EMAIL;
  const notifyFrom = process.env.LEAD_FROM_EMAIL;

  try {
    if (webhook) {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error(`webhook ${res.status}`);
    } else if (resendKey && notifyTo && notifyFrom) {
      const rows = Object.entries(lead)
        .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${v ?? ''}</td></tr>`)
        .join('');
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: notifyFrom,
          to: [notifyTo],
          reply_to: lead.email,
          subject: `New estimate request — ${lead.full_name} (${lead.service})`,
          html: `<h2>New estimate request</h2><table>${rows}</table>`,
        }),
      });
      if (!res.ok) throw new Error(`resend ${res.status}`);
    } else {
      // No destination configured. Fail loudly in the log and tell the visitor
      // to call, rather than accepting the lead and dropping it on the floor.
      console.error('[estimate] No destination configured. Set LEAD_WEBHOOK_URL, or RESEND_API_KEY + LEAD_NOTIFY_EMAIL + LEAD_FROM_EMAIL.');
      return redirect('/book?error=unavailable');
    }
  } catch (err) {
    console.error('[estimate] delivery failed:', err);
    return redirect('/book?error=delivery');
  }

  return redirect('/thank-you');
};

// A GET on this path is almost always someone pasting the URL. Send them to
// the form rather than returning a bare 405.
export const GET: APIRoute = async () => redirect('/book');
