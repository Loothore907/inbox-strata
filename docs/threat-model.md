# Threat model

## Assets

- Mailbox contents and metadata.
- OAuth and provider credentials.
- The user's interaction history and social graph.
- Financial, legal, account, and security records.
- Classification reports and action receipts.

## Primary risks

1. A false-positive recommendation causes loss of legitimate mail.
2. Sensitive subjects or message bodies leak through logs, reports, telemetry, or a model prompt.
3. A provider adapter receives broader permissions than its phase requires.
4. A partial or retried operation produces untracked mailbox mutations.
5. Crafted email headers manipulate grouping or classification.
6. Reports inherit unsafe filesystem permissions or are accidentally committed.

## Current controls

- The current slice reads only a local file and has no provider credentials or mutation code.
- Ambiguity becomes `review`; bulk wording without structural evidence is insufficient.
- User participation protects the connected conversation.
- Reports omit subjects unless explicitly enabled.
- Report files are created with owner-only permissions where supported and `reports/` is ignored by Git.
- One message is retained in memory at a time during mbox streaming; reports contain derived metadata only.
- Tests use fictional `.test` addresses and synthetic content.

## Accepted limitations in 0.1.0

- Mbox variants and malformed MIME/header encodings are not yet comprehensively supported.
- Header evidence can be forged. The output is a recommendation, not a trust or phishing verdict.
- Thread reconstruction depends on `Message-ID`, `References`, and `In-Reply-To` availability.
- Subject keyword rules favor preservation and may protect bulk mail.
- Sender addresses and list identifiers in the report are sensitive metadata.

## Required controls before mailbox writes

- Separate read and mutation capabilities.
- Explicit operation and account allowlists.
- Idempotency keys, bounded batches, before/after reconciliation, and an append-only local action receipt.
- Tested undo behavior and a recovery window.
- No permanent-delete permission.

Please report vulnerabilities according to [SECURITY.md](../SECURITY.md).
