# Next-session handoff: Phase 2A Gmail read-only foundation

Updated: 2026-09-16, America/Anchorage

## Repository identity

- Public repository: <https://github.com/Loothore907/inbox-strata>
- Local checkout: `C:\Users\looth\OneDrive\Documents\ChatGPT\gmail cleanup`
- Default branch: `main`
- First functional slice: PR #2, merged as `68786dd4196cece4a3abbe0d4de6075f69dffa59`
- Next owning issue: #3, `feat: add provider source contract and Gmail metadata scaffold`

Always fetch fresh remote state and verify exact heads before relying on these recorded identities.

## Product intent

Inbox Strata is a local-first, explainable email inventory and cleanup tool for neglected accounts. It should reduce large mailboxes to reviewable sender or campaign groups without sending every message to a model. Preservation errors are cheaper than deletion errors, so ambiguous mail stays in review.

## Implemented and validated

The merged first slice provides:

- a Node.js 22+ TypeScript CLI for streaming local `mbox` exports;
- metadata extraction without persisting message bodies or attachments;
- owner-address and sent-label detection;
- conversation protection through `Message-ID`, `References`, and `In-Reply-To` relationships;
- protection for starred mail, attachments, records, and account/security notices;
- affirmative bulk evidence from list, unsubscribe, precedence, campaign, and promotions metadata;
- `protect`, `review`, and `quarantine_candidate` dispositions;
- grouping by `List-ID` and sender with evidence counts;
- subject samples disabled by default;
- Apache-2.0 licensing, security reporting, Dependabot, and CI.

Validation at the merged slice:

- `pnpm check` passed: strict typecheck, six tests, and production build.
- CLI help and package dry-run passed.
- PR #2 exact-head CI passed before squash merge.
- GitHub recognizes the repository as public and Apache-2.0 licensed.

## Safety and authority boundaries

- No live mailbox credentials have been requested or used.
- No OAuth consent flow or provider connection exists.
- No model receives mailbox data.
- No archive, label, spam, trash, delete, reply, or unsubscribe operation exists.
- Subjects remain sensitive; reports omit samples by default.
- Sender addresses and list identifiers in reports are still sensitive metadata.
- Use only fictional fixtures and reserved domains in the repository.
- Keep secrets user-operated and out of chat, command arguments, environment dumps, logs, reports, URLs, fixtures, and commits.
- Live credential use, mailbox connection, mutation, package publication, release, or deployment requires fresh explicit authorization.

## Next recommended slice

Take issue #3 as Phase 2A. The goal is a provider-source seam and fixture-backed Gmail mapping layer, not a live integration.

1. Read `AGENTS.md`, this handoff, the architecture, decision policy, roadmap, threat model, and skills review.
2. Fetch and inspect current GitHub state, issue #3, branch state, inherited findings, and exact-head CI.
3. Research current Gmail API scope and response behavior using primary Google documentation before fixing the design.
4. Define a provider-neutral message-source contract that preserves the existing policy engine.
5. Refactor the mbox path behind that contract without changing its recommendations.
6. Add a Gmail metadata-to-facts mapper behind a client interface, using fictional response fixtures only.
7. Cover pagination, checkpoints, retries, duplicate delivery, rate limits, and partial failure in the contract and tests.
8. Document the proposed OAuth scope and credential-custody boundary, clearly separating design from implemented behavior.
9. Run local checks, inspect the exact diff, commit and push an issue-linked branch, open a PR, and verify CI against its exact head.
10. Stop before live OAuth, credential entry, live mailbox reads, mutation scopes, merge, release, or publication unless separately authorized.

## Design questions for issue #3

- Can Gmail's narrowest metadata scope supply every fact the current policy needs, including labels and requested headers?
- Which facts are provider-native and which must remain normalized core concepts?
- What stable checkpoint supports restart without silently skipping or duplicating messages?
- How should the source contract represent partial pages, unavailable headers, malformed messages, and rate-limit retries?
- What evidence proves the adapter cannot mutate a mailbox?

## Skills assessment

The current available skills were reviewed in `docs/skills-review.md`.

- Use `openai-docs` only for future OpenAI/model integration questions.
- Consider `skill-creator` later for separate context and policy-review workflows after they stabilize.
- Use `visualize` only when an architecture or threat-flow visual materially improves understanding.
- Consider the not-installed Codex Security plugin before credential or mutation code.
- Install or create nothing now; the existing repository guidance is sufficient for issue #3.

## Seed prompt

Copy this into the next session:

> Continue Inbox Strata in `C:\Users\looth\OneDrive\Documents\ChatGPT\gmail cleanup`. Read `AGENTS.md` and `docs/handoffs/2026-09-16-phase-2a-gmail-readonly.md` completely, then inspect fresh Git and GitHub state. Take issue #3 from current `origin/main` on a focused `codex/` branch. Implement Phase 2A: a provider-neutral source contract, refactor mbox behind it without changing behavior, and add a fixture-backed Gmail metadata mapper with contract tests and documentation for pagination, checkpoints, retries, rate limits, privacy, and credential custody. Research current Gmail API scope behavior from primary Google documentation before coding. Use only fictional fixtures. Do not request or use credentials, connect to a live mailbox, add mutation scopes or operations, send mailbox data to a model, merge, release, or publish without fresh explicit authority. Run local checks, inspect the exact diff, commit and push, open a PR, and verify CI against the exact head. Clearly distinguish implemented behavior from proposed live integration.

## Useful commands

```console
git fetch origin --prune
git status --short --branch
gh issue view 3 --repo Loothore907/inbox-strata
gh pr list --repo Loothore907/inbox-strata --state open
pnpm install --frozen-lockfile
pnpm check
```
