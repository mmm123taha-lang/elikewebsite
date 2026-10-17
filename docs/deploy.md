# Deploy ELIKE with GitHub Pages

The frontend is a static Vite build. Browsing, designing and the saved cart work without a backend. Real accounts, orders and payments need the separate Supabase setup in backend-setup.md.
Relative asset paths support both the project URL and root/custom-domain hosting.

## One-time GitHub setting

In `mmm123taha-lang/elikewebsite`, open **Settings → Pages** and set **Source** to
**GitHub Actions**. If Pages is unavailable because of the repository visibility or
account plan, GitHub must permit Pages before deployment can proceed. Do not change
repository visibility without the owner's explicit approval.

## Deployments

`.github/workflows/deploy-pages.yml` installs the locked dependencies, lints, builds,
and deploys `dist` when `main` changes. It can also be run manually from the Actions
tab. No personal token is required by the workflow once Pages is enabled.

Expected project URL after a successful deployment:
https://mmm123taha-lang.github.io/elikewebsite/

Check the workflow's deployment result before treating that URL as live. Verify the
logos, three entry cards, preview dialogs, English/Arabic switch, and mobile layout.

## Local verification

```sh
npm ci
npm run lint
npm run build
npm run preview
```

The public website includes the store, henna designer, lithophane previews and saved cart. Accounts and paid orders remain disabled until the backend, merchant provider and approved catalogue are connected.
