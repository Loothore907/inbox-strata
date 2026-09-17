export const DISPOSITIONS = ["protect", "review", "quarantine_candidate"] as const;

export type Disposition = (typeof DISPOSITIONS)[number];

export interface Evidence {
  code: string;
  detail: string;
}

export interface MessageFacts {
  sourceIndex: number;
  sender: string;
  senderDomain: string;
  subject: string;
  listId: string;
  threadTokens: string[];
  sentByUser: boolean;
  starred: boolean;
  hasAttachment: boolean;
  recordSignal: boolean;
  securitySignal: boolean;
  bulkSignal: boolean;
  bulkReasons: string[];
}

export interface ClassifiedMessage {
  facts: MessageFacts;
  disposition: Disposition;
  evidence: Evidence[];
}

export interface InventoryGroup {
  key: string;
  display: string;
  messageCount: number;
  disposition: Disposition;
  dispositionCounts: Record<Disposition, number>;
  evidenceCounts: Record<string, number>;
  subjectSamples?: string[];
}

export interface InventoryReport {
  schemaVersion: "1.0";
  generatedAt: string;
  source: { kind: "mbox"; messageCount: number };
  parameters: { subjectSamplesIncluded: boolean; sampleLimit: number };
  totals: Record<Disposition, number>;
  groups: InventoryGroup[];
}
