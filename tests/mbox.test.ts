import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { readMboxMessages } from "../src/mbox.js";

test("streams mbox messages and unescapes body From lines", async () => {
  const directory = await mkdtemp(join(tmpdir(), "inbox-strata-"));
  const path = join(directory, "mail.mbox");
  try {
    await writeFile(
      path,
      [
        "From sender@example.test Tue Sep 16 12:00:00 2026",
        "From: sender@example.test",
        "Subject: First",
        "",
        ">From escaped body",
        "From other@example.test Tue Sep 16 13:00:00 2026",
        "From: other@example.test",
        "Subject: Second",
        "",
        "Body",
      ].join("\n"),
    );

    const result: string[] = [];
    for await (const raw of readMboxMessages(path)) result.push(raw);

    assert.equal(result.length, 2);
    assert.match(result[0] ?? "", /From escaped body/);
    assert.match(result[1] ?? "", /Subject: Second/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
