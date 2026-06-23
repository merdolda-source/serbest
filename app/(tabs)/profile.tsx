import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Switch } from "react-native";
import { useRouter } from "expo-router";
import { ThemedSurface, ThemedText, ThemedView } from "@/components/Themed";
import { RequireAuth } from "@/components/RequireAuth";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/authService";
import { registerForPushNotifications, unregisterPushNotifications } from "@/services/notificationService";
import firestore from "@react-native-firebase/firestore";

function ProfileContent() {
  const { colors, themeName, toggleTheme } = useTheme();
  const { firebaseUser, appUser } = useAuth();
  const router = useRouter();
  const [updatingNotifications, setUpdatingNotifications] = useState(false);

  const handleToggleTheme = () => {
    toggleTheme();
    if (firebaseUser) {
      firestore()
        .collection("users")
        .doc(firebaseUser.uid)
        .update({ theme: themeName === "dark" ? "light" : "dark" })
        .catch(() => undefined);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (!firebaseUser) return;
    setUpdatingNotifications(true);
    try {
      if (value) {
        const granted = await registerForPushNotifications(firebaseUser.uid);
        if (!granted) {
          Alert.alert("İzin gerekli", "Bildirim almak için izin vermeniz gerekiyor.");
          return;
        }
      } else {
        await unregisterPushNotifications();
      }
      await firestore().collection("users").doc(firebaseUser.uid).update({
        notificationsEnabled: value,
      });
    } finally {
      setUpdatingNotifications(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Çıkış yap", "Hesabınızdan çıkmak istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "Çıkış Yap", style: "destructive", onPress: () => logout() },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedSurface style={styles.card}>
        <ThemedText style={styles.name}>{firebaseUser?.displayName ?? "Kullanıcı"}</ThemedText>
        <ThemedText muted>{firebaseUser?.email}</ThemedText>
        {!firebaseUser?.emailVerified && (
          <Pressable onPress={() => router.push("/auth/verify-email")}>
            <ThemedText style={[styles.verifyLink, { color: colors.danger }]}>
              E-posta onaylanmadı — onaylamak için dokunun
            </ThemedText>
          </Pressable>
        )}
      </ThemedSurface>

      <ThemedSurface style={styles.row}>
        <ThemedText>Koyu Tema</ThemedText>
        <Switch value={themeName === "dark"} onValueChange={handleToggleTheme} />
      </ThemedSurface>

      <ThemedSurface style={styles.row}>
        <ThemedText>Bildirimler</ThemedText>
        <Switch
          value={appUser?.notificationsEnabled ?? false}
          onValueChange={handleToggleNotifications}
          disabled={updatingNotifications}
        />
      </ThemedSurface>

      <Pressable onPress={handleLogout} style={[styles.logoutButton, { borderColor: colors.danger }]}>
        <ThemedText style={{ color: colors.danger, fontWeight: "700" }}>Çıkış Yap</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

export default function ProfileScreen() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: { borderRadius: 12, padding: 16, gap: 4 },
  name: { fontSize: 18, fontWeight: "700" },
  verifyLink: { marginTop: 8, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 12, padding: 16 },
  logoutButton: { borderWidth: 1, borderRadius: 10, padding: 14, alignItems: "center", marginTop: 8 },
});
