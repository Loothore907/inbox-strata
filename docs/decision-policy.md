# Decision policy and parameters

Inbox Strata separates factual extraction from policy. Provider adapters emit message facts; the policy engine converts those facts into recommendations. No recommendation in the current release performs an action.

## Dispositions

| Disposition | Meaning | Current action |
| --- | --- | --- |
| `protect` | Evidence indicates interaction, a record, an attachment, or sensitive account mail. | None |
| `review` | Evidence is absent, ambiguous, or mixed within a group. | None |
| `quarantine_candidate` | Every message in the group has affirmative bulk evidence and no protection evidence. | None |

## Default protection evidence

- Sender matches an owner address or a provider label marks the message as sent.
- A connected thread contains owner-sent mail.
- Provider labels mark the message starred or flagged.
- MIME metadata declares an attachment.
- The subject resembles a financial/legal record or an account/security notice.

Protection is intentionally biased toward false positives: preserving unwanted mail is cheaper than losing a legitimate record.

## Default bulk evidence

- `List-ID` or `List-Unsubscribe` header.
- `Precedence: bulk`, `list`, or `junk`.
- A campaign header.
- A provider promotions label.

Marketing-like wording alone is not sufficient. A message with no protection or bulk evidence remains `review`.

## Grouping

Messages are grouped by normalized `List-ID`, then sender address. A group is:

- `protect` only when every classified message is protected;
- `quarantine_candidate` only when every classified message is a candidate; or
- `review` when it contains ambiguity or mixes protected and bulk messages.

## User-visible parameters

| Parameter | Default | Constraint |
| --- | --- | --- |
| Owner addresses | none | At least one is required. Aliases may be repeated. |
| Subject samples | disabled | Explicit opt-in because subjects can contain sensitive data. |
| Subject sample limit | 3 | Integer from 0 through 20. |
| Deletion | unavailable | A later destructive workflow requires separate design and authorization. |
| Model review | unavailable | A later adapter must minimize and disclose transmitted data. |

## Planned mutation parameters

These are design commitments, not implemented behavior:

- dry-run enabled by default;
- deletion disabled by default;
- configurable quarantine label;
- minimum quarantine age;
- recovery window before any trash operation;
- maximum messages changed per run;
- immutable action receipt with provider IDs and before/after state;
- explicit account allowlist and operation allowlist.
