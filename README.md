# MCU Chronicles

An installable React PWA covering every Marvel Cinematic Universe film, with a story-order timeline, saga storytelling, HD posters, cast and characters, and a "watch before this" guide for each film.

## Run

```bash
npm install
npm run dev       # development server
npm run build     # production build (generates the service worker)
npm run preview   # serve the production build at http://localhost:4173
```

The service worker and install prompt only work in the production build (`build` + `preview`) or when the app is deployed over HTTPS.

## Cinematic layer (built with the 10k-websites skill)
- **Splash:** a Doctor Strange-style spell mandala and spark portal that opens onto the site. It plays once per session, and a tap or key press skips it.
- **Hero:** an AI-generated scroll video of an armored hero descending and landing (`public/hero/`). It plays forward as you scroll down and backward as you scroll up, with HUD readouts and paced captions. Phones and reduced-motion users get a designed still hero instead.
- **Preloader:** a Captain America-style shield that spins and fills while each film page's HD poster and backdrop load.
- **Arc reactor:** press and hold it to power up and reveal your watch progress.
- **Trailers:** every film page has a "Watch trailer" button that plays the official trailer.
- Design decisions are in `design/design-package.md`.

## Features
- **Timeline**: switch between story order and release order, filter by phase, search by film, actor or character, and hide films you've watched.
- **Storytelling**: chapter-by-chapter overviews of the Infinity Saga and the Multiverse Saga.
- **Movie pages**: HD poster (click it for full resolution), backdrop, facts, Infinity Stones, story, "why it matters", cast with photos, **Watch before this**, **Watch next**, related films, recommended Disney+ series, and previous/next links in story order.
- **Watch progress**: saved in localStorage.
- **PWA**: manifest, installable, offline app shell, and TMDB images cached as you browse (CacheFirst).

## Data
All film data lives in `src/data/movies.js`. Posters, backdrops, cast and release info come from [TMDB](https://www.themoviedb.org); the synopses and viewing links are original write-ups. To add a film, add an entry with its TMDB image paths and list its prerequisites in `before`.
