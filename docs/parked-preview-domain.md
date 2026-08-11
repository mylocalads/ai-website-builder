# Parked: branded preview URLs, once DNS moves to Cloudflare

**Status:** parked 2026-08-11. Not blocking anything — the pipeline works today
using the interim approach below.

**Picking this up needs one prerequisite:** `mylocalads.co` DNS moved off
Squarespace to a provider with an API.

---

## What we wanted

Every build gets a public preview at `{slug}.preview.mylocalads.co`, so a client
sees their new site on an MLA-branded URL before they own a domain. The client
portal shows that URL under **Web → Website**.

## Why it is parked

The client site's own `*.vercel.app` URL is SSO-gated, so it shows a client a
login wall. A public host on a domain we control is the fix — but creating one
per client needs a DNS record per client, created automatically.

**`mylocalads.co` DNS is UI-only.** The registration sits with Squarespace
(registrar Key-Systems) while the nameservers are still Google's legacy
`ns-cloud-d1..d4.googledomains.com`. Records are edited through Squarespace's
web interface, and **Squarespace publishes no DNS API**. Nothing can create a
record programmatically.

Two other approaches were tested against the live Vercel account and rejected
before landing here. Do not re-propose either:

*A wildcard `*.preview.mylocalads.co`* routes to exactly one Vercel project, and
every client site is its own project. Wildcards also require Vercel nameservers.

*Delegating the `preview` subzone to Vercel's nameservers.* Vercel refuses to
hold a subdomain as a zone:

```
$ vercel domains add preview.mylocalads.co
{ "reason": "project_required_for_subdomain",
  "message": "Only apex domains can be added without a project." }
```

A subdomain exists on Vercel only as a *project* domain — the CNAME/A method —
which puts us back at needing per-client DNS writes.

---

## What is running instead

Client sites are previewed on their `*.vercel.app` URL with deployment
protection **off**, and a host-scoped `X-Robots-Tag: noindex` in the template's
`vercel.json` matching `.*\.vercel\.app`.

That header is what makes disabling SSO safe. The original rule against turning
SSO off existed to stop the vercel.app copy competing with the client's real site
in search results; a header scoped to the host solves that directly, and it stops
applying the moment the site is served from the client's own domain.

The cost is cosmetic: the client sees `joes-plumbing-a1b2c3.vercel.app` rather
than something branded.

---

## Picking it up after the Cloudflare move

**Prerequisite:** `mylocalads.co` nameservers pointed at Cloudflare, existing
records imported and verified. Do that on its own and confirm mail and the
marketing site still work *before* touching any of this — a nameserver change
moves MX, the marketing site and `client.mylocalads.co` all at once.

Then, per build, in `vercel-deploy`:

1. `vercel domains add {slug}.preview.mylocalads.co {project}` — returns the
   record Vercel requires
2. Create that `CNAME` in Cloudflare via its API
3. Wait for Vercel to verify and issue the certificate
4. Report the result as `stagingUrl` to `POST /api/builds/{id}/complete`

**Read the CNAME target out of Vercel's reply every time.** It is per project —
`client.mylocalads.co` points at `6be47abb7ef38542.vercel-dns-017.com` — so a
templated or copied value produces a record that resolves somewhere else and
never verifies. The symptom appears hours later as "still misconfigured", with
nothing pointing at the cause.

Cloudflare's API needs a token scoped to **Zone → DNS → Edit on that zone only**.
Not a global key: this credential lives on the runner droplet, and its blast
radius should be one zone's records.

Then reverse the interim: scope the `noindex` header to
`.*\.preview\.mylocalads\.co` instead of `.*\.vercel\.app`, and turn deployment
protection back on for client projects.

**Never add a static `<meta name="robots" content="noindex">` to the template.**
It is baked into the HTML, blind to which host served it, and would follow the
site onto the client's own domain and de-index the thing they paid for. The
whole mechanism depends on the header being host-scoped.

---

## Related

- `.claude/skills/vercel-deploy/SKILL.md` — the deploy step this changes
- `docs/runner-droplet.md` — where the credential would live
- Portal spec §8.1 in `mla-starter-hub`
