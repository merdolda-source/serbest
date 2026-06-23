import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { db, messaging } from "./admin";
import { REGION } from "./config";

export const onContentCreatedNotify = onDocumentCreated(
  { document: "contents/{contentId}", region: REGION },
  async (event) => {
    const content = event.data?.data();
    if (!content || content.status !== "published") return;

    const { contentId } = event.params;

    await db.collection("notificationsFeed").doc(contentId).set({
      id: contentId,
      title: content.title,
      body: content.summary,
      category: content.category,
      contentId,
      createdAt: content.publishedAt ?? Date.now(),
    });

    try {
      await messaging.send({
        topic: `category_${content.category}`,
        notification: {
          title: content.title,
          body: content.summary,
        },
        data: {
          contentId,
          category: content.category,
        },
      });
    } catch (err) {
      console.error(`FCM gönderilemedi (${contentId}):`, err);
    }
  }
);
