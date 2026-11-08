// Reference implementation of the ranking logic. Language-neutral and testable
// with `node --test examples/*.test.mjs`. This encodes the severity-first,
// two-tier ranking plus the rare-but-critical fast lane.

// Severity tiers, primary sort key (higher = more important).
export const SEVERITY_RANK = { blocker: 3, high: 2, medium: 1, low: 0 };

// Categories that always pin to the top, regardless of frequency.
export const CRITICAL_CATEGORIES = new Set(['security']);

/** Recency weight: 0.5 (all stale) … 1.0 (all recent). Recent = last 90 days. */
export function recencyWeight(recentEvidence, evidence) {
  if (!evidence) return 0;
  return 0.5 + 0.5 * (recentEvidence / evidence);
}

/**
 * Prevalence within the negative set. Used ONLY to order items within a
 * severity tier — it must not let a frequent low-severity item outrank a
 * rare-but-severe one.
 */
export function prevalenceScore(evidence, totalNegative, recentEvidence) {
  if (!totalNegative) return 0;
  const frequency = Math.min(1, evidence / totalNegative);
  return Math.round(100 * frequency * recencyWeight(recentEvidence ?? evidence, evidence));
}

/** True for security issues and anything explicitly flagged as critical. */
export function isCritical(item) {
  return item.critical === true || CRITICAL_CATEGORIES.has(item.category);
}

/** The tier of an item. Critical pins ABOVE blocker. */
export function tierOf(item) {
  if (isCritical(item)) return SEVERITY_RANK.blocker + 1;
  return SEVERITY_RANK[item.severity] ?? 0;
}

/**
 * Sort a list of feature-request-like items, severity-first, then by
 * prevalence within the tier. Non-mutating.
 */
export function sortFeatureRequests(items, totalNegative) {
  return items
    .map((item) => ({
      item,
      tier: tierOf(item),
      score: prevalenceScore(item.evidenceCount, totalNegative, item.recentEvidence),
    }))
    .sort((a, b) => b.tier - a.tier || b.score - a.score || b.item.evidenceCount - a.item.evidenceCount)
    .map((x) => x.item);
}
