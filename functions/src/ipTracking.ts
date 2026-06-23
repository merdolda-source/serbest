import { FieldValue } from "firebase-admin/firestore";
import { db } from "./admin";

const MULTI_ACCOUNT_ALERT_THRESHOLD = 5;

/**
 * ipLogs/{ip} dokümanında bu IP'den yorum yapan benzersiz uid'leri tutar.
 * Aynı IP'den çok sayıda farklı hesap görülürse `flagged` işaretler
 * (otomatik ban değil — admin incelemesi için sinyal).
 */
export async function recordCommentIp(ip: string, uid: string): Promise<void> {
  const ref = db.collection("ipLogs").doc(ip.replace(/[/.:]/g, "_"));
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const uids: string[] = snap.exists ? snap.data()?.uids ?? [] : [];
    const uniqueUids = uids.includes(uid) ? uids : [...uids, uid];

    tx.set(
      ref,
      {
        ip,
        uids: uniqueUids,
        commentCount: FieldValue.increment(1),
        lastSeenAt: Date.now(),
        flagged: uniqueUids.length >= MULTI_ACCOUNT_ALERT_THRESHOLD,
      },
      { merge: true }
    );
  });
}

export function extractClientIp(rawRequest: { ip?: string; headers: Record<string, unknown> }): string {
  const forwarded = rawRequest.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return rawRequest.ip ?? "unknown";
}
