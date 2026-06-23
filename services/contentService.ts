import firestore, { type FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { callable } from "@/services/firebase";
import type { CategorySlug, Content } from "@/utils/types";

const PAGE_SIZE = 10;

function fromDoc(doc: FirebaseFirestoreTypes.QueryDocumentSnapshot): Content {
  return { id: doc.id, ...doc.data() } as Content;
}

function baseQuery(category: CategorySlug | "all") {
  let query = firestore()
    .collection("contents")
    .where("status", "==", "published") as FirebaseFirestoreTypes.Query;

  if (category !== "all") {
    query = query.where("category", "==", category);
  }
  return query.orderBy("publishedAt", "desc");
}

export async function fetchFeedPage(
  category: CategorySlug | "all",
  cursor?: FirebaseFirestoreTypes.QueryDocumentSnapshot
) {
  let query = baseQuery(category).limit(PAGE_SIZE);
  if (cursor) query = query.startAfter(cursor);

  const snap = await query.get();
  return {
    items: snap.docs.map(fromDoc),
    lastDoc: snap.docs[snap.docs.length - 1],
    hasMore: snap.docs.length === PAGE_SIZE,
  };
}

export function subscribeToFeed(
  category: CategorySlug | "all",
  onChange: (items: Content[]) => void,
  onError: (error: Error) => void
) {
  return baseQuery(category)
    .limit(PAGE_SIZE)
    .onSnapshot(
      (snap) => onChange(snap.docs.map(fromDoc)),
      (error) => onError(error)
    );
}

export async function fetchContentById(id: string): Promise<Content | null> {
  const snap = await firestore().collection("contents").doc(id).get();
  return snap.exists ? ({ id: snap.id, ...snap.data() } as Content) : null;
}

export function subscribeToContent(
  id: string,
  onChange: (content: Content | null) => void
) {
  return firestore()
    .collection("contents")
    .doc(id)
    .onSnapshot((snap) => onChange(snap.exists ? ({ id: snap.id, ...snap.data() } as Content) : null));
}

export async function searchContents(term: string): Promise<Content[]> {
  const normalized = term.trim().toLocaleLowerCase("tr-TR");
  if (!normalized) return [];

  // Firestore basit metin araması desteklemediği için son yayınlardan
  // istemci tarafında filtreleme yapılır (küçük/orta ölçekli feed için yeterli).
  const snap = await firestore()
    .collection("contents")
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(200)
    .get();

  return snap.docs
    .map(fromDoc)
    .filter((content) =>
      content.title.toLocaleLowerCase("tr-TR").includes(normalized) ||
      content.summary.toLocaleLowerCase("tr-TR").includes(normalized)
    );
}

export async function recordContentView(contentId: string): Promise<void> {
  try {
    await callable("incrementContentView")({ contentId });
  } catch {
    // Görüntülenme sayacı kritik değil, sessizce yut
  }
}
