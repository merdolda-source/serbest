import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./admin";
import { REGION } from "./config";
import { moderateCommentText } from "./moderation";
import { enforceCommentRateLimit } from "./rateLimit";
import { recordCommentIp, extractClientIp } from "./ipTracking";

function requireVerifiedUser(request: {
  auth?: { uid: string; token: Record<string, unknown> };
}) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Yorum yapmak için giriş yapmalısınız.");
  }
  if (!request.auth.token.email_verified) {
    throw new HttpsError(
      "permission-denied",
      "Yorum yapmak için e-posta adresinizi onaylamalısınız."
    );
  }
  return request.auth.uid;
}

interface PostCommentInput {
  contentId: string;
  text: string;
  parentId?: string | null;
}

export const postComment = onCall<PostCommentInput>(
  { region: REGION },
  async (request) => {
    const uid = requireVerifiedUser(request);
    const { contentId, text, parentId = null } = request.data;

    if (!contentId || typeof text !== "string") {
      throw new HttpsError("invalid-argument", "contentId ve text zorunludur.");
    }

    const userSnap = await db.collection("users").doc(uid).get();
    if (userSnap.data()?.banned) {
      throw new HttpsError("permission-denied", "Hesabınız yorum yapmaktan men edilmiştir.");
    }

    const moderation = moderateCommentText(text);
    if (!moderation.allowed) {
      throw new HttpsError("invalid-argument", moderation.reason ?? "Yorum uygun değil.");
    }

    await enforceCommentRateLimit(uid);

    const ip = extractClientIp(request.rawRequest);
    await recordCommentIp(ip, uid);

    if (parentId) {
      const parentSnap = await db.collection("comments").doc(parentId).get();
      if (!parentSnap.exists || parentSnap.data()?.contentId !== contentId) {
        throw new HttpsError("not-found", "Cevap verilen yorum bulunamadı.");
      }
    }

    const user = userSnap.data();
    const now = Date.now();
    const commentRef = db.collection("comments").doc();
    const batch = db.batch();

    batch.set(commentRef, {
      id: commentRef.id,
      contentId,
      parentId,
      authorId: uid,
      authorName: user?.displayName ?? "Kullanıcı",
      authorPhotoURL: user?.photoURL ?? null,
      text: text.trim(),
      status: "visible",
      likeCount: 0,
      replyCount: 0,
      createdAt: now,
      ip,
    });

    batch.update(db.collection("contents").doc(contentId), {
      commentCount: FieldValue.increment(1),
    });

    if (parentId) {
      batch.update(db.collection("comments").doc(parentId), {
        replyCount: FieldValue.increment(1),
      });
    }

    await batch.commit();
    return { id: commentRef.id, createdAt: now };
  }
);

export const toggleCommentLike = onCall<{ commentId: string }>(
  { region: REGION },
  async (request) => {
    const uid = requireVerifiedUser(request);
    const { commentId } = request.data;
    if (!commentId) {
      throw new HttpsError("invalid-argument", "commentId zorunludur.");
    }

    const likeRef = db.collection("commentLikes").doc(`${commentId}_${uid}`);
    const commentRef = db.collection("comments").doc(commentId);

    return db.runTransaction(async (tx) => {
      const [likeSnap, commentSnap] = await Promise.all([tx.get(likeRef), tx.get(commentRef)]);
      if (!commentSnap.exists) {
        throw new HttpsError("not-found", "Yorum bulunamadı.");
      }

      if (likeSnap.exists) {
        tx.delete(likeRef);
        tx.update(commentRef, { likeCount: FieldValue.increment(-1) });
        return { liked: false };
      }

      tx.set(likeRef, { commentId, uid, createdAt: Date.now() });
      tx.update(commentRef, { likeCount: FieldValue.increment(1) });
      return { liked: true };
    });
  }
);

export const deleteComment = onCall<{ commentId: string }>(
  { region: REGION },
  async (request) => {
    const uid = requireVerifiedUser(request);
    const { commentId } = request.data;
    const ref = db.collection("comments").doc(commentId);
    const snap = await ref.get();

    if (!snap.exists) {
      throw new HttpsError("not-found", "Yorum bulunamadı.");
    }
    if (snap.data()?.authorId !== uid) {
      throw new HttpsError("permission-denied", "Sadece kendi yorumunuzu silebilirsiniz.");
    }

    await ref.update({ status: "removed", text: "" });
    return { success: true };
  }
);
