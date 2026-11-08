#!/usr/bin/env node
// Fetch negative reviews for an iOS app from Apple's public RSS feed (no auth).
// Usage: node fetch-appstore-reviews.mjs <appId> [country] [maxStars]
// Example: node fetch-appstore-reviews.mjs 284882215 us 3

const [,, appId, country = 'us', maxStars = '3'] = process.argv;

if (!appId) {
  console.error('Usage: node fetch-appstore-reviews.mjs <appId> [country] [maxStars]');
  process.exit(1);
}

const url = `https://itunes.apple.com/${country}/rss/customerreviews/id=${appId}/sortBy=mostRecent/json`;

const res = await fetch(url, {
  headers: { 'User-Agent': 'reviews-to-features/1.0 (+https://github.com/davepartner/reviews-to-features)' },
});
if (!res.ok) {
  console.error(`Request failed: ${res.status}`);
  process.exit(1);
}

const data = await res.json();
const entries = data.feed?.entry ?? [];

const reviews = [];
for (const entry of entries) {
  const rating = Number.parseInt(entry['im:rating']?.label ?? '', 10);
  if (Number.isNaN(rating)) continue;
  if (rating > Number.parseInt(maxStars, 10)) continue;

  reviews.push({
    source: 'app-store',
    rating,
    title: entry.title?.label ?? '',
    text: entry.content?.label ?? '',
    date: entry.updated?.label ?? '',
  });
}

console.log(JSON.stringify(reviews, null, 2));
console.error(`\n${reviews.length} negative review(s) found.`);
