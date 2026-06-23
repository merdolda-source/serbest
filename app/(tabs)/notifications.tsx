import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { ThemedSurface, ThemedText, ThemedView } from "@/components/Themed";
import { RequireAuth } from "@/components/RequireAuth";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import {
  markNotificationRead,
  subscribeToNotificationsFeed,
  subscribeToReadIds,
} from "@/services/notificationService";
import { CATEGORIES } from "@/constants/categories";
import type { AppNotification } from "@/utils/types";

function NotificationsList() {
  const { colors } = useTheme();
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Omit<AppNotification, "read">[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => subscribeToNotificationsFeed(setItems), []);
  useEffect(() => {
    if (!firebaseUser) return;
    return subscribeToReadIds(firebaseUser.uid, setReadIds);
  }, [firebaseUser]);

  if (items.length === 0) {
    return <EmptyState message="Henüz bildirim yok." />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      renderItem={({ item }) => {
        const isRead = readIds.has(item.id);
        const categoryLabel = CATEGORIES.find((c) => c.slug === item.category)?.label;
        return (
          <Pressable
            onPress={() => {
              if (firebaseUser) markNotificationRead(firebaseUser.uid, item.id);
              router.push(`/content/${item.contentId}`);
            }}
          >
            <ThemedSurface
              style={[styles.card, { borderColor: isRead ? colors.border : colors.primary }]}
            >
              <ThemedText muted style={[styles.category, { color: colors.primary }]}>
                {categoryLabel}
              </ThemedText>
              <ThemedText style={styles.title}>{item.title}</ThemedText>
              <ThemedText muted numberOfLines={2}>
                {item.body}
              </ThemedText>
              <ThemedText muted style={styles.time}>
                {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: tr })}
              </ThemedText>
            </ThemedSurface>
          </Pressable>
        );
      }}
    />
  );
}

export default function NotificationsScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <RequireAuth>
        <NotificationsList />
      </RequireAuth>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 14, borderWidth: 1, gap: 4 },
  category: { fontSize: 11, fontWeight: "800" },
  title: { fontSize: 15, fontWeight: "700" },
  time: { fontSize: 11, marginTop: 4 },
});
