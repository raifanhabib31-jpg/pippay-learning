# PippayLearning

## Development

Use `npm run dev` for the frontend only. To test email sending locally, use `npm run dev:pages`; this builds the app and starts Cloudflare Pages Functions so `/api/send-email` is available.

API key Gemini, OpenRouter, dan Resend dapat diisi user melalui menu Pengaturan. Key tersebut disimpan lokal per akun dan dikirim hanya ke proxy API saat digunakan. Untuk fallback deployment, isi secret Cloudflare seperti pada bagian Deployment.

## Deployment

Configure Cloudflare Pages with the repository root as the project root, `npm run build` as the build command, and `dist` as the output directory. Keep `functions/api/send-email.js` in the deployed repository so Cloudflare registers `/api/send-email`.

For a CLI deployment, run `npm run deploy:pages`. Do not run `wrangler deploy`; that deploys a Workers script and does not register the Pages Function correctly.

Settings sync requires a Cloudflare Pages KV binding named `SETTINGS_KV`. Create a KV namespace in Cloudflare, then add it under Pages project Settings -> Functions -> KV namespace bindings with variable name `SETTINGS_KV` for Production and Preview.

AI dan email credentials bawaan deployment disimpan sebagai secret Cloudflare, bukan `VITE_*`. User tetap dapat memakai key custom dari menu Pengaturan:

```bash
npx wrangler pages secret put GEMINI_API_KEY --project-name pippay-learning
npx wrangler pages secret put OPENROUTER_API_KEY --project-name pippay-learning
npx wrangler pages secret put RESEND_API_KEY --project-name pippay-learning
```

The browser calls `/api/ai` and `/api/send-email`; provider URLs and secrets stay in Pages Functions. Google OAuth Client ID is intentionally public browser configuration, not a secret.

---

This project uses React + TypeScript + Vite.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
