# Katyal Fitness Gym — landing page

A static recreation of the **Katyal gym** Figma design: dark theme, yellow + red
accents, angled stripe dividers, nine sections from navbar to footer, with a
looping video hero.

All photography, the logo, the badge icon, and the colour palette are the **real
assets pulled out of the Figma file** — not placeholders.

## Run it

Open `index.html` in a browser. No build step, no dependencies.

> One caveat: some browsers block `file://` video playback. If the hero clip does
> not start when opening the file directly, serve the folder instead —
> `npx serve .` — and the video plays normally.

## Structure

```
index.html          all markup, one section per design block
css/styles.css      design tokens + every component
js/main.js          hero video, nav, carousel, reviews, reveal-on-scroll
images/             19 assets extracted from the Figma file
video/hero.mp4      hero background clip
```

Sections: navbar → hero → about → services carousel → features → **membership** →
promo banner → gallery → reviews → footer.

## Membership

Three tiers — Basic ₹1,499 / Pro ₹2,499 / Elite ₹3,999 per month — with Pro
flagged "Most Popular". Prices, plan names, and feature lists are all plain
markup in `index.html`; there is no data layer to wire up.

The cards stretch to equal height and the CTA is pushed down with `margin-top:
auto`, so the buttons stay on one line across all three even though the feature
lists differ in length. The featured tier is distinguished by border, background,
and shadow rather than a vertical offset, which keeps it aligned with its
neighbours and lets the hover lift read the same on every card. Below 900px the
grid collapses to a single centred column.

## Hero video

`video/hero.mp4` — 1280×720, 10.0s, H.264, 2.4 MB. Set to
`autoplay muted loop playsinline`.

The `<video>` is a **direct child of `<section class="hero">`**, pinned with
`position:absolute; inset:0` and `object-fit:cover` — no wrapper element, so the
section's own padding never insets it and the footage runs the full bleed of the
section at any viewport ratio.

Above it sits `.hero__scrim`, a deliberately light overlay (roughly 35% at the
headline rather than the ~80% a solid scrim would need). The headline and
sub-copy carry their own `text-shadow` to hold contrast against moving frames
instead of relying on a heavy wash, and the scrim's last gradient stop lands on
`--bg` so the hero blends into the next section rather than ending on a hard
edge.

`images/hero-bg.jpg` (the original Figma hero still) is wired up as the video's
`poster`, which means it is what you see in every fallback path:

- before the first frame decodes
- if the file is missing or the codec is unsupported
- when the visitor has **reduced motion** enabled — playback is suppressed
- when the browser reports **data-saver**, in which case the sources are detached
  and `load()` is called to abort the transfer entirely (pausing alone would
  still pull down all 2.4 MB)

The clip also pauses via `IntersectionObserver` once the hero scrolls out of
view, so it is not decoding frames while you are further down the page. The
video is muted because it carries an audio track and autoplay requires it.

To swap the clip, drop a new file at `video/hero.mp4`.

## Typography

- **Headings — Teko** (weights 600/700)
- **Body — Poppins** (300–700)

Teko is condensed with a short cap-height, so display sizes here run noticeably
larger and tighter than they would for a wider face — the hero runs to 86px and
section headings to 56px. If you swap the display face, expect to retune those
sizes rather than reuse them; both are set via `--font-display` / `--font-body`
in `css/styles.css` plus the Google Fonts `<link>` in `index.html`.

## Colours — measured, not guessed

Brand colours were sampled pixel-by-pixel from the logo asset, the greys from the
design's flat background areas:

```css
--yellow:  #fdd201;   /* dominant opaque colour in logo.png */
--red:     #fa0108;   /* the bicep mark in the logo */
--red-d:   #cf0106;   /* hover state */
--bg:      #181920;   /* darker alternating section */
--bg-alt:  #1e1f28;   /* most common background pixel in the design */
--card:    #2a2b35;
--container: 1240px;
```

The two accents have distinct jobs, so the page does not read as noise:

- **Red = the loudest call to action** — the hero's solid "Explore More" button,
  "Register Now" in the promo card, the "Get 15% Discount" line, carousel-arrow
  and feature-card hovers, social-icon hovers.
- **Yellow = brand and conversion** — the "Join Us Now" navbar CTA, the featured
  membership tier (border, badge, prices, CTA), eyebrows, links, review stars,
  the newsletter button.
- **White** — the hero's outlined secondary button. Over video, a white outline
  stays legible on any frame in a way a coloured one does not.
- **The angled stripes carry both**: thin bar red over thick bar yellow, the same
  pairing as the logo, repeated at all six section seams so red runs as a rhythm
  down the whole page.

Editing `--yellow` or `--red` re-skins the site.

## Assets extracted from Figma

| File | Used for |
| --- | --- |
| `logo.png` | The real logo (transparent PNG, 268×92) — navbar + footer |
| `badge-tc99.png` | Transparent badge icon — feature cards + about label |
| `hero-bg.jpg` | Hero video poster / fallback still |
| `about-left.png`, `about-right.png` | About section pair |
| `service-*.png` (×4) | Services carousel |
| `features-athletes.png` | Transparent cut-out of the two athletes |
| `promo-bg.png` | Summer promo banner background |
| `gallery-1.png`, `gallery-2.png` | Gallery large images |
| `gallery-thumb-1/2/3.png` | Gallery thumbnail row |
| `avatar-1/2/3.jpg` | Testimonial avatars |

The carousel has exactly four cards because the file contains exactly four
service images.

Two assets carry transparency and are handled accordingly:
`features-athletes.png` uses `object-fit: contain` (not `cover`, which would crop
a figure) with no backdrop, and `badge-tc99.png` sits directly on the card.

## What is interactive

- **Navbar** — floats over the hero, solidifies on scroll, highlights the section
  you are in; collapses to a burger menu under 900px.
- **Services carousel** — arrows plus drag/swipe, clamps at both ends,
  recalculates how many cards fit on resize.
- **Reviews** — the three dots page through three sets of testimonials
  (`reviewPages` in `js/main.js`).
- **Newsletter** — inline email validation.
- **Reveal on scroll** — via `IntersectionObserver`, disabled under
  `prefers-reduced-motion`.

## Locations

A "Where To Train" section sits between the reviews and the footer, with the
navbar's Contact link pointing at it. Each branch is a card carrying an embedded
Google map, the address, the branch phone, and Get Directions / Call buttons.

**Only one branch is live.** No second Katyal Fitness Gym location appears on any
public listing, so rather than guess an address the second card sits commented
out in `index.html` as a filled-in template. To enable it, uncomment the block and
replace the branch name, address lines, phone number (in both links) and the two
map queries. Nothing else needs touching — the grid uses
`repeat(auto-fit, minmax(min(100%, 380px), 1fr))`, so it splits from one
full-width card into two columns on its own.

The maps are plain `maps.google.com/maps?q=…&output=embed` iframes, which need no
API key and no billing account. The address goes in as a readable query string,
so editing it for a new branch is a copy-paste. They are `loading="lazy"`, so
nothing is fetched from Google until a visitor scrolls down.

Two visual notes: `.loc__map` is 16:9 but capped at `max-height: 320px`, since a
single full-width branch would otherwise render a 670px-tall map. And the iframe
carries a `filter: invert(90%) hue-rotate(180deg)…`, the usual trick for making
Google's light-only embed tiles sit in a dark page — delete that one line for the
stock light map.

## Business details — sourced, not invented

Copy now reflects the real business. Verified across the Google listing and a
second directory:

| Field | Value |
| --- | --- |
| Address | Tajpur Road, Backside Dashmesh Dairy, Samrala Chowk, Karam Colony, Ludhiana, Punjab 141008 |
| Phone | +91 98595 95969 |
| Rating | 4.4 / 5 from 39 Google reviews |
| Type | Unisex gym |
| Memberships | Teens · Individual · Family |
| Facebook | facebook.com/KatyalFitnessGymLudhiana |
| Instagram | instagram.com/katyalfitnessgymldh |

**Deliberately not published,** because no public source lists them — do not
guess at these:

- **Membership rates.** The pricing cards show the phone number and "call for
  current rates" instead of a figure. Earlier drafts carried invented rupee
  prices; those are gone.
- **Opening hours.** No hours section exists rather than a made-up one.
- **Individual reviews.** The section shows the real aggregate (4.4 from 39) and
  links to Google. The three testimonial cards are commented out in
  `index.html` with a template — fill them from actual Google reviews. Never
  ship invented names against invented quotes.
- **Email address.** Removed; the footer offers phone and directions instead.

One claim still needs your confirmation: the **"Get 15% Discount"** line in the
promo banner comes from the Figma design and matches no public listing. There is
a comment beside it in `index.html`. Confirm the offer is live or change the line
before launch.

Twitter, LinkedIn and YouTube links were removed — no such profiles were found.

## Copy

The design's own headings are kept as-is where the Figma file had real ones
("Build Strength. Build Confidence.", "More Than A Gym, A Place To Transform.",
"Our Fitness Solution For Strong Body", "Fitness training this Summer"). Where
the file used lorem ipsum placeholders, those headings and paragraphs have been
replaced with copy about the actual gym.

Body copy stays general on purpose — it describes the unisex floor, the
membership structure and the location, all of which are verifiable. It makes no
claim about equipment counts, trainer certifications, years in business or class
timetables, none of which could be confirmed.

Exact spacing and the original type scale still live in the Figma document, which
is only reachable with a token — `curl -H "X-Figma-Token: $FIGMA_TOKEN"
"https://api.figma.com/v1/files/lRq7XvmMOTqy27lw4TsWH9"` — if you ever want to
reconcile the two.
#   k a t y a l g y m  
 