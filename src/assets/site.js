// Eunice site behaviour. No framework, no dependencies.
(function () {
  const CFG = window.EUNICE || {};
  const PREVIEW = !!CFG.preview;

  // What the dialog says for each entry point.
  const TOPICS = {
    general: { title: 'Talk to us', lead: 'Tell us what you are reviewing. Someone from the right desk replies within one working day.', desk: 'General' },
    'private-markets': { title: 'Talk to the Private Markets desk', lead: 'Bring the fund you are reviewing now. A thirty-minute call; we show you what Eunice reads and returns.', desk: 'Private Markets' },
    'digital-assets': { title: 'Talk to the Digital Assets desk', lead: 'Pick a token you are reviewing now. We run it and show you the report and the monitoring feed.', desk: 'Digital Assets' },
    'token-disclosure': { title: 'Start a white paper', lead: 'Tell us about the token and where it will be offered. We come back with scope and timing.', desk: 'Token Disclosure' },
    'sample-report': { title: 'See a sample report', lead: 'We send a redacted listing report so your committee can see the format.', desk: 'Digital Assets' },
  };

  // ---------- Mobile menu ----------
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav__menu');
    if (!btn) return;
    const links = btn.closest('.nav').querySelector('.nav__links');
    const open = !links.classList.contains('is-open');
    links.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  // ---------- Leadership bios: hover on desktop, tap anywhere ----------
  document.addEventListener('click', (e) => {
    const name = e.target.closest('button.person__name');
    if (!name) return;
    const card = name.closest('.person');
    const open = !card.classList.contains('is-open');
    card.classList.toggle('is-open', open);
    name.setAttribute('aria-expanded', String(open));
  });

  // ---------- Contact / apply dialog ----------
  const dialog = document.getElementById('talk');
  const form = dialog && dialog.querySelector('form');
  function openDialog({ topic, role }) {
    if (!dialog) return;
    const t = role
      ? { title: role === 'general' ? 'Write to the team' : 'Apply: ' + role, lead: 'Send a CV or a link to something you built, and two lines on why regulated finance. We answer everyone.', desk: 'Careers' }
      : TOPICS[topic] || TOPICS.general;
    dialog.classList.remove('is-done');
    dialog.querySelector('[data-title]').textContent = t.title;
    dialog.querySelector('[data-lead]').textContent = t.lead;
    form.elements.topic.value = t.desk;
    form.elements.role.value = role && role !== 'general' ? role : '';
    form.elements.company.closest('.field').querySelector('span').textContent = role ? 'Link to your CV or work' : 'Firm';
    form.elements.message.placeholder = role ? 'Two lines on why regulated finance' : 'The fund, token or question you have in mind';
    document.querySelectorAll('.nav__links.is-open').forEach((n) => n.classList.remove('is-open'));
    dialog.showModal();
    form.elements.name.focus();
  }
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-talk], [data-role]');
    if (!t) return;
    e.preventDefault();
    openDialog({ topic: t.dataset.talk, role: t.dataset.role });
  });
  if (dialog) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog || e.target.closest('[data-close]')) dialog.close();
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const to = data.topic === 'Careers' ? CFG.careersEmail : CFG.contactEmail;
      try {
        if (CFG.formEndpoint) {
          const res = await fetch(CFG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
          if (!res.ok) throw new Error('Request failed');
        } else if (!PREVIEW) {
          const subject = `${data.topic}${data.role ? ' — ' + data.role : ''} — ${data.name}`;
          const body = `${data.message}\n\n${data.name}\n${data.email}\n${data.company}`;
          window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        }
        dialog.querySelector('[data-done-to]').textContent = CFG.formEndpoint || PREVIEW ? 'the desk' : to;
        dialog.classList.add('is-done');
        form.reset();
      } catch (err) {
        dialog.querySelector('[data-error]').hidden = false;
      }
    });
  }

  // ---------- Insights filter ----------
  function setupFilter(root, initial) {
    const chips = root.querySelectorAll('[data-filter]');
    const rows = root.querySelectorAll('.irow');
    const empty = root.querySelector('.empty');
    function apply(key) {
      let shown = 0;
      chips.forEach((c) => { const on = c.dataset.filter === key; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
      rows.forEach((r) => { const ok = key === 'all' || r.dataset.desk === key; r.hidden = !ok; if (ok) shown++; });
      if (empty) empty.hidden = shown > 0;
    }
    chips.forEach((c) => c.addEventListener('click', () => apply(c.dataset.filter)));
    apply(initial || 'all');
    return apply;
  }
  const filters = [];
  document.querySelectorAll('[data-insights]').forEach((root) => {
    const q = new URLSearchParams(location.search).get('desk');
    filters.push(setupFilter(root, q));
  });

  // ---------- Preview router: every page in one file, addressed as #/slug/anchor?desk=x ----------
  if (PREVIEW) {
    const routes = document.querySelectorAll('[data-route]');
    function go() {
      const raw = location.hash.replace(/^#\/?/, '');
      const [pathPart, query = ''] = raw.split('?');
      let [slug, anchor] = pathPart.split('/');
      if (!slug) slug = 'home';
      let found = false;
      routes.forEach((r) => { const on = r.dataset.route === slug; r.hidden = !on; if (on) found = true; });
      if (!found) routes.forEach((r) => { r.hidden = r.dataset.route !== 'home'; });
      const page = document.querySelector('[data-route]:not([hidden])');
      document.title = page.dataset.title;
      const desk = new URLSearchParams(query).get('desk');
      if (desk) filters.forEach((f) => f(desk));
      const target = anchor && page.querySelector('#' + CSS.escape(anchor));
      if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      else window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', go);
    go();
  }
})();
