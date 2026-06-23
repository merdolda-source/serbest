import firestore from "@react-native-firebase/firestore";
import messaging from "@react-native-firebase/messaging";
import { CATEGORIES } from "@/constants/categories";
import type { AppNotification } from "@/utils/types";

export function subscribeToNotificationsFeed(
  onChange: (items: Omit<AppNotification, "read">[]) => void
) {
  return firestore()
    .collection("notificationsFeed")
    .orderBy("createdAt", "desc")
    .limit(50)
    .onSnapshot((snap) =>
      onChange(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Omit<AppNotification, "read">)))
    );
}

export function subscribeToReadIds(uid: string, onChange: (ids: Set<string>) => void) {
  return firestore()
    .collection("users")
    .doc(uid)
    .collection("readNotifications")
    .onSnapshot((snap) => onChange(new Set(snap.docs.map((d) => d.id))));
}

export async function markNotificationRead(uid: string, notificationId: string) {
  await firestore()
    .collection("users")
    .doc(uid)
    .collection("readNotifications")
    .doc(notificationId)
    .set({ readAt: Date.now() });
}

export async function registerForPushNotifications(uid: string) {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (!enabled) return false;

  const token = await messaging().getToken();
  await firestore().collection("users").doc(uid).update({ pushToken: token });

  await Promise.all(CATEGORIES.map((c) => messaging().subscribeToTopic(`category_${c.slug}`)));
  return true;
}

export async function unregisterPushNotifications() {
  await Promise.all(CATEGORIES.map((c) => messaging().unsubscribeFromTopic(`category_${c.slug}`)));
}
