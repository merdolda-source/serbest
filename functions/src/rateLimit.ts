import { HttpsError } from "firebase-functions/v2/https";
import { db } from "./admin";
import { RATE_LIMIT_MAX_COMMENTS_PER_MINUTE } from "./config";

/**
 * rateLimits/{uid} dokümanında son 60 saniyedeki yorum zaman damgalarını
 * tutar. Limit aşılırsa HttpsError fırlatır; aşılmazsa yeni zaman damgasını
 * ekleyip devam eder. Tek bir transaction içinde okunup yazılır (race-condition'a karşı).
 */
export async function enforceCommentRateLimit(uid: string): Promise<void> {
  const ref = db.collection("rateLimits").doc(uid);
  const now = Date.now();
  const windowStart = now - 60_000;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const timestamps: number[] = snap.exists ? snap.data()?.commentTimestamps ?? [] : [];
    const recent = timestamps.filter((t) => t > windowStart);

    if (recent.length >= RATE_LIMIT_MAX_COMMENTS_PER_MINUTE) {
      throw new HttpsError(
        "resource-exhausted",
        "Çok hızlı yorum gönderiyorsunuz. Lütfen bir dakika bekleyin."
      );
    }

    recent.push(now);
    tx.set(ref, { commentTimestamps: recent, updatedAt: now }, { merge: true });
  });
}
