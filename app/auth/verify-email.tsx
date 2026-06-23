import React, { useState } from "react";
import { Alert, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, ThemedView } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { refreshEmailVerifiedStatus, resendVerificationEmail } from "@/services/authService";

export default function VerifyEmailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { firebaseUser, isEmailVerified } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendVerificationEmail();
      Alert.alert("Gönderildi", "Onay e-postası yeniden gönderildi.");
    } catch (err) {
      Alert.alert("Hata", err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    setLoading(true);
    try {
      const verified = await refreshEmailVerifiedStatus();
      if (verified) {
        router.back();
      } else {
        Alert.alert("Henüz onaylanmadı", "E-postanızdaki bağlantıya tıkladıktan sonra tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isEmailVerified) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>E-postanız zaten onaylı ✓</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>E-posta Onayı Gerekli</ThemedText>
      <ThemedText muted style={styles.subtitle}>
        {firebaseUser?.email} adresine gönderdiğimiz bağlantıya tıklayarak hesabınızı onaylayın.
        Yorum yapmak ve beğenmek için bu adım zorunludur.
      </ThemedText>

      <Pressable
        onPress={handleCheck}
        disabled={loading}
        style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
      >
        <ThemedText style={styles.primaryButtonText}>Onayladım, Kontrol Et</ThemedText>
      </Pressable>

      <Pressable onPress={handleResend} disabled={loading}>
        <ThemedText muted style={styles.link}>
          E-postayı tekrar gönder
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center" },
  subtitle: { textAlign: "center", lineHeight: 20 },
  primaryButton: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700" },
  link: { textAlign: "center", marginTop: 12 },
});
