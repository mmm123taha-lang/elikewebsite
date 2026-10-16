# ELIKE validation

Text and control boundary pairs used by the landing page. Artwork, object illustrations, and decorative rules are not text or control boundaries.

| Pair | Ratio | Use | Result |
| --- | ---: | --- | --- |
| Ink / canvas | 17.42:1 | text | Pass |
| Muted / canvas | 5.80:1 | text | Pass |
| Ink / gold | 9.80:1 | text | Pass |
| Ink / gold hover | 8.64:1 | text | Pass |
| Canvas / ink | 17.42:1 | text | Pass |
| Secondary / ink | 9.78:1 | text | Pass |
| Gold text / canvas | 6.01:1 | text | Pass |
| Gold text / soft | 5.60:1 | text | Pass |
| Gold text / gold | 3.38:1 | UI border | Pass |
| Control border / canvas | 3.56:1 | UI border | Pass |
| Card arrow border / ink | 6.03:1 | UI border | Pass |
| Decorative line / canvas | 1.37:1 | decoration | Exempt: decorative |
| Decorative divider / ink | 2.74:1 | decoration | Exempt: decorative |
| Gold / canvas | 1.78:1 | decoration | Exempt: decorative |

## Checks performed

- `npm run build`: passed (TypeScript project build and Vite production compilation).
- `npm run lint`: passed (repository-configured Oxlint).
- Chromium browser: 360, 390, 430, 768, 1024, and 1440 px, in English and Arabic, with normal and reduced motion (24 combinations).
- No horizontal document overflow; all brand images loaded; no browser runtime errors.
- All 72 card/preview flows passed, including Escape dismissal and visible preview content.
- Mobile visible buttons and links were at least 44 px tall.
- Reduced-motion entrances remained visible and the ambient lamp animation was disabled.
- Language switch, RTL direction, persistence after reload, native dialog keyboard focus containment, and close button passed.
- Visually reviewed desktop, mobile English, and mobile Arabic screenshots.

Decorative lines and the gold mark/underline fall below UI contrast thresholds but do not convey text or interactive boundaries. All introduced text pairs pass 4.5:1; control boundaries pass 3:1. The supplied brand artwork retains its original colors, with derived reverse, flat, and ink variants.

The original brief's Next.js pages, ESLint configuration, 31 geometry tests, database reset, customer logins, checkout and STL privacy checks do not exist in this Vite repository. They were not run and are outside the approved landing-page scope. No backend behavior is claimed.
