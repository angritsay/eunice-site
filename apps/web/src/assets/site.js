// @ts-check
// Eunice site behaviour. No framework, no dependencies: this file is all the
// JavaScript a visitor downloads.
(() => {
  /** @type {{ preview: boolean, contactEmail: string, careersEmail: string, formEndpoint: string, page: string, audience?: string }} */
  const CFG = JSON.parse(document.getElementById('eunice-config')?.textContent || '{}');
  const PREVIEW = Boolean(CFG.preview);

  // ---------- Mobile menu ----------
  document.addEventListener('click', (e) => {
    const btn = /** @type {HTMLElement} */ (e.target).closest('.nav__menu');
    if (!btn) return;
    const links = btn.closest('.nav')?.querySelector('.nav__links');
    if (!links) return;
    const open = !links.classList.contains('is-open');
    links.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  // ---------- Leadership bios: hover on desktop, tap anywhere ----------
  document.addEventListener('click', (e) => {
    const name = /** @type {HTMLElement} */ (e.target).closest('button.person__name');
    if (!name) return;
    const card = name.closest('.person');
    if (!card) return;
    const open = !card.classList.contains('is-open');
    card.classList.toggle('is-open', open);
    name.setAttribute('aria-expanded', String(open));
  });

  // ---------- Contact and application dialog ----------
  // Every button that opens it names a form variant (data-form) and where it sits
  // (data-placement). With this page's path and audience, that is the entry point:
  // the context sent with the submission so ops knows where the visitor came from.
  const dialog = /** @type {HTMLDialogElement | null} */ (document.getElementById('talk'));
  const form = dialog?.querySelector('form');

  /** State for the form that is open now. */
  let open =
    /** @type {null | { variant: string, entry: Record<string, string>, idempotencyKey: string, openedAt: number, queue: string }} */ (
      null
    );

  const errorBox = () => /** @type {HTMLElement | null} */ (dialog?.querySelector('[data-error]'));
  const hideError = () => {
    const box = errorBox();
    if (box) box.hidden = true;
  };

  /** @param {HTMLElement} trigger */
  function openDialog(trigger) {
    if (!dialog || !form) return;
    const variant = trigger.dataset['form'] || 'general';
    const sets = /** @type {NodeListOf<HTMLFieldSetElement>} */ (form.querySelectorAll('fieldset[data-variant]'));
    const active = [...sets].find((s) => s.dataset['variant'] === variant) || sets[0];
    if (!active) return;
    for (const s of sets) {
      const on = s === active;
      s.hidden = !on;
      s.disabled = !on; // disabled fields are neither validated nor submitted
    }
    const role = trigger.dataset['role'];
    const title = /** @type {HTMLElement} */ (dialog.querySelector('[data-title]'));
    const lead = /** @type {HTMLElement} */ (dialog.querySelector('[data-lead]'));
    title.textContent = role ? `Apply: ${role}` : active.dataset['title'] || '';
    lead.textContent = active.dataset['lead'] || '';

    /** @type {Record<string, string>} */
    const entry = { page: CFG.page || '', placement: trigger.dataset['placement'] || 'body' };
    if (CFG.audience) entry['audience'] = CFG.audience;
    if (role) entry['role'] = role;
    open = {
      variant: active.dataset['variant'] || variant,
      entry,
      queue: active.dataset['queue'] || 'leads',
      // One key per opening of the form: a double click or a retry after a timeout
      // cannot create two leads, because the server stores each key only once.
      idempotencyKey: crypto.randomUUID(),
      openedAt: performance.now(),
    };

    dialog.classList.remove('is-done');
    hideError();
    for (const el of form.querySelectorAll('[aria-invalid]')) el.removeAttribute('aria-invalid');
    for (const n of document.querySelectorAll('.nav__links.is-open')) n.classList.remove('is-open');
    dialog.showModal();
    /** @type {HTMLElement | null} */ (active.querySelector('input, textarea, select'))?.focus();
  }

  document.addEventListener('click', (e) => {
    const t = /** @type {HTMLElement} */ (e.target).closest('[data-form]');
    if (!(t instanceof HTMLElement) || t.closest('form')) return;
    e.preventDefault();
    openDialog(t);
  });

  /** A W3C traceparent: one trace then follows the submission from here to the ops inbox. */
  function traceparent() {
    const hex = (/** @type {number} */ bytes) =>
      [...crypto.getRandomValues(new Uint8Array(bytes))].map((b) => b.toString(16).padStart(2, '0')).join('');
    return `00-${hex(16)}-${hex(8)}-01`;
  }

  /** The utm_* parameters on this URL. Nothing is stored to carry them between pages. */
  function utm() {
    const params = new URLSearchParams(location.search);
    /** @type {Record<string, string>} */
    const out = {};
    for (const key of ['source', 'medium', 'campaign', 'term', 'content']) {
      const value = params.get(`utm_${key}`);
      if (value) out[key] = value.slice(0, 100);
    }
    return Object.keys(out).length ? out : undefined;
  }

  /** Hands the message to the visitor's own mail app. Returns who it is addressed to. */
  function mailtoFallback(/** @type {Record<string, string>} */ fields) {
    if (!open) return '';
    const to = open.queue === 'careers' ? CFG.careersEmail : CFG.contactEmail;
    const subject = [open.entry['role'] || open.variant, fields['name']].filter(Boolean).join(' — ');
    const body = Object.entries(fields)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
    // An anchor click rather than assigning location: the same hand-off to the mail
    // app for a visitor, and a boundary a test can observe without leaving the page.
    const link = document.createElement('a');
    link.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.click();
    return to;
  }

  /** Marks the inputs the server rejected, from RFC 9457 problem details. */
  function markInvalid(/** @type {{ errors?: { path: string }[] }} */ problem) {
    if (!form) return;
    for (const err of problem.errors || []) {
      const name = err.path.replace(/^fields\./, '');
      form.querySelector(`fieldset:not([disabled]) [name="${CSS.escape(name)}"]`)?.setAttribute('aria-invalid', 'true');
    }
  }

  if (dialog && form) {
    dialog.addEventListener('click', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      if (target === dialog || target.closest('[data-close]')) dialog.close();
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!open) return;
      const current = open;
      hideError();
      const data = new FormData(form);
      const website = String(data.get('website') || '');
      data.delete('website');
      /** @type {Record<string, string>} */
      const fields = {};
      for (const [k, v] of data.entries()) {
        const value = String(v).trim();
        if (value) fields[k] = value;
      }

      const done = (/** @type {string} */ to) => {
        const doneTo = dialog.querySelector('[data-done-to]');
        if (doneTo) doneTo.textContent = to;
        dialog.classList.add('is-done');
        form.reset();
        open = null;
      };

      if (!CFG.formEndpoint) {
        // No endpoint (the default until a privacy notice is published): the visitor's
        // own mail app sends it, and nothing is collected on our side.
        done(PREVIEW ? 'the desk' : mailtoFallback(fields) || 'the desk');
        return;
      }

      const submit = /** @type {HTMLButtonElement | null} */ (form.querySelector('[type="submit"]'));
      if (submit) submit.disabled = true;
      try {
        const res = await fetch(CFG.formEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, application/problem+json',
            'Idempotency-Key': current.idempotencyKey,
            traceparent: traceparent(),
          },
          body: JSON.stringify({
            variant: current.variant,
            fields,
            entry: current.entry,
            attribution: { referrer: document.referrer.slice(0, 500), utm: utm() },
            website,
            elapsedMs: Math.round(performance.now() - current.openedAt),
          }),
        });
        if (res.ok) {
          done(current.queue === 'careers' ? 'the team' : 'the desk');
          return;
        }
        if (res.status === 400) markInvalid(await res.json().catch(() => ({})));
        throw new Error(`HTTP ${res.status}`);
      } catch {
        const box = errorBox();
        if (box) box.hidden = false;
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  }

  // ---------- Insights filter ----------
  /** @param {Element} root @param {string | null} initial */
  function setupFilter(root, initial) {
    const chips = /** @type {NodeListOf<HTMLElement>} */ (root.querySelectorAll('[data-filter]'));
    const rows = /** @type {NodeListOf<HTMLElement>} */ (root.querySelectorAll('.irow'));
    const empty = /** @type {HTMLElement | null} */ (root.querySelector('.empty'));
    /** @param {string} key */
    function apply(key) {
      let shown = 0;
      for (const c of chips) {
        const on = c.dataset['filter'] === key;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', String(on));
      }
      for (const r of rows) {
        const ok = key === 'all' || r.dataset['desk'] === key;
        r.hidden = !ok;
        if (ok) shown++;
      }
      if (empty) empty.hidden = shown > 0;
    }
    for (const c of chips) c.addEventListener('click', () => apply(c.dataset['filter'] || 'all'));
    apply(initial || 'all');
    return apply;
  }
  /** @type {((key: string) => void)[]} */
  const filters = [];
  for (const root of document.querySelectorAll('[data-insights]')) {
    filters.push(setupFilter(root, new URLSearchParams(location.search).get('desk')));
  }

  // ---------- Preview router: every page in one file, addressed as #/slug/anchor?desk=x ----------
  if (PREVIEW) {
    const routes = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('[data-route]'));
    const go = () => {
      const raw = location.hash.replace(/^#\/?/, '');
      const [pathPart = '', query = ''] = raw.split('?');
      // A slug can itself contain a slash ('private-markets/lps'), so match the
      // longest known route and treat whatever is left over as the anchor.
      const names = new Set([...routes].map((r) => r.dataset['route']));
      let slug = pathPart;
      let anchor = '';
      while (slug && !names.has(slug) && slug.includes('/')) {
        const cut = slug.lastIndexOf('/');
        anchor = slug.slice(cut + 1);
        slug = slug.slice(0, cut);
      }
      if (!slug) slug = 'home';
      let found = false;
      for (const r of routes) {
        const on = r.dataset['route'] === slug;
        r.hidden = !on;
        if (on) found = true;
      }
      if (!found) for (const r of routes) r.hidden = r.dataset['route'] !== 'home';
      const page = /** @type {HTMLElement | null} */ (document.querySelector('[data-route]:not([hidden])'));
      if (!page) return;
      document.title = page.dataset['title'] || document.title;
      const desk = new URLSearchParams(query).get('desk');
      if (desk) for (const f of filters) f(desk);
      const target = anchor && page.querySelector(`#${CSS.escape(anchor)}`);
      if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      else window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', go);
    go();
  }
})();
