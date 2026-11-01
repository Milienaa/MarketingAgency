# Redpen: project context

Concept/portfolio site. The agency, its offer and all proof are fictional drafts until a real client replaces them.

## Brand
- **What:** Redpen, a performance and growth marketing agency for B2B companies. It audits marketing budgets line by line, cuts what does not reach pipeline, and reinvests the money in what does.
- **Audience:** B2B marketing leaders, founders and revenue leaders in the US and EU, arriving from LinkedIn, referrals and search, on desktop and phone.
- **Values:** evidence over activity, directness, accountability to pipeline.
- **Voice:** an editor with a red pen. Short, dry, specific, confident. Never hype.
- **Palette (only these):** #EF0808, #EBEBEB, #000000, #FFFFFF.
- **Contrast limits:** red passes AA on black (4.71:1). Red on white (4.46:1) and on #EBEBEB (3.74:1) is large text or decoration only. Text on red must be black, or white at large size only.
- **Type:** Archivo Expanded Black for display, Archivo for body, IBM Plex Mono for bracket labels. All cover Latin Extended, needed for Polish.
- **Avoid:** SaaS-agency cliches (badges, "#1 agency", purple gradients, smiling stock teams), hype, invented results shown as real.

## Site
- **Goal:** a visitor books a service through a short form.
- **Languages:** English (default at `/`), Spanish, German, French, Italian, Polish.
- **Sections:** hero, the strike (scroll signature), services, the markup (illustrative ledger), method, proof (samples), FAQ, booking form, footer.
- **Functions:** per-language static pages, language switcher, service preselect from service cards, validated client-only form with no backend, which opens a prefilled email to redpen@gmail.com.
- **Domain:** not final. Do not show it on the site; set `site` in `astro.config.mjs` only once confirmed.
- **Content:** every string and setting lives in `src/content/site.js`.
