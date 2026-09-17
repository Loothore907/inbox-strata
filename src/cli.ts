#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { analyzeMessages } from "./analyzer.js";
import { readMboxMessages } from "./mbox.js";

function usage(): string {
  return `Inbox Strata 0.1.0

Usage:
  inbox-strata scan <mailbox.mbox> --own-address <address> [options]

Options:
  --own-address <address>        Owner address; repeat for aliases (required)
  --output <path>                Write JSON report to a file (default: stdout)
  --include-subject-samples      Include up to three subjects per group
  --sample-limit <number>        Subject sample limit (default: 3, max: 20)
  --help                         Show this help
`;
}

function fail(message: string): never {
  process.stderr.write(`Error: ${message}\n\n${usage()}`);
  process.exit(2);
}

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      "own-address": { type: "string", multiple: true },
      output: { type: "string" },
      "include-subject-samples": { type: "boolean", default: false },
      "sample-limit": { type: "string", default: "3" },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help) {
    process.stdout.write(usage());
    return;
  }
  if (positionals[0] !== "scan") fail("The first argument must be 'scan'.");
  if (!positionals[1]) fail("An mbox path is required.");
  const ownAddresses = new Set((values["own-address"] ?? []).map((value) => value.toLowerCase()));
  if (ownAddresses.size === 0) fail("At least one --own-address is required for interaction protection.");
  const sampleLimit = Number.parseInt(values["sample-limit"] ?? "3", 10);
  if (!Number.isInteger(sampleLimit) || sampleLimit < 0 || sampleLimit > 20) {
    fail("--sample-limit must be an integer from 0 through 20.");
  }

  const report = await analyzeMessages(readMboxMessages(resolve(positionals[1])), {
    ownAddresses,
    includeSubjectSamples: values["include-subject-samples"],
    sampleLimit,
  });
  const json = `${JSON.stringify(report, null, 2)}\n`;

  if (values.output) {
    const output = resolve(values.output);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, json, { encoding: "utf8", mode: 0o600 });
    process.stderr.write(`Wrote ${report.source.messageCount} message inventory to ${output}\n`);
  } else {
    process.stdout.write(json);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`Inbox Strata failed: ${message}\n`);
  process.exitCode = 1;
});
