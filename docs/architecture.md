# Architecture

Inbox Strata uses a staged evidence pipeline:

```text
source adapter -> factual metadata -> thread graph -> policy -> groups -> report
```

The first source adapter streams an `mbox` file. It retains one raw message at a time, extracts headers and attachment declarations, and emits `MessageFacts`. It does not retain bodies or extract attachments.

The analyzer performs two passes over derived facts:

1. Assign a message-level disposition from explicit evidence.
2. Build connected components from message identifiers and protect each component containing owner-sent mail.

The reporting layer groups by mailing-list identifier or sender. Group policy is deliberately stricter than message policy: mixed protected and bulk populations require review.

Future provider adapters must produce the same fact contract. Future mutation adapters will be a separate package boundary and must consume approved plans rather than raw recommendations.

See [ADR-0001](adr/0001-local-first-evidence-pipeline.md).
