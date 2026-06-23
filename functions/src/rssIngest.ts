import { onSchedule } from "firebase-functions/v2/scheduler";
import { createHash } from "crypto";
import Parser from "rss-parser";
import { db } from "./admin";
import { anthropicApiKey } from "./anthropicClient";
import { generateContentFromTitle } from "./contentGenerator";
import { REGION, RSS_SOURCES, INGEST_MAX_ITEMS_PER_RUN, type CategorySlug } from "./config";

const parser = new Parser();

function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex");
}

async function ingestCategory(category: CategorySlug): Promise<number> {
  let created = 0;
  for (const feedUrl of RSS_SOURCES[category]) {
    let feed;
    try {
      feed = await parser.parseURL(feedUrl);
    } catch (err) {
      console.error(`RSS okunamadı (${category}, ${feedUrl}):`, err);
      continue;
    }

    for (const item of feed.items) {
      if (created >= INGEST_MAX_ITEMS_PER_RUN) return created;
      const title = item.title?.trim();
      const sourceUrl = item.link?.trim();
      if (!title || !sourceUrl) continue;

      const sourceId = hashUrl(sourceUrl);
      const sourceRef = db.collection("processedSources").doc(sourceId);
      const sourceSnap = await sourceRef.get();
      if (sourceSnap.exists) continue;

      try {
        const generated = await generateContentFromTitle(title, category);
        const now = Date.now();
        const contentRef = db.collection("contents").doc();
        await contentRef.set({
          id: contentRef.id,
          category,
          title: generated.title,
          summary: generated.summary,
          body: generated.body,
          imageUrl: null,
          sourceTitle: title,
          sourceUrl,
          aiGenerated: true,
          status: "published",
          viewCount: 0,
          commentCount: 0,
          createdAt: now,
          publishedAt: now,
        });
        await sourceRef.set({ sourceUrl, contentId: contentRef.id, processedAt: now });
        created += 1;
      } catch (err) {
        console.error(`İçerik üretilemedi (${category}, "${title}"):`, err);
      }
    }
  }
  return created;
}

export const ingestRssFeeds = onSchedule(
  {
    schedule: "every 30 minutes",
    region: REGION,
    secrets: [anthropicApiKey],
    timeoutSeconds: 300,
    memory: "512MiB",
  },
  async () => {
    const categories = Object.keys(RSS_SOURCES) as CategorySlug[];
    for (const category of categories) {
      const created = await ingestCategory(category);
      console.log(`[ingestRssFeeds] ${category}: ${created} yeni içerik`);
    }
  }
);
