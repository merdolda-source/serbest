import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText, ThemedView } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorView({ message = "Bir şeyler ters gitti.", onRetry }: ErrorViewProps) {
  const { colors } = useTheme();
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Hata oluştu</ThemedText>
      <ThemedText muted style={styles.message}>
        {message}
      </ThemedText>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <ThemedText style={styles.buttonText}>Tekrar Dene</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 18, fontWeight: "700" },
  message: { textAlign: "center" },
  button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  buttonText: { color: "#FFFFFF", fontWeight: "600" },
});
