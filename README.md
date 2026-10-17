# ELIKE

Bilingual English/Arabic shop for small 3D printed objects, a henna stencil designer,
and a lithophane photo preview studio. React 19, TypeScript, Vite, Tailwind CSS v4,
and Motion. Node.js 24 is used in GitHub Actions.

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm run build
npm run lint
npm test
npm run test:e2e
```

Use `npm --cache /workspace/.npm-cache ci` if the default cloud cache is unwritable.
Use the existing checkout; no worktree is needed. For browser tests install Chromium
with `npx playwright install chromium` on machines without it. The test config uses
`/usr/bin/chromium` when provided, or the `CHROMIUM_PATH` environment variable.

## Implemented

- Bee entrance once per browser tab; gentle pointer following; reduced-motion support.
- Six products with three distinct colour renders. Four keychains are QAR 15 each.
- Henna editor: 15 × 3 cm strip; 12 motifs; placement, dragging, size, rotation,
  duplication, undo, keyboard movement, saved draft and SVG design download.
- Lithophane: nine-second illustrated MP4 intro with skip, photo upload, lit/unlit
  preview, size/shape/zoom/LED options and proposed prices. Photos stay in IndexedDB on this device;
  the preview checkout never uploads them. This is a preview, not an STL/mesh generator.
- Saved cart including per-colour quantities and custom designs; review/checkout screen.
- Supabase email magic-link sign-in and order-history integration prepared. Secure
  order pricing, private photo storage, and an optional hosted-payment server adapter.

## What needs connection

Sign-in is not activated: no Supabase project has been connected. Checkout is deliberately a preview-only page, with no payment or order submission handler. No payment provider has
been supplied. The owner hasn't selected a provider. No fake account or simulated
payment is shown. Follow [backend setup](docs/backend-setup.md) to connect accounts and production email. The payment adapter is retained for a future task only; real payment activation would require a separate frontend implementation and sandbox tests. Proposed
non-keychain prices are labelled and rejected by the server until approved.

Copy `.env.example` to `.env.local` for local public configuration. GitHub Pages builds
read the equivalent GitHub repository variables. Never put server credentials in a
`VITE_*` variable. See [deployment](docs/deploy.md) and [validation](docs/validation.md).

Product images are illustrative AI-generated render previews, not photographs of
verified manufactured stock. The introductory video is an original animated
explanation. Brand vectors originate from the owner's supplied artwork.
