import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, ThemedView } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, initializing } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  if (initializing) return null;

  if (!isLoggedIn) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Giriş yapmanız gerekiyor</ThemedText>
        <ThemedText muted style={styles.subtitle}>
          Bu ekranı görüntülemek için hesabınıza giriş yapın.
        </ThemedText>
        <Pressable
          onPress={() => router.push("/auth/login")}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <ThemedText style={styles.buttonText}>Giriş Yap</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { textAlign: "center" },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, marginTop: 12 },
  buttonText: { color: "#FFFFFF", fontWeight: "700" },
});
