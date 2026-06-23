import auth, { type FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

/**
 * users/{uid} dokümanını oluşturur/günceller. "Tek hesap per e-posta" kuralı
 * esas olarak Firebase Auth tarafından (Authentication > Settings > One
 * account per email address) sağlanır; burada sadece profil verisini senkronlar.
 */
async function syncUserDocument(user: FirebaseAuthTypes.User | null) {
  if (!user) return;
  const ref = firestore().collection("users").doc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: firestore.FieldValue.serverTimestamp(),
      theme: "dark",
      notificationsEnabled: true,
      commentCountLastMinute: 0,
      banned: false,
    });
  } else {
    await ref.update({
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      photoURL: user.photoURL,
    });
  }
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const credential = await auth().createUserWithEmailAndPassword(email, password);
  await credential.user.updateProfile({ displayName });
  await credential.user.sendEmailVerification();
  await syncUserDocument(credential.user);
  return credential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await auth().signInWithEmailAndPassword(email, password);
  await syncUserDocument(credential.user);
  return credential.user;
}

export async function resendVerificationEmail() {
  const user = auth().currentUser;
  if (!user) throw new Error("Oturum açık değil");
  await user.sendEmailVerification();
}

export async function refreshEmailVerifiedStatus() {
  const user = auth().currentUser;
  if (!user) return false;
  await user.reload();
  await syncUserDocument(auth().currentUser);
  return auth().currentUser?.emailVerified ?? false;
}

export async function sendPasswordReset(email: string) {
  await auth().sendPasswordResetEmail(email);
}

export async function loginWithGoogle() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { idToken } = await GoogleSignin.signIn();
  if (!idToken) throw new Error("Google girişinden token alınamadı");
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  const credential = await auth().signInWithCredential(googleCredential);
  await syncUserDocument(credential.user);
  return credential.user;
}

export async function loginWithApple() {
  if (Platform.OS !== "ios") {
    throw new Error("Apple ile giriş yalnızca iOS'ta kullanılabilir");
  }
  const appleResponse = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  if (!appleResponse.identityToken) {
    throw new Error("Apple girişinden token alınamadı");
  }
  const appleCredential = auth.AppleAuthProvider.credential(
    appleResponse.identityToken,
    appleResponse.authorizationCode ?? undefined
  );
  const credential = await auth().signInWithCredential(appleCredential);
  if (appleResponse.fullName?.givenName && !credential.user.displayName) {
    const name = [appleResponse.fullName.givenName, appleResponse.fullName.familyName]
      .filter(Boolean)
      .join(" ");
    await credential.user.updateProfile({ displayName: name });
  }
  await syncUserDocument(credential.user);
  return credential.user;
}

export async function logout() {
  const wasGoogle = await GoogleSignin.isSignedIn().catch(() => false);
  if (wasGoogle) {
    await GoogleSignin.signOut().catch(() => undefined);
  }
  await auth().signOut();
}

export function subscribeToAuthState(
  callback: (user: FirebaseAuthTypes.User | null) => void
) {
  return auth().onAuthStateChanged(callback);
}
