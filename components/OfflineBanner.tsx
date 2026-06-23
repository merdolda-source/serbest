import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const { colors } = useTheme();

  if (isConnected) return null;

  return (
    <ThemedText style={[styles.banner, { backgroundColor: colors.danger }]}>
      Çevrimdışısınız — son görüntülenen içerikler gösteriliyor
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  banner: {
    color: "#FFFFFF",
    textAlign: "center",
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "600",
  },
});
