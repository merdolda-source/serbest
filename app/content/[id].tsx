import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { ThemedText, ThemedView } from "@/components/Themed";
import { CommentInput } from "@/components/CommentInput";
import { CommentItem } from "@/components/CommentItem";
import { NativeAdCard } from "@/components/NativeAdCard";
import { LoadingView } from "@/components/LoadingView";
import { ErrorView } from "@/components/ErrorView";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useComments } from "@/hooks/useComments";
import { subscribeToContent, recordContentView } from "@/services/contentService";
import { CATEGORIES } from "@/constants/categories";
import { AD_FREQUENCY } from "@/constants/theme";
import type { Content } from "@/utils/types";

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [content, setContent] = useState<Content | null | undefined>(undefined);
  const commentsState = useComments(id);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = subscribeToContent(id, setContent);
    recordContentView(id);
    return unsubscribe;
  }, [id]);

  if (content === undefined) return <LoadingView />;
  if (content === null) return <ErrorView message="İçerik bulunamadı." />;

  const categoryLabel = CATEGORIES.find((c) => c.slug === content.category)?.label;
  const comments = commentsState.status === "success" ? commentsState.data : [];

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText style={[styles.category, { color: colors.primary }]}>
              {categoryLabel?.toLocaleUpperCase("tr-TR")}
            </ThemedText>
            <ThemedText style={styles.title}>{content.title}</ThemedText>
            <ThemedText muted style={styles.meta}>
              {formatDistanceToNow(content.publishedAt, { addSuffix: true, locale: tr })} ·{" "}
              {content.viewCount} görüntülenme
            </ThemedText>
            <ThemedText style={styles.body}>{content.body}</ThemedText>
            <View style={[styles.aiNote, { borderColor: colors.border }]}>
              <ThemedText muted style={styles.aiNoteText}>
                🤖 Yapay zeka destekli içerik
              </ThemedText>
            </View>

            <ThemedText style={styles.commentsTitle}>
              Yorumlar ({content.commentCount})
            </ThemedText>
            <CommentInput contentId={content.id} />
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.commentRow}>
            <CommentItem comment={item} contentId={content.id} />
            {(index + 1) % AD_FREQUENCY.commentsPerNativeAd === 0 && <NativeAdCard />}
          </View>
        )}
        ListEmptyComponent={
          commentsState.status === "loading" ? null : (
            <EmptyState message="Henüz yorum yok. İlk yorumu siz yazın!" />
          )
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingBottom: 32 },
  header: { paddingHorizontal: 16, paddingTop: 12 },
  category: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: "800", marginTop: 6, lineHeight: 28 },
  meta: { fontSize: 12, marginTop: 8 },
  body: { fontSize: 16, lineHeight: 24, marginTop: 16 },
  aiNote: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 16 },
  aiNoteText: { fontSize: 12, textAlign: "center" },
  commentsTitle: { fontSize: 16, fontWeight: "700", marginTop: 24, marginBottom: 12 },
  commentRow: { paddingHorizontal: 16 },
});
