# Roadmap

The roadmap is evidence-gated. A later phase does not begin merely because its predecessor has code; the preceding safety claims must be exercised with representative fictional and user-approved data.

## Phase 0 — Repository and policy foundation

- Apache-2.0 licensing, contribution guidance, security policy, and CI.
- Explicit data-handling boundaries and decision vocabulary.
- Provider-independent facts and recommendations.

## Phase 1 — Read-only local inventory (current)

- Stream local `mbox` exports.
- Build conversation relationships from standard message headers.
- Classify with deterministic protection and bulk evidence.
- Group campaigns and senders into an explainable JSON report.
- Keep subject samples opt-in and retain no message bodies.

Exit evidence: tests cover thread participation, records, attachments, bulk evidence, ambiguity, mixed groups, and mbox streaming.

## Phase 2 — Read-only provider adapters

- Gmail API adapter using the minimum read-only scope.
- Microsoft Graph adapter using the minimum read-only scope.
- IMAP adapter with an explicitly read-only session.
- Local checkpoint database containing provider IDs and metadata, never credentials or bodies by default.

Exit evidence: adapter contract tests and documented proof that inventory runs cannot mutate mail.

## Phase 3 — Review experience

- Human-readable summary and sender/campaign drill-down.
- Rule overrides, protected senders, and account-specific configuration.
- Stratified sampling to estimate false-positive risk.
- Optional model review of unresolved groups using disclosed, minimized fields.

Exit evidence: user can understand, export, and revise every recommendation without granting write access.

## Phase 4 — Reversible quarantine

- Separate OAuth consent and capability for label/archive operations.
- Dry-run diff, bounded batches, action receipts, and undo.
- Recovery period and post-action reconciliation.

Exit evidence: provider-level recovery drills succeed before any broad cleanup.

## Phase 5 — Destructive lifecycle

- Optional trash workflow only after quarantine history and explicit confirmation.
- Permanent deletion remains out of scope until separately designed and threat-modeled.
- Multi-account scheduling with per-account policies, rate limits, and notifications.

## Non-goals

- Training on mailbox content.
- Autonomous replies or unsubscribe interactions.
- Treating provider importance, unread state, or category labels as proof that a message is disposable.
- Hiding destructive behavior behind a generic “clean” command.
