import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { ThemedSurface, ThemedText } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { CATEGORIES } from "@/constants/categories";
import type { Content } from "@/utils/types";

export function ContentCard({ content }: { content: Content }) {
  const router = useRouter();
  const { colors } = useTheme();
  const categoryLabel = CATEGORIES.find((c) => c.slug === content.category)?.label ?? content.category;

  return (
    <Pressable onPress={() => router.push(`/content/${content.id}`)}>
      <ThemedSurface style={styles.card}>
        <ThemedText style={[styles.category, { color: colors.primary }]}>
          {categoryLabel.toLocaleUpperCase("tr-TR")}
        </ThemedText>
        <ThemedText style={styles.title} numberOfLines={2}>
          {content.title}
        </ThemedText>
        <ThemedText muted numberOfLines={2} style={styles.summary}>
          {content.summary}
        </ThemedText>
        <ThemedText muted style={styles.meta}>
          {formatDistanceToNow(content.publishedAt, { addSuffix: true, locale: tr })} ·
          Yapay zeka destekli içerik
        </ThemedText>
      </ThemedSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 12, gap: 6 },
  category: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  title: { fontSize: 17, fontWeight: "700", lineHeight: 22 },
  summary: { fontSize: 14, lineHeight: 20 },
  meta: { fontSize: 12, marginTop: 4 },
});
