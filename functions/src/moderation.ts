import { COMMENT_MAX_LENGTH, COMMENT_MIN_LENGTH } from "./config";

const BANNED_PATTERNS: RegExp[] = [
  /\b(bahis|casino|bet\d|kazandiran|takipci\s*satin\s*al)\b/i,
  /(.)\1{7,}/, // aynı karakterin 8+ kez tekrarı (ör. "aaaaaaaa")
  /https?:\/\/\S+\s+https?:\/\/\S+/i, // tek mesajda birden fazla link
];

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
}

export function moderateCommentText(rawText: string): ModerationResult {
  const text = rawText.trim();

  if (text.length < COMMENT_MIN_LENGTH) {
    return { allowed: false, reason: "Yorum çok kısa" };
  }
  if (text.length > COMMENT_MAX_LENGTH) {
    return { allowed: false, reason: `Yorum ${COMMENT_MAX_LENGTH} karakteri aşamaz` };
  }

  const upperRatio = text.replace(/[^A-ZÇĞİÖŞÜ]/g, "").length / text.length;
  if (text.length > 12 && upperRatio > 0.7) {
    return { allowed: false, reason: "Aşırı büyük harf kullanımı" };
  }

  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      return { allowed: false, reason: "Spam olarak işaretlendi" };
    }
  }

  return { allowed: true };
}
