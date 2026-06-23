import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { postComment } from "@/services/commentService";
import { useRouter } from "expo-router";

interface CommentInputProps {
  contentId: string;
  parentId?: string | null;
  placeholder?: string;
  onPosted?: () => void;
}

export function CommentInput({
  contentId,
  parentId = null,
  placeholder = "Yorumunuzu yazın...",
  onPosted,
}: CommentInputProps) {
  const { colors } = useTheme();
  const { isLoggedIn, isEmailVerified } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFocus = () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    if (!isEmailVerified) {
      Alert.alert("E-posta onayı gerekli", "Yorum yapmadan önce e-postanızı onaylamalısınız.");
      router.push("/auth/verify-email");
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await postComment({ contentId, parentId, text: trimmed });
      setText("");
      onPosted?.();
    } catch (err) {
      Alert.alert("Yorum gönderilemedi", err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.row}>
      <TextInput
        value={text}
        onChangeText={setText}
        onFocus={handleFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        multiline
        maxLength={1000}
      />
      <Pressable
        onPress={handleSubmit}
        disabled={submitting || !text.trim()}
        style={[styles.button, { backgroundColor: colors.primary, opacity: submitting || !text.trim() ? 0.5 : 1 }]}
      >
        <ThemedText style={styles.buttonText}>Gönder</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, maxHeight: 100 },
  button: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  buttonText: { color: "#FFFFFF", fontWeight: "700" },
});
