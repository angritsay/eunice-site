// The contact and application dialog, rendered from the form registry in
// @eunice/contracts. The intake service validates submissions against the same
// variant definitions, so what a visitor is asked and what the server accepts are
// one object and cannot drift apart.
//
// Every variant is rendered once, as a disabled fieldset. site.js enables the one
// that matches the button pressed: a disabled fieldset is neither validated nor
// submitted, so each variant keeps its own required fields.
import { variants } from '@eunice/contracts/forms';
import { esc } from './components.js';

const INPUT_TYPES = { text: 'text', email: 'email', url: 'url' };

function control(variant, f) {
  const id = `f-${variant.id}-${f.name}`;
  const attrs = [
    `id="${id}"`,
    `name="${f.name}"`,
    f.required ? 'required' : '',
    f.placeholder ? `placeholder="${esc(f.placeholder)}"` : '',
    f.autocomplete ? `autocomplete="${esc(f.autocomplete)}"` : '',
  ]
    .filter(Boolean)
    .join(' ');
  let input;
  if (f.kind === 'textarea') input = `<textarea ${attrs}></textarea>`;
  else if (f.kind === 'select') {
    const options = f.options.map((o) => `<option>${esc(o)}</option>`).join('');
    input = `<select ${attrs}><option value="">Choose one</option>${options}</select>`;
  } else input = `<input ${attrs} type="${INPUT_TYPES[f.kind]}">`;
  return `<label class="field${f.wide ? ' full' : ''}"><span>${esc(f.label)}</span>${input}</label>`;
}

const fieldset = (v) => `
      <fieldset class="form__fields full" data-variant="${v.id}" data-title="${esc(v.title)}" data-lead="${esc(v.lead)}" data-queue="${v.queue}" hidden disabled>
        <legend class="sr-only">${esc(v.title)}</legend>
        ${v.fields.map((f) => control(v, f)).join('\n        ')}
      </fieldset>`;

export const dialog = ({ contactEmail }) => `
<dialog class="dialog" id="talk" aria-labelledby="talk-title">
  <div class="dialog__in">
    <div class="dialog__head">
      <h2 class="h3" id="talk-title" data-title>Talk to us</h2>
      <button type="button" class="dialog__close" data-close aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    </div>
    <p class="small muted dialog__lead" data-lead></p>
    <form class="form">${variants.map(fieldset).join('')}
      <div class="hp" aria-hidden="true"><label>Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
      <div class="form__foot full">
        <p class="form__note">We use your details only to reply.</p>
        <button type="submit" class="btn btn--dark">Send</button>
      </div>
      <p class="form__note full" data-error role="alert" hidden>That did not go through. Email us instead at <a href="mailto:${esc(contactEmail)}">${esc(contactEmail)}</a>.</p>
    </form>
    <div class="dialog__done" role="status">
      <p class="body">Thank you — your note is on its way to <span data-done-to>the desk</span>. We reply within one working day.</p>
      <div class="buttons"><button type="button" class="btn btn--outline" data-close>Close</button></div>
    </div>
  </div>
</dialog>`;
