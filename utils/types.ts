export type CategorySlug = "haber" | "spor" | "ekonomi" | "magazin";

export interface Category {
  slug: CategorySlug;
  label: string;
}

export type ContentStatus = "draft" | "published" | "removed";

export interface Content {
  id: string;
  category: CategorySlug;
  title: string;
  body: string;
  summary: string;
  imageUrl?: string;
  sourceTitle: string;
  sourceUrl?: string;
  aiGenerated: true;
  status: ContentStatus;
  viewCount: number;
  commentCount: number;
  createdAt: number;
  publishedAt: number;
}

export type CommentStatus = "visible" | "flagged" | "removed";

export interface Comment {
  id: string;
  contentId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  text: string;
  status: CommentStatus;
  likeCount: number;
  replyCount: number;
  createdAt: number;
}

export interface AppUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  createdAt: number;
  theme: "dark" | "light";
  notificationsEnabled: boolean;
  pushToken?: string;
  commentCountLastMinute: number;
  banned: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: CategorySlug;
  contentId: string;
  createdAt: number;
  /** Sunucuda tutulmaz; users/{uid}/readNotifications alt koleksiyonundan türetilir. */
  read: boolean;
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };
