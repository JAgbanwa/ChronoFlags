# ChronoFlags

ChronoFlags is an installable historical-flag keyboard and composition tool. It lets people search for flags used by defunct states and empires, add them to a short note, copy or download individual flags as PNG images, and export a shareable card.

The first catalog deliberately covers the examples that started the project:

- the imperial banner commonly associated with the Holy Roman Empire (“First Reich”);
- the German Empire (“Second Reich”);
- Germany under Nazi rule (“Third Reich”), obscured by default;
- the Kingdom of Italy, including the 1930s;
- the Spanish State under Francisco Franco, using the 1945–1977 design; and
- the British Gold Coast, now Ghana.

Every entry includes dates, aliases, a short historical note, a context warning where appropriate, a source record, and a rights note. See [ATTRIBUTION.md](./ATTRIBUTION.md) for the artwork sources.

## What works today

- Mobile-first keyboard tray with tactile flag keys
- Search by polity, alternative name, region, date, or common historical label
- Region, favorites, recents, and interactive year filters
- A six-flag composition tray and editable note
- Copy note text, export a composed PNG card, or share it through the device share sheet
- Copy or download an individual flag as a PNG
- Installable Progressive Web App with an offline flag catalog
- Device-local preferences only; no account, analytics, or tracking
- Sensitive authoritarian/extremist symbols obscured until deliberately revealed
- Keyboard navigation, visible focus states, live status announcements, and reduced-motion support

## Important platform limitation

Historical flags cannot be added to Unicode by an ordinary app, so they cannot behave exactly like standard emoji in every text field. A PWA also cannot modify Gboard, Samsung Keyboard, Apple Keyboard, or a desktop operating system's built-in emoji panel.

ChronoFlags therefore ships the honest cross-platform first step: an installed companion keyboard/picker that copies, downloads, or shares image-based flags. A native iOS Keyboard Extension, Android Input Method Editor, and desktop input-menu adapter can reuse the catalog in a later release. Even those adapters will insert stickers/images only where the target app supports rich content; otherwise they must insert a textual fallback.

## Run locally

Requirements: Node.js 22.13 or newer and npm.

```bash
npm install
npm run dev
```

Then open the local URL printed by the development server.

## Validate a change

```bash
npm run typecheck
npm run lint
npm test
```

`npm test` creates the production build and checks the rendered product, install manifest, service worker, catalog, attributions, and bundled artwork.

## Project map

```text
app/
  ChronoKeyboard.tsx  Interaction, image export, install, and keyboard UI
  flag-data.ts         Typed historical catalog and source metadata
  globals.css          Responsive visual system
  layout.tsx           PWA and social metadata
  page.tsx             App entry point
public/
  flags/               Offline historical artwork
  manifest.webmanifest Install metadata
  sw.js                 Offline cache
  og.png                Social preview
tests/
  rendered-html.test.mjs Production-render and package checks
```

## Add a flag

1. Choose a historically supportable flag with an exact usage range. Avoid presenting modern reconstructions as undisputed fact.
2. Confirm that the image can be redistributed, then add the original artwork to `public/flags/`.
3. Add a typed record in `app/flag-data.ts`, including aliases, context, source URL, and license note.
4. Add the local file, source, creator where required, and rights statement to `ATTRIBUTION.md`.
5. Add the asset path to `public/sw.js` so installed copies keep working offline.
6. Run the validation commands above.

## Editorial and safety policy

ChronoFlags is a visual historical reference, not an endorsement of any state, empire, ideology, regime, or colonial project. Catalog descriptions should be factual, bounded by dates, and explicit about ambiguity. Extremist symbols must be marked `sensitive: true`; the interface will obscure them by default. Laws governing the display of official insignia or extremist symbols vary by jurisdiction, independent of copyright.

## Next milestones

- Expand the catalog across Africa, Asia, the Americas, Europe, Oceania, and stateless/decolonial movements
- Add a documented editorial review and correction workflow
- Generate multiple export sizes and sticker formats
- Publish shared catalog packages for Android, iOS, Windows, and macOS adapters
- Build native keyboard extensions after target-platform signing and store-distribution decisions are made
