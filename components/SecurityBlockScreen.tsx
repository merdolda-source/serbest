import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText, ThemedView } from "@/components/Themed";

export function SecurityBlockScreen({ reason }: { reason: string }) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Güvenlik Uyarısı</ThemedText>
      <ThemedText muted style={styles.message}>
        {reason}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 },
  title: { fontSize: 20, fontWeight: "800" },
  message: { textAlign: "center", lineHeight: 20 },
});
