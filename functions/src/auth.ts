import * as functionsV1 from "firebase-functions/v1";
import { db } from "./admin";

/**
 * "Tek hesap per e-posta" Firebase Auth tarafında zaten zorunludur
 * (Authentication > Settings > One account per email address).
 * Bu trigger sadece Firestore'daki users/{uid} dokümanının client tarafı
 * herhangi bir nedenle oluşturulamamış olsa bile var olmasını garantiler.
 */
export const onAuthUserCreate = functionsV1
  .region("europe-west1")
  .auth.user()
  .onCreate(async (user) => {
    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();
    if (snap.exists) return;

    await ref.set({
      uid: user.uid,
      email: user.email ?? null,
      emailVerified: user.emailVerified,
      displayName: user.displayName ?? null,
      photoURL: user.photoURL ?? null,
      createdAt: Date.now(),
      theme: "dark",
      notificationsEnabled: true,
      commentCountLastMinute: 0,
      banned: false,
    });
  });
