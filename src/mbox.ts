import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

const ENVELOPE_LINE = /^From \S+ .+/;

export async function* readMboxMessages(path: string): AsyncGenerator<string> {
  const input = createReadStream(path, { encoding: "utf8" });
  const lines = createInterface({ input, crlfDelay: Number.POSITIVE_INFINITY });
  let current: string[] = [];
  let sawEnvelope = false;

  for await (const line of lines) {
    if (ENVELOPE_LINE.test(line)) {
      if (sawEnvelope && current.length > 0) {
        yield current.join("\n");
        current = [];
      }
      sawEnvelope = true;
      continue;
    }
    current.push(line.startsWith(">From ") ? line.slice(1) : line);
  }

  if (current.length > 0) yield current.join("\n");
}
