# Connect accounts and payments

The public site runs on GitHub Pages. Accounts, private uploads, orders, and payment
verification are prepared for Supabase; no Supabase project is connected yet.
The owner has not selected a payment provider. A **candidate MyFatoorah v2 adapter**
is included for evaluation, not activated or merchant-tested. No real payment can
be started with the default configuration. Do not enter credentials in chat.

## 1. Connect real accounts

1. Create a Supabase project and apply `supabase/migrations/202610170001_shop.sql`
   using the SQL editor or `supabase db push` after linking the CLI.
2. In Supabase Auth, enable email sign-in, set the site URL to
   `https://mmm123taha-lang.github.io/elikewebsite/`, and allow redirect URLs
   `https://mmm123taha-lang.github.io/elikewebsite/?view=account` and
   `https://mmm123taha-lang.github.io/elikewebsite/?view=orders`.
   Configure a production email sender, rate limits, and email templates.
3. In GitHub repository **Settings → Secrets and variables → Actions → Variables**,
   add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. These are public
   browser configuration values from Supabase's API settings. Never use a service
   role key here. Add the same two variables in the cloud environment for development.
4. Redeploy the GitHub Pages workflow. Test a new account, magic-link sign-in,
   expired links, sign-out, and the order-history page with your own email.

## 2. Prepare server functions and catalogue

Deploy `create-checkout`, `verify-payment`, and `reconcile-payments` from this
repository with the Supabase CLI. Function JWT gateway verification is disabled
in `supabase/config.toml` because the functions explicitly validate customer JWTs
with `auth.getUser()`. Reconciliation instead requires the exact server service
role credential, and must never be invoked from browser code.

Set `SITE_URL=https://mmm123taha-lang.github.io/elikewebsite/` in **Supabase Edge
Function secrets**. Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` to its functions. Keep these server-only values out of
GitHub Pages builds and source control.

The catalogue seeds four keychains at the owner's approved QAR 15 each. The planter,
stand, stencil, lithophane sizes, and LED base are sample prices with `approved=false`.
The proposed lithophane outer sizes (10 × 15, 12 × 16, 14 × 17 cm) stay within a 180 mm printer bed; verify frame/base tolerances with the workshop. Approve actual product specifications and prices in `public.products`, and update
`src/lib/catalog.ts` to match before offering those products for sale. The server
rejects unapproved products and changed totals, even if someone edits browser prices.

Customer photos are stored in a private `customer-designs` bucket, under that
customer's UUID. Storage policies prevent cross-customer access. The cart uses local
storage for selections and IndexedDB for the photo; uploads occur only after consent
at checkout. No public photo/model URLs are created. Set a retention/deletion policy
for customer photos before taking real orders.

## 3. Choose and test a payment provider

If choosing MyFatoorah, complete merchant onboarding for a Qatar/QAR account, and
review its current API documentation and account endpoint with the provider. The
included adapter uses v2 `SendPayment` for hosted checkout and `GetPaymentStatus`
for server verification. Card data never passes through this application.

Store these values only in **Supabase Edge Function secrets**, not chat or the
front-end environment:

- `PAYMENT_PROVIDER=myfatoorah`
- `MYFATOORAH_API_TOKEN`: your provider-issued **sandbox** credential first.
- `MYFATOORAH_MODE=test` for `https://apitest.myfatoorah.com`. After full acceptance,
  `qatar-live` selects `https://api-qa.myfatoorah.com`; confirm your account uses QAR
  as its invoice currency, not merely the displayed currency.
- `CHECKOUT_ENABLED=true` only when ready for controlled sandbox tests.

For sandbox tests set GitHub repository variable `VITE_CHECKOUT_ENABLED=true`, redeploy,
and verify the full flow using **test credentials and test payment cards only**:

- One customer can read only their own orders and photos.
- A customer cannot insert orders directly or mark an order paid.
- Bad quantities, altered totals, unapproved products, and another user's photo fail.
- Provider decline/cancel/timeout is shown accurately; no fabricated success.
- A paid invoice must match the server order ID, invoice ID, and exact QAR amount.
- Retry uses the same saved request ID. An ambiguous invoice-creation failure is not
  automatically retried; investigate it in the merchant dashboard before retrying.
- Returning from the provider verifies payment server-side before showing “paid”.
- Configure a trusted server schedule to POST to `reconcile-payments` every 5 minutes
  with the service role authorization stored securely in the scheduler/Vault. This
  catches paid invoices when a customer closes the browser before returning. Expired
  invoices are marked failed, preventing stale pending orders from starving the queue.
- Review operational pickup/contact details, taxes, refund policy, retention policy,
  and motif manufacturing limits before accepting actual customers.

No provider account, sandbox transaction, Supabase migration, RLS integration test,
email delivery, or live charge has been executed in this task. Those are outstanding
external prerequisites, not passing test claims. Keep both checkout flags false until
accepted. A provider other than MyFatoorah needs a matching server adapter and tests.
