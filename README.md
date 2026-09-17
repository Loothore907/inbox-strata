# Inbox Strata

> Excavate neglected inboxes without burying what matters.

[![CI](https://github.com/Loothore907/inbox-strata/actions/workflows/ci.yml/badge.svg)](https://github.com/Loothore907/inbox-strata/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

Inbox Strata is a local-first, open-source email inventory and cleanup project. It separates obvious bulk mail from legitimate interactions, records, account notices, and ambiguous messages without sending an entire mailbox to a model.

The current slice scans a local `mbox` export and creates an explainable JSON inventory. It cannot connect to or modify a mailbox.

## What it protects

- Entire connected conversations when one message was sent by the mailbox owner.
- Starred messages.
- Messages with attachments.
- Likely invoices, receipts, statements, contracts, and tax records.
- Likely account, authentication, security, privacy, and legal notices.
- Anything that is not confidently identifiable as bulk mail.

Only mail with affirmative bulk evidence can become a `quarantine_candidate`. The name is deliberately not `delete_candidate`: quarantine and deletion are different decisions.

## Quick start

Requirements: Node.js 22 or newer and pnpm 11.

```console
pnpm install --frozen-lockfile
pnpm build
node dist/cli.js scan path/to/export.mbox \
  --own-address you@example.com \
  --output reports/inventory.json
```

Multiple `--own-address` options may be supplied. Subjects are excluded from reports by default; add `--include-subject-samples` to include a small sample per group.

For development:

```console
pnpm check
```

## Output

Recommendations are grouped by `List-ID` when available and otherwise by sender. Every group includes message counts, its disposition, a per-disposition breakdown, and the evidence codes that contributed to the result.

- `protect`: every message in the group carries protection evidence.
- `review`: the group is ambiguous or mixes protected and bulk messages.
- `quarantine_candidate`: every message in the group has affirmative bulk evidence and no protection evidence.

See [Decision policy](docs/decision-policy.md), [Roadmap](docs/roadmap.md), and [Threat model](docs/threat-model.md).

## Safety principles

- Preserve ambiguity.
- Protect entire conversations when the user has participated.
- Prefer deterministic, explainable evidence over opaque classification.
- Keep credentials and message contents local by default.
- Quarantine before deletion, and make every future mutation reversible and auditable.

## Status

Inbox Strata is experimental. Review its report before making mailbox changes with any other tool.

## License

Licensed under the [Apache License 2.0](LICENSE).
