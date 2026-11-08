# Sources — getting the negative reviews

Each source has a preferred path and a fallback. Prefer official/authorized APIs; respect rate limits
and terms of service. **Scraping is fragile and may violate ToS** — treat unofficial paths as
best-effort.

---

## Apple App Store (public, no auth)

Customer-reviews RSS feed (per storefront, ~500 entries/page):

```
https://itunes.apple.com/{country}/rss/customerreviews/id={appId}/sortBy=mostRecent/json
```

- `{country}` — `us`, `gb`, `de`, … (query each storefront you care about).
- `{appId}` — numeric App Store id.

Ready-to-run scraper: `examples/fetch-appstore-reviews.mjs`. Filter to `rating <= 3`.

---

## Google Play Store

- **Authorized (your own app):** Play Console **Reviews API** — server-to-server OAuth2, structured
  (`comment`, `starRating`, `lastModified`).
- **Unofficial (fragile):** `google-play-scraper` npm (`reviews({ appId, sort, num })`). It breaks when
  Play changes its markup; don't build a product on it.

There is **no public official API** for Play reviews. Filter to `score <= 3`.

---

## Twitter / X (websites & brands)

X API v2 `GET /2/tweets/search/recent`:

```
"@brand" (bug OR broken OR crash OR worst OR "doesn't work" OR terrible) -is:retweet
```

- Requires a **paid tier**; free search is recent-only and near-useless for this purpose.
- For websites, search the product name + domain rather than a handle.
- No rating — sentiment/severity comes from the analysis step.

---

## Reddit, G2, Trustpilot, HN, forums

For products where these communities matter (and for websites):

| Source | How |
|--------|-----|
| **Reddit** | search `site:reddit.com "<product>" bug/crash/complaint` or the subreddit |
| **G2 / Capterra** | public review pages (B2B) |
| **Trustpilot** | public reviews (filter low stars) |
| **Hacker News** | Algolia API (`hn.algolia.com/api/v1/search?query=<product>`) |
| **YouTube** | comment scraping is hard; prefer a manual pull |
| **In-app feedback / NPS** | your own support tool export — the highest-signal source |

---

## Pasted list (support inbox, CSVs, exports)

Any freeform text: a CSV (`date,comment,rating`), a support-ticket export, a plain list, or a
spreadsheet column. The skill normalizes whatever you paste.

---

## Cross-source dedupe

The same complaint often appears on Play + App Store + Twitter + Reddit. After **clustering** (not
before), merge themes that are the same issue regardless of source — one theme, `source` listing all
the places it appeared, `evidence_count` summed once. Don't count the same user's complaint twice.

---

## Normalized review shape

```jsonc
{
  "source": "play-store | app-store | twitter | reddit | g2 | trustpilot | pasted",
  "rating": 2,              // 1–5, or null for twitter/pasted/forums
  "text": "The checkout button does nothing…",   // PII already redacted
  "date": "2026-10-01",
  "app_version": "4.2.0"    // optional — enables regression detection
}
```

`app_version` is the single most useful extra field: it lets you flag **release-introduced** bugs.
