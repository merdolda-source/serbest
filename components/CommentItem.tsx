import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/Themed";
import { CommentInput } from "@/components/CommentInput";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteComment,
  subscribeToOwnLike,
  subscribeToReplies,
  toggleCommentLike,
} from "@/services/commentService";
import { AD_FREQUENCY } from "@/constants/theme";
import { NativeAdCard } from "@/components/NativeAdCard";
import type { Comment } from "@/utils/types";

interface CommentItemProps {
  comment: Comment;
  contentId: string;
  isReply?: boolean;
}

export function CommentItem({ comment, contentId, isReply = false }: CommentItemProps) {
  const { colors } = useTheme();
  const { isLoggedIn, firebaseUser, isEmailVerified } = useAuth();
  const [liked, setLiked] = useState(false);
  const [replying, setReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);

  useEffect(() => {
    if (!isLoggedIn || !firebaseUser) {
      setLiked(false);
      return;
    }
    return subscribeToOwnLike(comment.id, firebaseUser.uid, setLiked);
  }, [comment.id, isLoggedIn, firebaseUser]);

  useEffect(() => {
    if (!showReplies) return;
    return subscribeToReplies(comment.id, setReplies);
  }, [comment.id, showReplies]);

  const handleLike = async () => {
    if (!isLoggedIn || !isEmailVerified) {
      Alert.alert("Giriş gerekli", "Yorum beğenmek için giriş yapıp e-postanızı onaylamalısınız.");
      return;
    }
    try {
      await toggleCommentLike(comment.id);
    } catch (err) {
      Alert.alert("İşlem başarısız", err instanceof Error ? err.message : "Bilinmeyen hata");
    }
  };

  const handleDelete = () => {
    Alert.alert("Yorumu sil", "Bu yorumu silmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => deleteComment(comment.id).catch(() => undefined),
      },
    ]);
  };

  const isOwnComment = firebaseUser?.uid === comment.authorId;
  const text = comment.status === "removed" ? "[Yorum silindi]" : comment.text;

  return (
    <View style={[styles.container, isReply && styles.replyIndent]}>
      <View style={styles.header}>
        <ThemedText style={styles.author}>{comment.authorName}</ThemedText>
        <ThemedText muted style={styles.time}>
          {formatDistanceToNow(comment.createdAt, { addSuffix: true, locale: tr })}
        </ThemedText>
      </View>
      <ThemedText style={styles.text}>{text}</ThemedText>

      <View style={styles.actions}>
        <Pressable onPress={handleLike} style={styles.actionButton}>
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={16}
            color={liked ? colors.danger : colors.textMuted}
          />
          <ThemedText muted style={styles.actionLabel}>
            {comment.likeCount}
          </ThemedText>
        </Pressable>

        {!isReply && (
          <Pressable onPress={() => setReplying((v) => !v)} style={styles.actionButton}>
            <ThemedText muted style={styles.actionLabel}>
              Cevapla
            </ThemedText>
          </Pressable>
        )}

        {isOwnComment && comment.status !== "removed" && (
          <Pressable onPress={handleDelete} style={styles.actionButton}>
            <ThemedText muted style={styles.actionLabel}>
              Sil
            </ThemedText>
          </Pressable>
        )}
      </View>

      {!isReply && comment.replyCount > 0 && (
        <Pressable onPress={() => setShowReplies((v) => !v)}>
          <ThemedText style={[styles.toggleReplies, { color: colors.primary }]}>
            {showReplies ? "Cevapları gizle" : `${comment.replyCount} cevabı göster`}
          </ThemedText>
        </Pressable>
      )}

      {showReplies &&
        replies.map((reply, index) => (
          <React.Fragment key={reply.id}>
            <CommentItem comment={reply} contentId={contentId} isReply />
            {(index + 1) % AD_FREQUENCY.commentsPerNativeAd === 0 && <NativeAdCard />}
          </React.Fragment>
        ))}

      {replying && !isReply && (
        <View style={styles.replyInput}>
          <CommentInput
            contentId={contentId}
            parentId={comment.id}
            placeholder="Cevabınızı yazın..."
            onPosted={() => {
              setReplying(false);
              setShowReplies(true);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  replyIndent: { marginLeft: 20, borderLeftWidth: 1, borderLeftColor: "#2A2A35", paddingLeft: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  author: { fontWeight: "700", fontSize: 14 },
  time: { fontSize: 12 },
  text: { fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 16, marginTop: 8 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionLabel: { fontSize: 12 },
  toggleReplies: { fontSize: 13, fontWeight: "600", marginTop: 8 },
  replyInput: { marginTop: 8 },
});
