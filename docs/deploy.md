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

## Use elike.qa as the address

The site is ready for root-domain hosting. A custom domain hides the GitHub project
address from visitors; renaming the GitHub account is unnecessary. `elike.qa` has
not been connected: domain ownership and access to its DNS are still unconfirmed.
Keep the working project address until those are available.

After buying the domain or confirming ownership:

1. In the GitHub account's **Settings → Pages**, verify `elike.qa` using the TXT
   record GitHub supplies. Leave that verification record in DNS.
2. At the domain's DNS provider, set these GitHub Pages records. Change only records
   for the website, preserving email/MX and other services. Replace conflicting
   website records for the same names.

   | Type | Name | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |
   | CNAME | www | mmm123taha-lang.github.io |

   The CNAME target contains no `https://` or `/elikewebsite/` path. Use the current
   addresses from [GitHub's domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
   when making the change.
3. In the repository's **Settings → Pages → Custom domain**, enter `elike.qa` and
   save. With this Actions workflow the repository setting is the source of truth;
   an extra `CNAME` file is unnecessary.
4. Wait for GitHub's DNS check and TLS certificate, then enable **Enforce HTTPS**.
   Verify the home page, route navigation, photos, and video at `https://elike.qa/`.

If Supabase accounts are connected later, also add the custom origin to the allowed
sign-in redirect URLs. The checkout remains a preview as requested.
