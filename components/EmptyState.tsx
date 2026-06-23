import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText, ThemedView } from "@/components/Themed";

export function EmptyState({ message }: { message: string }) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText muted>{message}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
});
