import test from 'node:test';
import assert from 'node:assert/strict';
import {
  prevalenceScore,
  recencyWeight,
  sortFeatureRequests,
  tierOf,
} from './score.mjs';

test('a blocker outranks a far more frequent low-severity item', () => {
  const items = [
    { id: 'dark-mode', severity: 'low', category: 'ux', evidenceCount: 100, recentEvidence: 100 },
    { id: 'crash', severity: 'blocker', category: 'bug', evidenceCount: 4, recentEvidence: 4 },
  ];
  const ranked = sortFeatureRequests(items, 340);
  assert.equal(ranked[0].id, 'crash');
});

test('rare data-loss (critical: true) pins above everything, even a blocker', () => {
  const items = [
    { id: 'crash', severity: 'blocker', category: 'bug', evidenceCount: 40, recentEvidence: 40 },
    { id: 'wipe', severity: 'blocker', category: 'bug', critical: true, evidenceCount: 2, recentEvidence: 2 },
  ];
  const ranked = sortFeatureRequests(items, 340);
  assert.equal(ranked[0].id, 'wipe');
});

test('security category always pins to the top', () => {
  const items = [
    { id: 'cosmetic', severity: 'high', category: 'feature', evidenceCount: 500, recentEvidence: 500 },
    { id: 'leak', severity: 'medium', category: 'security', evidenceCount: 1, recentEvidence: 1 },
  ];
  const ranked = sortFeatureRequests(items, 500);
  assert.equal(ranked[0].id, 'leak');
});

test('within a tier, higher prevalence wins', () => {
  const items = [
    { id: 'a', severity: 'high', category: 'bug', evidenceCount: 10, recentEvidence: 10 },
    { id: 'b', severity: 'high', category: 'bug', evidenceCount: 40, recentEvidence: 40 },
  ];
  const ranked = sortFeatureRequests(items, 100);
  assert.equal(ranked[0].id, 'b');
});

test('within a tier, fresher evidence outranks stale evidence', () => {
  const items = [
    { id: 'stale', severity: 'high', category: 'bug', evidenceCount: 50, recentEvidence: 5 },
    { id: 'fresh', severity: 'high', category: 'bug', evidenceCount: 50, recentEvidence: 50 },
  ];
  const ranked = sortFeatureRequests(items, 100);
  assert.equal(ranked[0].id, 'fresh');
});

test('recencyWeight is 0.5 (stale) to 1.0 (fresh)', () => {
  assert.equal(recencyWeight(0, 10), 0.5);
  assert.equal(recencyWeight(10, 10), 1.0);
});

test('prevalenceScore is bounded and monotonic in evidence', () => {
  assert.ok(prevalenceScore(10, 100, 10) > prevalenceScore(5, 100, 5));
  assert.ok(prevalenceScore(500, 100, 100) <= 100);
});

test('tierOf: critical > blocker > high > medium > low', () => {
  assert.ok(tierOf({ critical: true, severity: 'low', category: 'bug' }) > tierOf({ severity: 'blocker', category: 'bug' }));
  assert.ok(tierOf({ severity: 'blocker', category: 'bug' }) > tierOf({ severity: 'high', category: 'bug' }));
  assert.ok(tierOf({ severity: 'high', category: 'bug' }) > tierOf({ severity: 'low', category: 'bug' }));
});
