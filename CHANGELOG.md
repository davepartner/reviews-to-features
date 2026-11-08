# Changelog

All notable changes to this skill. Pin by tag/commit when consuming.

## [Unreleased]

### Fixes (from the initial review)
- **Severity-first ranking** replaces the frequency-product formula (which crushed rare-but-critical
  issues); added a critical fast lane for security/data-loss.
- **Single-primary-theme clustering** with an embedding similarity threshold (removes double-counting).
- **Defect vs feature split** and a new **Verify** step (re-check the metric after shipping).
- **Expanded sources** (Reddit, G2, Trustpilot, HN) + cross-source dedupe + regression flagging.
- **PII redaction** is now an explicit pipeline step (aggregates + anonymized paraphrases, not quotes).
- **Testable reference ranking** in `examples/score.mjs` (+ `score.test.mjs`).

### Initial release
- Review-mining pipeline (collect → analyze → convert → select → implement), sources, analysis
  framework, output format, worked example, and an App Store RSS scraper.
