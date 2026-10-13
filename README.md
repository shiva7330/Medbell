# Medbell

Pill reminders and medicine delivery in one mobile web app. This is the working frontend for the Medbell UX case study (a concept project, not a live product).

Built with React 18, Vite and React Router. No backend: data is saved in the browser (`localStorage`).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build locally
```

## Demo notes

- Login: enter any valid 10-digit mobile number. The OTP is **1234**.
- Three sample medicines are pre-loaded. Doses before the current time show as Missed until you mark them taken.
- Payment succeeds when online and fails when the browser is offline, which shows the failure screen.
- Order tracking moves one step every 20 seconds so you can watch it progress.
- Turn off your network to see the offline banner and the No internet screen on Shop.
- Reset all data: clear the site's local storage in your browser.

## Screens

Splash, Onboarding, Login, OTP (with error state), Home, Reminders, Add and Edit medicine, Medicine detail (refill), Shop, Product detail, Cart (empty state), Address, Add address, Payment, Payment failed, Order success, Order tracking, My orders, Profile, Edit profile, Saved addresses, Notifications, No internet, Not found.

## Project structure

```
src/
  components/   Icon, ui (Button, Field, TopBar, BottomNav, ...), cards
  context/      AppContext (state + localStorage)
  data/         products
  hooks/        useOnline
  pages/        Auth, Reminders, Shop, Checkout, Account
  styles/       tokens.css (design tokens), global.css
```

Design tokens in `src/styles/tokens.css` match the Figma "Medbell Tokens" variables.

## Deploy to GitHub Pages

1. Create a repository on GitHub and push this folder to the `main` branch.
2. In the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` builds and publishes the site through `.github/workflows/deploy.yml`.

The app uses hash routes (`/#/home`), so it works under `https://<user>.github.io/<repo>/` without extra setup.
