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

- Two-second bee flight across several points on page load, then a fixed landing and gentle pointer following. Returning home does not replay the flight; reduced motion skips it.
- Six products with three distinct colour renders. Four keychains are QAR 15 each.
- Henna editor: 15 × 3 cm strip; 12 motifs; placement, dragging, size, rotation,
  duplication, undo, keyboard movement, saved draft and SVG design download.
- Lithophane: nine-second 3D product video with skip, photo upload, a rotatable
  white relief with simulated backlighting, size/shape/zoom/LED options and proposed prices. Photos stay in IndexedDB on this device;
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
verified manufactured stock. The introductory video is a rendered 3D product visualization using an AI-generated sample photograph, not filmed footage or a customer photo. Brand vectors originate from the owner's supplied artwork.

## Regenerate the lithophane video

With Chromium and FFmpeg available, run `node scripts/render-lithophane-video.cjs`.
It builds the 3D renderer into `/tmp`, serves an isolated snapshot, captures 216 frames,
and creates a nine-second H.264 video plus poster. It does not need the app server or
any external service. `CHROMIUM_PATH` overrides the browser executable.

The live 3D preview uses WebGL 2. Its render loop sleeps when lighting and camera are
unchanged. Photographs remain local. Optical attenuation, relief and material grain
are visual simulations, not a calibrated print profile or manufacturing output.
