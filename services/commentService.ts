import firestore, { type FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { callable } from "@/services/firebase";
import type { Comment } from "@/utils/types";

function fromDoc(doc: FirebaseFirestoreTypes.QueryDocumentSnapshot): Comment {
  return { id: doc.id, ...doc.data() } as Comment;
}

export function subscribeToTopLevelComments(
  contentId: string,
  onChange: (comments: Comment[]) => void,
  onError: (error: Error) => void
) {
  return firestore()
    .collection("comments")
    .where("contentId", "==", contentId)
    .where("parentId", "==", null)
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snap) => onChange(snap.docs.map(fromDoc).filter((c) => c.status !== "removed")),
      onError
    );
}

export function subscribeToReplies(
  commentId: string,
  onChange: (comments: Comment[]) => void
) {
  return firestore()
    .collection("comments")
    .where("parentId", "==", commentId)
    .orderBy("createdAt", "asc")
    .onSnapshot((snap) => onChange(snap.docs.map(fromDoc)));
}

export function subscribeToOwnLike(
  commentId: string,
  uid: string,
  onChange: (liked: boolean) => void
) {
  return firestore()
    .collection("commentLikes")
    .doc(`${commentId}_${uid}`)
    .onSnapshot((snap) => onChange(snap.exists));
}

interface PostCommentInput {
  contentId: string;
  text: string;
  parentId?: string | null;
}

export async function postComment(input: PostCommentInput) {
  const fn = callable<PostCommentInput, { id: string; createdAt: number }>("postComment");
  const result = await fn(input);
  return result.data;
}

export async function toggleCommentLike(commentId: string) {
  const fn = callable<{ commentId: string }, { liked: boolean }>("toggleCommentLike");
  const result = await fn({ commentId });
  return result.data;
}

export async function deleteComment(commentId: string) {
  const fn = callable<{ commentId: string }, { success: boolean }>("deleteComment");
  await fn({ commentId });
}
