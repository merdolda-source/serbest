import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { ThemedView } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";

export function LoadingView() {
  const { colors } = useTheme();
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
});
