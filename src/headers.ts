import type { MessageFacts } from "./types.js";

const RECORD_PATTERN =
  /\b(invoice|receipt|statement|order confirmation|payment confirmation|tax|1099|w-?2|insurance|contract)\b/i;
const SECURITY_PATTERN =
  /\b(password|security alert|sign[ -]?in|login|verification|two[ -]?factor|2fa|account recovery|privacy notice|legal notice)\b/i;
const EMAIL_PATTERN = /[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+/i;
const MESSAGE_ID_PATTERN = /<[^<>\s]+>/g;

function splitHeaderBlock(raw: string): string {
  const separator = /\r?\n\r?\n/.exec(raw);
  return separator ? raw.slice(0, separator.index) : raw;
}

export function parseHeaders(raw: string): Map<string, string[]> {
  const headers = new Map<string, string[]>();
  const unfolded = splitHeaderBlock(raw).replace(/\r?\n[\t ]+/g, " ");

  for (const line of unfolded.split(/\r?\n/)) {
    const separator = line.indexOf(":");
    if (separator <= 0) continue;
    const name = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();
    const existing = headers.get(name) ?? [];
    existing.push(value);
    headers.set(name, existing);
  }
  return headers;
}

function first(headers: Map<string, string[]>, name: string): string {
  return headers.get(name)?.[0] ?? "";
}

function decodeMimeWord(word: string, charset: string, encoding: string): string {
  try {
    const bytes =
      encoding.toLowerCase() === "b"
        ? Buffer.from(word, "base64")
        : Buffer.from(
            word.replace(/_/g, " ").replace(/=([0-9a-f]{2})/gi, (_, hex: string) =>
              String.fromCharCode(Number.parseInt(hex, 16)),
            ),
            "binary",
          );
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return word;
  }
}

export function decodeHeader(value: string): string {
  return value.replace(
    /=\?([^?]+)\?([bq])\?([^?]*)\?=/gi,
    (_, charset: string, encoding: string, word: string) => decodeMimeWord(word, charset, encoding),
  );
}

function extractAddress(value: string): string {
  return value.match(EMAIL_PATTERN)?.[0]?.toLowerCase() ?? "unknown";
}

function normalizeListId(value: string): string {
  const bracketed = /<([^<>]+)>/.exec(value)?.[1];
  return (bracketed ?? value).trim().toLowerCase();
}

function messageIds(value: string): string[] {
  return (value.match(MESSAGE_ID_PATTERN) ?? []).map((token) => token.toLowerCase());
}

function gmailLabels(headers: Map<string, string[]>): Set<string> {
  return new Set(
    (headers.get("x-gmail-labels") ?? [])
      .flatMap((value) => value.split(","))
      .map((label) => label.trim().replace(/^"|"$/g, "").toLowerCase()),
  );
}

export function extractMessageFacts(
  raw: string,
  sourceIndex: number,
  ownAddresses: ReadonlySet<string>,
): MessageFacts {
  const headers = parseHeaders(raw);
  const sender = extractAddress(first(headers, "from"));
  const senderDomain = sender.includes("@") ? sender.split("@")[1] ?? "unknown" : "unknown";
  const subject = decodeHeader(first(headers, "subject"));
  const listId = normalizeListId(first(headers, "list-id"));
  const labels = gmailLabels(headers);
  const precedence = first(headers, "precedence").toLowerCase();
  const bulkReasons: string[] = [];

  if (headers.has("list-id")) bulkReasons.push("list_id");
  if (headers.has("list-unsubscribe")) bulkReasons.push("list_unsubscribe");
  if (["bulk", "list", "junk"].includes(precedence)) bulkReasons.push("bulk_precedence");
  if (headers.has("x-campaign") || headers.has("x-mailer-campaign")) bulkReasons.push("campaign_header");
  if (labels.has("category promotions") || labels.has("promotions")) bulkReasons.push("promotions_label");

  const threadTokens = [
    ...messageIds(first(headers, "message-id")),
    ...messageIds(first(headers, "in-reply-to")),
    ...messageIds(first(headers, "references")),
  ];

  return {
    sourceIndex,
    sender,
    senderDomain,
    subject,
    listId,
    threadTokens: [...new Set(threadTokens)],
    sentByUser:
      ownAddresses.has(sender) || labels.has("sent") || labels.has("sent mail") || labels.has("\\sent"),
    starred: labels.has("starred") || labels.has("\\flagged"),
    hasAttachment: /content-disposition:\s*attachment\b/i.test(raw),
    recordSignal: RECORD_PATTERN.test(subject),
    securitySignal: SECURITY_PATTERN.test(subject),
    bulkSignal: bulkReasons.length > 0,
    bulkReasons,
  };
}
