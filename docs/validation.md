# ELIKE shop validation

## Executed

- `npm run build`: TypeScript project build and Vite production compilation passed.
- `npm run lint`: Oxlint passed without warnings.
- `npm test`: eight server pricing/validation tests passed. They cover submitted-price tampering,
  invalid quantities, unapproved products, invalid colours, server-priced lithophane options,
  cross-customer photo paths, stencil bounds, and bag limits.
- `npm run test:e2e`: 20 Chromium tests passed. They exercise bee entrance and pointer following,
  six products and colour picture selection, QAR 15 keychains, cart quantities/totals/reload,
  motif placement/size/duplication/undo/keyboard movement/persistence, custom cart thumbnails,
  nine-second video metadata/skip/automatic advance, upload/light toggle/size/base/shape pricing/photo persistence,
  honest unconnected-service states, and reduced motion.
- Responsive browser checks cover all eight hash routes at 360, 390, 430, 768, 1024,
  and 1440 px in English and Arabic. No document overflow or browser errors occurred.
- `deno check` passed for create-checkout, verify-payment, and reconcile-payments functions.
- FFprobe confirms the supplied MP4 duration is exactly 9.000 seconds.

Tests live in tests/browser and tests/quote.test.ts. Browser tests currently expect services
to be unconfigured; run them with the default local environment, not merchant credentials.

## Scope limits

Supabase is not provisioned, the migration/RLS policies have not been run in a Supabase
project, email delivery is not tested, and the owner has not selected a payment provider.
The candidate MyFatoorah adapter has not performed a sandbox or live transaction. It must
be reviewed against the selected merchant account, sandbox-tested, and accepted before
both checkout flags are enabled. The frontend visibly prevents real ordering meanwhile.

Lithophane previews simulate transmitted light; they do not generate a fabrication mesh.
Henna designs require workshop cut/bridge review. Product renders illustrate the sample
catalogue. Keychain prices are QAR 15 as instructed; other prices are proposed.

## Text contrast

All introduced text pairs were computed against their backgrounds. Decorative artwork,
illustrated products, background rules and disabled controls are not body text.

| Pair | Contrast | Result |
| --- | ---: | --- |
| Ink / canvas | 17.42:1 | Pass |
| Muted / canvas | 5.80:1 | Pass |
| Ink / gold | 9.80:1 | Pass |
| Gold text / soft | 5.60:1 | Pass |
| Gold text / canvas | 6.01:1 | Pass |
| Light text / ink | 17.42:1 | Pass |
| Secondary / ink | 9.78:1 | Pass |
| Muted / panel | 5.23:1 | Pass |
| Henna / strip | 10.19:1 | Pass |
| Henna help / strip | 5.25:1 | Pass |
| Error / error panel | 6.78:1 | Pass |
| Success / success panel | 7.61:1 | Pass |
| Gold / toast | 9.80:1 | Pass |
| Ink / rose | 5.94:1 | Pass |
| Ink / sage | 5.85:1 | Pass |

Gold on canvas is 1.78:1 and is used only for decorative artwork, not text. Decorative dividers are likewise exempt from text/control contrast thresholds.

## Preview-only checkout update

The owner requested payment remain a page preview. The frontend payment/upload
handler and activation flag were removed. Build, lint, and the focused account/checkout
browser check passed, including form submission that sends no payment/upload request.
Sign-in remains inactive until a Supabase project is connected.
