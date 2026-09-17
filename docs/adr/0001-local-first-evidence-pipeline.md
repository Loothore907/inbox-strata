# ADR-0001: Local-first evidence pipeline

- Status: Accepted
- Date: 2026-09-16

## Context

Neglected inboxes contain large quantities of bulk mail mixed with a small number of valuable interactions and records. Sending every message to a remote model is costly, privacy-invasive, and unnecessary. Direct mailbox writes would make early classification mistakes expensive.

## Decision

Build a local-first pipeline that separates source adapters, factual extraction, policy, reporting, and eventual mutation. Start with local mbox input and deterministic rules. Require explicit evidence for bulk classification, preserve ambiguity, and make model review optional and downstream of grouping.

No mutation code will be included in the inventory phase. Read-only provider access and write access will be separate capabilities.

## Consequences

- Most messages can be triaged without a model.
- Classification is explainable and testable.
- Users must export an mbox file for the first slice.
- Some bulk mail will be preserved for review.
- Provider-native signals and live incremental operation arrive later.
