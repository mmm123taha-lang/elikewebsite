# ELIKE

A bilingual ELIKE workshop landing page built with React 19, TypeScript, Vite,
Tailwind CSS v4, and Motion. Requires Node.js 22.12+ or Node.js 24 LTS.

```sh
npm ci
npm run dev -- --host 0.0.0.0
npm run build
npm run lint
```

If the cloud machine’s default npm cache is unwritable, use
`npm --cache /workspace/.npm-cache ci`. Use the existing checkout; no worktree is needed.

## What is implemented

- Responsive three-card landing page: Store, Start designing, Lithophane studio.
- Original ELIKE vector artwork, gold/ink palette, CSS object illustrations.
- English/Arabic toggle with RTL layout, remembered in local storage.
- Restrained Motion entrances and pointer tilt, CSS lamp glow, reduced-motion support.
- Keyboard-accessible native preview dialogs with Escape dismissal and focus restoration.

The three cards open informational “coming soon” previews. There is no catalogue,
design upload, geometry generator, cart, payment, database, authentication, or admin
workflow. The supplied brief describes an existing Next.js app, which was not present
in this repository; this implementation applies the approved landing-page scope.

## Design and components

Global tokens are in `src/index.css`; component styles stay in `@layer components`
in `src/App.css`. Source artwork and web asset variants are documented in
`public/brand/README.md`. Contrast results and validation scope are in
`docs/validation.md`.

21st.dev is a component catalogue rather than a single installed package. No third-party
catalogue component has been imported. The `@/*` alias, `cn` helper, `components.json`,
Lucide icons, and class-variance-authority are available. Adapt selected components
to ELIKE tokens and logical CSS properties; check their licenses and dependencies.
Use `motion/react` for animations. Next.js-specific components require adaptation.
