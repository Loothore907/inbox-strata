import { extractMessageFacts } from "./headers.js";
import type {
  ClassifiedMessage,
  Disposition,
  Evidence,
  InventoryGroup,
  InventoryReport,
  MessageFacts,
} from "./types.js";

interface AnalyzeOptions {
  ownAddresses: ReadonlySet<string>;
  includeSubjectSamples?: boolean;
  sampleLimit?: number;
  now?: () => Date;
}

class DisjointSet {
  private readonly parent: number[];

  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, index) => index);
  }

  find(value: number): number {
    const parent = this.parent[value];
    if (parent === undefined) throw new Error(`Unknown set member: ${value}`);
    if (parent !== value) this.parent[value] = this.find(parent);
    return this.parent[value] ?? value;
  }

  union(left: number, right: number): void {
    const leftRoot = this.find(left);
    const rightRoot = this.find(right);
    if (leftRoot !== rightRoot) this.parent[rightRoot] = leftRoot;
  }
}

function baseClassification(facts: MessageFacts): ClassifiedMessage {
  const evidence: Evidence[] = [];

  if (facts.sentByUser) evidence.push({ code: "user_sent", detail: "Sender or label identifies owner-sent mail" });
  if (facts.starred) evidence.push({ code: "starred", detail: "Message is starred or flagged" });
  if (facts.hasAttachment) evidence.push({ code: "attachment", detail: "Message declares an attachment" });
  if (facts.recordSignal) evidence.push({ code: "record_subject", detail: "Subject resembles a financial or legal record" });
  if (facts.securitySignal) evidence.push({ code: "security_subject", detail: "Subject resembles an account or security notice" });

  if (evidence.length > 0) return { facts, disposition: "protect", evidence };

  if (facts.bulkSignal) {
    return {
      facts,
      disposition: "quarantine_candidate",
      evidence: facts.bulkReasons.map((reason) => ({
        code: `bulk_${reason}`,
        detail: `Bulk evidence: ${reason}`,
      })),
    };
  }

  return {
    facts,
    disposition: "review",
    evidence: [{ code: "ambiguous", detail: "No protection or affirmative bulk evidence" }],
  };
}

function protectParticipatedThreads(messages: ClassifiedMessage[]): void {
  const sets = new DisjointSet(messages.length);
  const firstByToken = new Map<string, number>();

  messages.forEach(({ facts }, index) => {
    for (const token of facts.threadTokens) {
      const prior = firstByToken.get(token);
      if (prior === undefined) firstByToken.set(token, index);
      else sets.union(index, prior);
    }
  });

  const participatedRoots = new Set<number>();
  messages.forEach(({ facts }, index) => {
    if (facts.sentByUser) participatedRoots.add(sets.find(index));
  });

  messages.forEach((message, index) => {
    if (!participatedRoots.has(sets.find(index)) || message.facts.sentByUser) return;
    message.disposition = "protect";
    message.evidence.push({
      code: "thread_user_participation",
      detail: "Connected conversation contains owner-sent mail",
    });
  });
}

function emptyDispositionCounts(): Record<Disposition, number> {
  return { protect: 0, review: 0, quarantine_candidate: 0 };
}

function groupDisposition(counts: Record<Disposition, number>): Disposition {
  if (counts.review > 0) return "review";
  if (counts.protect > 0 && counts.quarantine_candidate > 0) return "review";
  if (counts.protect > 0) return "protect";
  return "quarantine_candidate";
}

function groupMessages(
  messages: ClassifiedMessage[],
  includeSubjectSamples: boolean,
  sampleLimit: number,
): InventoryGroup[] {
  const groups = new Map<string, ClassifiedMessage[]>();

  for (const message of messages) {
    const key = message.facts.listId ? `list:${message.facts.listId}` : `sender:${message.facts.sender}`;
    const group = groups.get(key) ?? [];
    group.push(message);
    groups.set(key, group);
  }

  return [...groups.entries()]
    .map(([key, group]) => {
      const dispositionCounts = emptyDispositionCounts();
      const evidenceCounts: Record<string, number> = {};
      for (const message of group) {
        dispositionCounts[message.disposition] += 1;
        for (const evidence of message.evidence) {
          evidenceCounts[evidence.code] = (evidenceCounts[evidence.code] ?? 0) + 1;
        }
      }

      const result: InventoryGroup = {
        key,
        display: key.slice(key.indexOf(":") + 1),
        messageCount: group.length,
        disposition: groupDisposition(dispositionCounts),
        dispositionCounts,
        evidenceCounts,
      };

      if (includeSubjectSamples) {
        result.subjectSamples = [...new Set(group.map(({ facts }) => facts.subject).filter(Boolean))].slice(0, sampleLimit);
      }
      return result;
    })
    .sort((left, right) => right.messageCount - left.messageCount || left.key.localeCompare(right.key));
}

export async function analyzeMessages(
  rawMessages: AsyncIterable<string>,
  options: AnalyzeOptions,
): Promise<InventoryReport> {
  const messages: ClassifiedMessage[] = [];
  let sourceIndex = 0;

  for await (const raw of rawMessages) {
    messages.push(baseClassification(extractMessageFacts(raw, sourceIndex, options.ownAddresses)));
    sourceIndex += 1;
  }

  protectParticipatedThreads(messages);
  const includeSubjectSamples = options.includeSubjectSamples ?? false;
  const sampleLimit = options.sampleLimit ?? 3;
  const totals = emptyDispositionCounts();
  for (const message of messages) totals[message.disposition] += 1;

  return {
    schemaVersion: "1.0",
    generatedAt: (options.now ?? (() => new Date()))().toISOString(),
    source: { kind: "mbox", messageCount: messages.length },
    parameters: { subjectSamplesIncluded: includeSubjectSamples, sampleLimit },
    totals,
    groups: groupMessages(messages, includeSubjectSamples, sampleLimit),
  };
}
