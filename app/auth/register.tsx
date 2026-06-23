import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, ThemedView } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { registerWithEmail } from "@/services/authService";

export default function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!displayName.trim() || !email.trim() || password.length < 6) {
      Alert.alert("Eksik bilgi", "Ad, e-posta ve en az 6 karakterli şifre girin.");
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email.trim(), password, displayName.trim());
      router.replace("/auth/verify-email");
    } catch (err) {
      Alert.alert("Kayıt başarısız", err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Hesap Oluştur</ThemedText>

      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Ad Soyad"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
      />
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="E-posta"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Şifre (en az 6 karakter)"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
      />

      <Pressable
        onPress={handleRegister}
        disabled={loading}
        style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
      >
        <ThemedText style={styles.primaryButtonText}>Kayıt Ol</ThemedText>
      </Pressable>

      <ThemedText muted style={styles.note}>
        Kayıt sonrası e-postanıza gönderilen onay bağlantısına tıklamanız gerekir.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12, textAlign: "center" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  primaryButton: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700" },
  note: { textAlign: "center", marginTop: 12, fontSize: 12 },
});
