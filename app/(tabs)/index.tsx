import React, { useState } from "react";
import { FlatList } from "react-native";
import { ThemedView } from "@/components/Themed";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ContentCard } from "@/components/ContentCard";
import { NativeAdCard } from "@/components/NativeAdCard";
import { LoadingView } from "@/components/LoadingView";
import { ErrorView } from "@/components/ErrorView";
import { EmptyState } from "@/components/EmptyState";
import { OfflineBanner } from "@/components/OfflineBanner";
import { useContents } from "@/hooks/useContents";
import { AD_FREQUENCY } from "@/constants/theme";
import type { CategorySlug, Content } from "@/utils/types";

type FeedRow = { kind: "content"; content: Content } | { kind: "ad"; key: string };

function buildFeedRows(items: Content[]): FeedRow[] {
  const rows: FeedRow[] = [];
  items.forEach((content, index) => {
    rows.push({ kind: "content", content });
    if ((index + 1) % AD_FREQUENCY.feedItemsPerNativeAd === 0) {
      rows.push({ kind: "ad", key: `ad-${content.id}` });
    }
  });
  return rows;
}

export default function HomeScreen() {
  const [category, setCategory] = useState<CategorySlug | "all">("all");
  const state = useContents(category);

  return (
    <ThemedView style={{ flex: 1 }}>
      <OfflineBanner />
      <CategoryFilter selected={category} onSelect={setCategory} />

      {state.status === "loading" && <LoadingView />}
      {state.status === "error" && <ErrorView message={state.error} />}
      {state.status === "success" && state.data.length === 0 && (
        <EmptyState message="Bu kategoride henüz içerik yok." />
      )}
      {state.status === "success" && state.data.length > 0 && (
        <FlatList
          data={buildFeedRows(state.data)}
          keyExtractor={(row) => (row.kind === "content" ? row.content.id : row.key)}
          renderItem={({ item }) =>
            item.kind === "content" ? <ContentCard content={item.content} /> : <NativeAdCard />
          }
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </ThemedView>
  );
}
