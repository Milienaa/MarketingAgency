const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const i18n = JSON.parse(document.getElementById('i18n').textContent);

/* Reveals: observe, strike once, stop observing. */
const targets = document.querySelectorAll('.wipe, .ledger .cut');
if (reduced || !('IntersectionObserver' in window)) {
  targets.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  targets.forEach((el) => io.observe(el));
}

/* The strike: fit each word, then scrub the pen with scroll. */
const strike = document.querySelector('.strike');
const stage = strike.querySelector('.strike-stage');
const rows = [...strike.querySelectorAll('.sw')];
const words = rows.map((r) => r.querySelector('.sw-word'));
const strokes = rows.map((r) => r.querySelector('.stroke'));
const nib = strike.querySelector('.strike-nib');
const endLine = strike.querySelector('.strike-end');

function fitWords() {
  const width = stage.clientWidth;
  const height = stage.clientHeight || innerHeight * 0.6;
  words.forEach((w) => { w.style.fontSize = '100px'; });
  const sizes = words.map((w) => (100 * width) / (w.getBoundingClientRect().width * 1.02));
  const total = sizes.reduce((a, s) => a + s * 1.02, 0);
  const k = reduced ? 1 : Math.min(1, height / total);
  // Spare width becomes a staircase, echoing the hero.
  const free = width * (1 - k);
  words.forEach((w, i) => {
    w.style.fontSize = `${(sizes[i] * k).toFixed(2)}px`;
    w.style.marginLeft = `${((free * i) / (words.length - 1)).toFixed(1)}px`;
  });
}

let ticking = false;
function scrub() {
  ticking = false;
  const rect = strike.getBoundingClientRect();
  const span = rect.height - strike.querySelector('.strike-pin').offsetHeight;
  const p = clamp(-rect.top / span);
  let tip = null;

  strokes.forEach((stroke, i) => {
    const start = i < 3 ? 0.04 + i * 0.26 : 0.82;
    const t = clamp((p - start) / (i < 3 ? 0.22 : 0.14));
    stroke.style.clipPath = `inset(-60% ${((1 - t) * 100).toFixed(2)}% -60% 0)`;
    rows[i].classList.toggle(i < 3 ? 'is-struck' : 'is-won', t >= 1);
    if (t > 0 && t < 1) tip = { i, t };
  });
  endLine.classList.toggle('is-on', p >= 0.96);

  if (tip) {
    const s = stage.getBoundingClientRect();
    const w = words[tip.i].getBoundingClientRect();
    const x = w.left - s.left + w.width * tip.t;
    const y = w.top - s.top + w.height * (tip.i === 3 ? 0.98 : 0.5);
    nib.style.opacity = '1';
    nib.style.transform = `translate(${(x - nib.offsetWidth / 2).toFixed(1)}px, ${(y - nib.offsetHeight).toFixed(1)}px) rotate(24deg)`;
  } else {
    nib.style.opacity = '0';
  }
}
function onScroll() {
  if (!ticking) { ticking = true; requestAnimationFrame(scrub); }
}
function setupStrike() {
  fitWords();
  if (!reduced) scrub();
}
setupStrike();
document.fonts?.ready.then(setupStrike);
let lastWidth = innerWidth;
addEventListener('resize', () => {
  if (innerWidth !== lastWidth || !matchMedia('(pointer: coarse)').matches) {
    lastWidth = innerWidth;
    setupStrike();
  }
});
if (!reduced) addEventListener('scroll', onScroll, { passive: true });

/* Hero nib leans toward a mouse pointer. */
const heroNib = document.querySelector('.hero-nib');
if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const hero = document.querySelector('.hero');
  hero.addEventListener('pointermove', (e) => {
    heroNib.style.setProperty('--mx', `${((e.clientX / innerWidth - 0.5) * 18).toFixed(1)}px`);
    heroNib.style.setProperty('--my', `${((e.clientY / innerHeight - 0.5) * 12).toFixed(1)}px`);
  }, { passive: true });
}

/* Language menu closes on outside click and Escape. */
const lang = document.querySelector('.lang');
document.addEventListener('click', (e) => { if (lang.open && !lang.contains(e.target)) lang.open = false; });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lang.open) { lang.open = false; lang.querySelector('summary').focus(); }
});

/* Service links preselect the form. */
const form = document.getElementById('bookform');
document.querySelectorAll('[data-service]').forEach((a) => {
  a.addEventListener('click', () => {
    const input = form.querySelector(`input[value="${a.dataset.service}"]`);
    if (input) { input.checked = true; setError('service', ''); }
  });
});

/* Form */
const done = document.getElementById('done');
const doneText = document.getElementById('done-text');

function setError(name, message) {
  document.getElementById(`err-${name}`).textContent = message;
  if (name !== 'service') {
    const field = form.elements[name];
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  }
}
function validate() {
  const data = new FormData(form);
  const errors = {};
  if (!data.get('service')) errors.service = i18n.errService;
  ['name', 'company'].forEach((k) => { if (!String(data.get(k)).trim()) errors[k] = i18n.errRequired; });
  const email = String(data.get('email')).trim();
  if (!email) errors.email = i18n.errRequired;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = i18n.errEmail;
  ['service', 'name', 'email', 'company'].forEach((k) => setError(k, errors[k] || ''));
  return errors;
}
function showDone() {
  const link = document.createElement('a');
  link.href = `mailto:${i18n.email}`;
  link.textContent = i18n.email;
  doneText.textContent = `${i18n.doneMail} `;
  doneText.append(link, '.');
  form.hidden = true;
  done.hidden = false;
  done.focus();
}

['name', 'email', 'company'].forEach((k) => {
  form.elements[k].addEventListener('input', () => {
    if (form.elements[k].hasAttribute('aria-invalid')) setError(k, '');
  });
});
form.addEventListener('change', (e) => { if (e.target.name === 'service') setError('service', ''); });

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const errors = validate();
  const first = Object.keys(errors)[0];
  if (first) {
    (first === 'service' ? form.querySelector('input[name="service"]') : form.elements[first]).focus();
    return;
  }
  const data = new FormData(form);
  if (data.get('website')) return; // Honeypot: bots only.
  const label = form.querySelector('input[name="service"]:checked').dataset.label;
  const body = [label, ...['name', 'email', 'company', 'note'].map((k) => data.get(k).trim())].filter(Boolean).join('\n');
  location.href = `mailto:${i18n.email}?subject=${encodeURIComponent(`${i18n.subject}: ${label}`)}&body=${encodeURIComponent(body)}`;
  showDone();
});

document.getElementById('again').addEventListener('click', () => {
  form.reset();
  done.hidden = true;
  form.hidden = false;
  form.querySelector('input[name="service"]').focus();
});
