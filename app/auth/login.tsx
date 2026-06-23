import React, { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, ThemedView } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { loginWithApple, loginWithEmail, loginWithGoogle } from "@/services/authService";

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Eksik bilgi", "E-posta ve şifre girin.");
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      router.back();
    } catch (err) {
      Alert.alert("Giriş başarısız", err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      if (provider === "google") await loginWithGoogle();
      else await loginWithApple();
      router.back();
    } catch (err) {
      Alert.alert("Giriş başarısız", err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Haberly'e Giriş Yap</ThemedText>

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
        placeholder="Şifre"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
      />

      <Pressable
        onPress={handleEmailLogin}
        disabled={loading}
        style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
      >
        <ThemedText style={styles.primaryButtonText}>Giriş Yap</ThemedText>
      </Pressable>

      <Pressable onPress={() => router.push("/auth/forgot-password")}>
        <ThemedText muted style={styles.link}>
          Şifremi unuttum
        </ThemedText>
      </Pressable>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <Pressable
        onPress={() => handleProviderLogin("google")}
        disabled={loading}
        style={[styles.secondaryButton, { borderColor: colors.border }]}
      >
        <ThemedText>Google ile Giriş Yap</ThemedText>
      </Pressable>

      {Platform.OS === "ios" && (
        <Pressable
          onPress={() => handleProviderLogin("apple")}
          disabled={loading}
          style={[styles.secondaryButton, { borderColor: colors.border }]}
        >
          <ThemedText>Apple ile Giriş Yap</ThemedText>
        </Pressable>
      )}

      <Pressable onPress={() => router.push("/auth/register")}>
        <ThemedText muted style={styles.link}>
          Hesabın yok mu? Kayıt ol
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12, textAlign: "center" },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  primaryButton: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700" },
  secondaryButton: { borderWidth: 1, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  divider: { height: 1, marginVertical: 8 },
  link: { textAlign: "center", marginTop: 8 },
});
