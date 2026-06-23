import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./admin";
import { REGION } from "./config";

/**
 * Görüntülenme sayacı: okuma kayıt gerektirmediği için (spec: "Kayıt
 * olmadan sadece okuma yapılabilir") bu fonksiyon anonim çağrılara da açıktır.
 */
export const incrementContentView = onCall<{ contentId: string }>(
  { region: REGION },
  async (request) => {
    const { contentId } = request.data;
    if (!contentId) {
      throw new HttpsError("invalid-argument", "contentId zorunludur.");
    }
    await db.collection("contents").doc(contentId).update({
      viewCount: FieldValue.increment(1),
    });
    return { success: true };
  }
);
