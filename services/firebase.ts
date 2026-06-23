import firebaseApp from "@react-native-firebase/app";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import functions from "@react-native-firebase/functions";
import messaging from "@react-native-firebase/messaging";
import analytics from "@react-native-firebase/analytics";
import appCheck from "@react-native-firebase/app-check";

/**
 * @react-native-firebase native modülleri kullanılıyor (firebase-js-sdk değil).
 * Sebep: gerçek offline persistence (native, otomatik), native FCM ve native
 * Google/Apple Sign-In entegrasyonunu kolaylaştırması.
 * Config JS tarafında değil; google-services.json / GoogleService-Info.plist
 * native dosyalarından okunur. Bu dosyada hiçbir gizli anahtar yoktur.
 */

firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
});

/** Bot korumasının ilk savunma hattı: sahte/otomasyon istemcilerin
 * Firestore ve Cloud Functions'a erişimini App Check ile sınırlar. */
export async function initAppCheck() {
  await appCheck().initializeAppCheck({
    provider: appCheck.newReactNativeFirebaseAppCheckProvider(),
    isTokenAutoRefreshEnabled: true,
  });
}

const FUNCTIONS_REGION = "europe-west1";

export function callable<Req = unknown, Res = unknown>(name: string) {
  return functions(firebaseApp(), FUNCTIONS_REGION).httpsCallable<Req, Res>(name);
}

export { firebaseApp, auth, firestore, functions, messaging, analytics, appCheck };
