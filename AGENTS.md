# Repository guidance

Inbox Strata handles sensitive personal data. Changes must preserve these boundaries unless a reviewed issue explicitly changes them:

- Mailbox access is read-only by default.
- Permanent deletion is disabled by default and must never be introduced as an implicit side effect.
- Classification decisions must expose machine-readable evidence.
- Do not log message bodies, credentials, OAuth tokens, or attachment contents.
- Tests and fixtures must use fictional data only.
- Provider adapters must remain separate from the policy engine.

Run the project checks documented in `CONTRIBUTING.md` before committing. Use issue-linked `codex/` branches and Conventional Commits.

