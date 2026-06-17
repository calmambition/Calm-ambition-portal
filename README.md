# Calm Ambition — Client Portal

A quiet, phone-first tool for coaching clients to capture what presses on them between sessions, and for the coach to receive a clear summary before each session. All data lives in the browser (localStorage); there is no backend.

Built with React 19, TypeScript, Vite, Tailwind CSS v4, and framer-motion.

## Develop

```bash
npm install
npm run dev      # http://localhost:22510
npm run build    # outputs to dist/
npm run preview  # serve the production build
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the app and publishes it to GitHub Pages at `https://calmambition.github.io/Calm-ambition-portal/`.

The Vite `base` is set to `/Calm-ambition-portal/` for production builds so assets resolve under the Pages subpath. To preview the production build locally with that path:

```bash
npm run build
npx vite preview --base /Calm-ambition-portal/
```

## Coach setup

There is no test-mode flag. The coach identity is seeded from `COACH` in `src/config.ts`, and the coach PIN is created on each device the first time coach access is used (change it later in Settings). Clients can always export their own data from the header.

To explore the app with sample clients, open the client picker and choose the demo data (Alex, Sam, Maya).

## Notes

- The coach PIN gates a UI mode only; it is not real security. Harden authentication before any production use beyond friendly testing.
