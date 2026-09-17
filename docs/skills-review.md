# Codex skills review

Reviewed: 2026-09-16

## Decision

Do not install or create a project-specific skill yet. The repository's `AGENTS.md`, architecture documents, tests, and handoff are sufficient for the current workflow. A premature skill would duplicate fast-changing guidance and make stale instructions harder to notice.

Official OpenAI documentation describes skills as focused, reusable workflows and recommends repository-scoped skills under `.agents/skills` when the workflow applies specifically to one project. It also recommends keeping each skill focused and preferring instructions unless deterministic scripts are necessary: <https://learn.chatgpt.com/docs/build-skills>.

## Appropriate available skills

### `openai-docs`

Use when Inbox Strata reaches optional model-assisted review and needs current, primary-source guidance for OpenAI APIs, model selection, data minimization, structured outputs, or evals. It should not be invoked for ordinary TypeScript, email parsing, Gmail API, or repository work.

### `skill-creator`

Revisit after the provider and review workflows have repeated enough to stabilize. Likely future candidates are:

- `inbox-strata-context`: bounded, committed-HEAD orientation for architecture, policy, open work, and evidence.
- `inbox-strata-policy-review`: review changes against privacy, mutation, evidence, and recovery boundaries.

These should be separate focused skills rather than one broad project skill. Do not create them until real repetition identifies stable steps and outputs.

### `visualize`

Useful on demand for explaining the decision funnel, provider boundaries, threat paths, and recovery lifecycle. It is a communication aid, not a repository or runtime dependency.

## Potential plugin, not currently installed

The Codex Security plugin is worth reconsidering before OAuth credentials, provider integrations, or mailbox mutation code are introduced. A security scan could supplement normal review and the threat model, but it would not prove runtime safety or replace provider-level recovery testing.

Do not install or use it without an explicit request. Its absence does not block the metadata-only scaffold in issue #3.

## Not appropriate for the core workflow

- Document, presentation, Canva, Figma, image, PDF, and site-building skills do not match the CLI and policy-engine work.
- Spreadsheet and Google Sheets skills could help analyze a deliberately sanitized export later, but mailbox-derived metadata should not be uploaded to a cloud sheet by default.
- Computer-use is unnecessary while APIs, Git, and local fixtures provide deterministic paths.
- Plugin and skill installers are not needed until a concrete missing workflow has been identified.
- Plugin creation is premature; Inbox Strata is a standalone open-source tool, not currently a Codex extension.

## Revisit gates

Review this decision when any of the following becomes true:

1. The same repository-orientation or policy-review sequence has been performed three times.
2. Optional model review enters an implementation issue.
3. Live provider credentials or mailbox mutation enters scope.
4. Contributors repeatedly miss a documented safety boundary that a focused skill could enforce procedurally.
