import assert from "node:assert/strict";
import test from "node:test";
import { analyzeMessages } from "../src/analyzer.js";

function message(headers: Record<string, string>, body = "Hello"): string {
  return `${Object.entries(headers).map(([name, value]) => `${name}: ${value}`).join("\n")}\n\n${body}`;
}

async function* messages(...items: string[]): AsyncGenerator<string> {
  yield* items;
}

const fixedNow = () => new Date("2026-09-16T12:00:00.000Z");

test("quarantines only messages with affirmative bulk evidence", async () => {
  const report = await analyzeMessages(
    messages(
      message({
        From: "Deals <offers@example.test>",
        Subject: "Weekly deals",
        "Message-ID": "<bulk-1@example.test>",
        "List-ID": "<offers.example.test>",
        "List-Unsubscribe": "<mailto:leave@example.test>",
      }),
    ),
    { ownAddresses: new Set(["owner@example.test"]), now: fixedNow },
  );

  assert.equal(report.totals.quarantine_candidate, 1);
  assert.equal(report.groups[0]?.disposition, "quarantine_candidate");
  assert.equal(report.groups[0]?.subjectSamples, undefined);
});

test("protects an inbound message connected to owner-sent mail", async () => {
  const report = await analyzeMessages(
    messages(
      message({
        From: "person@example.test",
        Subject: "A real conversation",
        "Message-ID": "<inbound@example.test>",
      }),
      message({
        From: "owner@example.test",
        To: "person@example.test",
        Subject: "Re: A real conversation",
        "Message-ID": "<reply@example.test>",
        "In-Reply-To": "<inbound@example.test>",
        References: "<inbound@example.test>",
      }),
    ),
    { ownAddresses: new Set(["owner@example.test"]), now: fixedNow },
  );

  assert.equal(report.totals.protect, 2);
  assert.equal(
    report.groups.reduce(
      (total, group) => total + (group.evidenceCounts["thread_user_participation"] ?? 0),
      0,
    ),
    1,
  );
});

test("protects records, security notices, attachments, and starred messages", async () => {
  const report = await analyzeMessages(
    messages(
      message({ From: "billing@example.test", Subject: "Invoice 1042" }),
      message({ From: "identity@example.test", Subject: "Security alert" }),
      message(
        { From: "files@example.test", Subject: "Requested file" },
        "Content-Disposition: attachment; filename=record.pdf",
      ),
      message({
        From: "friend@example.test",
        Subject: "Checking in",
        "X-Gmail-Labels": "Inbox,Starred",
      }),
    ),
    { ownAddresses: new Set(["owner@example.test"]), now: fixedNow },
  );

  assert.equal(report.totals.protect, 4);
});

test("preserves ambiguous human-looking mail for review", async () => {
  const report = await analyzeMessages(
    messages(message({ From: "someone@example.test", Subject: "Hello" })),
    { ownAddresses: new Set(["owner@example.test"]), now: fixedNow },
  );

  assert.equal(report.totals.review, 1);
  assert.equal(report.groups[0]?.evidenceCounts["ambiguous"], 1);
});

test("mixed sender groups require review instead of applying a bulk decision", async () => {
  const report = await analyzeMessages(
    messages(
      message({
        From: "store@example.test",
        Subject: "Sale",
        "List-Unsubscribe": "<mailto:leave@example.test>",
      }),
      message({ From: "store@example.test", Subject: "Your receipt" }),
    ),
    {
      ownAddresses: new Set(["owner@example.test"]),
      includeSubjectSamples: true,
      sampleLimit: 1,
      now: fixedNow,
    },
  );

  assert.equal(report.groups[0]?.disposition, "review");
  assert.deepEqual(report.groups[0]?.subjectSamples, ["Sale"]);
});
