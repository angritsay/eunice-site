// One-shot setup for the local Umami: replace the default admin password, and register
// the site under a fixed website id, so the site build can name it in advance.
// Idempotent: safe to run on every `docker compose up`. No dependencies beyond Node.
const base = process.env.UMAMI_URL ?? 'http://umami:3000';
const websiteId = process.env.UMAMI_WEBSITE_ID;
const password = process.env.UMAMI_ADMIN_PASSWORD;
const domain = process.env.UMAMI_WEBSITE_DOMAIN ?? 'localhost';
if (!websiteId || !password) throw new Error('UMAMI_WEBSITE_ID and UMAMI_ADMIN_PASSWORD are required');

const call = async (path, { token, body, method = body ? 'POST' : 'GET' } = {}) => {
  const res = await fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

async function login() {
  for (const pw of [password, 'umami']) {
    const r = await call('/api/auth/login', { body: { username: 'admin', password: pw } });
    if (r.status === 200) return { token: r.body.token, isDefault: pw === 'umami' && pw !== password };
  }
  throw new Error('cannot log in to Umami as admin');
}

let { token, isDefault } = await login();
if (isDefault) {
  const r = await call('/api/me/password', { token, body: { currentPassword: 'umami', newPassword: password } });
  if (r.status !== 200) throw new Error(`could not replace the default admin password: ${r.status}`);
  console.log('umami: default admin password replaced');
  // Changing the password ends the session it was changed in.
  ({ token } = await login());
}

const existing = await call(`/api/websites/${websiteId}`, { token });
if (existing.status === 200 && existing.body?.id === websiteId) {
  console.log(`umami: website ${websiteId} already registered`);
} else {
  const r = await call('/api/websites', { token, body: { id: websiteId, name: 'eunice.ai', domain } });
  if (r.status !== 200) throw new Error(`could not register the website: ${r.status} ${JSON.stringify(r.body)}`);
  console.log(`umami: website ${websiteId} registered`);
}
