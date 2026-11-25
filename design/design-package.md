# MCU Chronicles: Design Package (Tier 1, single journey)

## 1. Brand premise
One idea: **a first flight.** Every hero starts somewhere, and every viewer needs a clear place to start too. The hero footage is an armored hero descending into the city at night and landing with a charged repulsor; the site turns a confusing 39-film saga into one clear path and tells you what to watch first.

## 2. Palette (sampled from the approved footage)
```css
:root{
  --canvas:#0d1020;        /* night sky navy, never pure black */
  --panel:#171b31;
  --accent:#d7263d;        /* armor crimson: CTA and rare emphasis */
  --accent-hover:#ef3a52;
  --accent-muted:rgba(215,38,61,.28);
  --gold:#e3b04b;          /* armor gold: saga labels, dividers */
  --arc:#9fe7ff;           /* repulsor blue: HUD, focus, the signature glow */
  --text-secondary:#b3b6cc;
  --text-primary:#f3f1ee;
}
```

## 3. Type trio
Big Shoulders Display 700/900 (display), Manrope 400/500/700 (body), JetBrains Mono 500 (HUD labels).

## 4. Band map (hero 520vh; validated by the flick test)
| Band | Range | Footage moment | Copy (verbatim) | Entrance |
|---|---|---|---|---|
| 1 | 0.00 to 0.22 | hero high in the sky, thrusters firing | "Every hero has a first flight." | drift-down (echoes the descent) |
| 2 | 0.26 to 0.50 | descending past the skyline | "39 films. One story, told in the order it happened." | scatter (echoes thruster embers) |
| 3 | 0.54 to 0.74 | landing, mist bursts off the roof | "Know what to watch first. Every time." | blur-to-sharp (echoes the mist settling) |
| 4 | 0.78 to 1.00 | at rest, palm raised and charged | "From a cave in Afghanistan to the edge of the Multiverse." + CTA | word rise, staged settle, "Multiverse" glows repulsor blue |

Flick test: 120px steps hold each band for 5 to 6 flicks; no band is skippable at 360px.
Legibility audit (worst pixel, scrims applied): 16.0, 15.6, 10.4, 12.0 to 1.

## 5. Static hero (phones, portrait tablets, reduced motion)
The ending frame with the settle copy, CTA and progress. No video is downloaded.

## 6. Below the hero
Arc reactor (the one interactive moment: press and hold to power up and reveal your progress), the two-saga story, the timeline (the CTA anchor), film pages with the shield preloader and trailers.

## 7. Vector layer
Shield preloader (SVG), Doctor Strange splash (SVG mandala + canvas spark portal), arc reactor (SVG), HUD brackets and readouts, drifting background glow and grain.

## 8. Copy gate
Zero em dashes and zero stock words in the shipped copy. "Delve into the darkness." is kept because it is Thor: The Dark World's real tagline.
