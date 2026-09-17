# Contributing

Thank you for helping make neglected-inbox cleanup safer.

## Development

Requirements: Node.js 22 or newer and pnpm 11.

```console
pnpm install --frozen-lockfile
pnpm check
```

Use fictional messages and reserved domains such as `example.test` in tests. Never commit mailbox exports, reports, credentials, tokens, message bodies, or real personal information.

Open an issue before substantial work. Use focused branches and Conventional Commits. Changes that introduce provider permissions, telemetry, model calls, or mailbox mutations must include threat-model and decision-policy updates.

By contributing, you agree that your contributions are licensed under Apache-2.0.
