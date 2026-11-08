# Sources — Getting the negative reviews

Each source has a preferred (authorized/public) path and an unofficial fallback. Prefer the official
path; respect rate limits and terms of service everywhere.

---

## Google Play Store

**Preferred (authorized):** Play Console **Reviews API** — server-to-server OAuth2. Returns structured
reviews (`comment`, `starRating`, `reviewer`, `lastModified`). This is the only fully-authorized way
to pull your own app's reviews programmatically.

**Unofficial (public, no auth):** the `google-play-scraper` npm package:

```js
import gplay from 'google-play-scraper';
const reviews = await gplay.reviews({
  appId: 'com.example.app',
  sort: gplay.sort.NEWEST,
  num: 500,
});
// each: { id, userName, text, score, date, version }
```

Filter to `score <= 3` for the negative set. Do not persist `userName` (privacy).

---

## Apple App Store

**Preferred (public, no auth):** the customer-reviews **RSS feed**:

```
https://itunes.apple.com/{country}/rss/customerreviews/id={appId}/sortBy=mostRecent/json
```

- `{country}` — e.g. `us`, `gb`, `de` (the feed is per-storefront; query the ones you care about).
- `{appId}` — the numeric App Store id.

A ready-to-run scraper is in `examples/fetch-appstore-reviews.mjs`.

**Unofficial:** the `app-store-scraper` npm package (`reviews({ id, country, sort })`).

Filter to `rating <= 3`.

---

## Twitter / X (websites & brands)

**Official:** X API v2 — `GET /2/tweets/search/recent` with a query that finds complaints:

```
"@brand" (bug OR broken OR crash OR worst OR "doesn't work" OR terrible) -is:retweet
```

Add negative-sentiment keywords and your product's name. Requires a paid API tier and key.

**Notes:**
- Search is rate-limited and recent-only without enterprise access.
- For a website, search the **product name + domain** rather than a Twitter handle.
- Twitter complaints have no rating — treat sentiment/severity via the analysis step.

---

## Pasted list (support inbox, CSVs, reviews export)

Any freeform text works. Paste:
- a CSV of complaints (`date,comment,rating`),
- a support-ticket export,
- a plain-text list of complaints, one per line,
- a spreadsheet column of negative comments.

The skill normalizes whatever you paste into the common review shape.

---

## Normalized review shape

Regardless of source, normalize to:

```jsonc
{
  "source": "play-store | app-store | twitter | pasted",
  "rating": 2,              // 1–5, or null for twitter/pasted
  "text": "The checkout button does nothing…",
  "date": "2026-10-01"
}
```

Optional `app_version` when the source provides it (useful to spot regressions).
