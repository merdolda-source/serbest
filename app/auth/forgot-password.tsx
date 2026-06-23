import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, ThemedView } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { sendPasswordReset } from "@/services/authService";

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert("Eksik bilgi", "E-posta adresinizi girin.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      Alert.alert("Gönderildi", "Şifre sıfırlama bağlantısı e-postanıza gönderildi.");
      router.back();
    } catch (err) {
      Alert.alert("Hata", err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Şifremi Unuttum</ThemedText>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="E-posta"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
      />
      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
      >
        <ThemedText style={styles.primaryButtonText}>Sıfırlama Bağlantısı Gönder</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  primaryButton: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700" },
});
