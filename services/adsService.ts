import { Platform } from "react-native";
import {
  AppOpenAd,
  InterstitialAd,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";

const isTestMode = process.env.EXPO_PUBLIC_ADS_TEST_MODE !== "false";

function unitId(envAndroid: string | undefined, envIOS: string | undefined, testId: string) {
  if (isTestMode) return testId;
  const id = Platform.OS === "ios" ? envIOS : envAndroid;
  if (!id) throw new Error("AdMob birim kimliği tanımlı değil (.env kontrol edin)");
  return id;
}

export const AD_UNIT_IDS = {
  appOpen: unitId(
    process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_ANDROID,
    process.env.EXPO_PUBLIC_ADMOB_APP_OPEN_IOS,
    TestIds.APP_OPEN
  ),
  interstitial: unitId(
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ANDROID,
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_IOS,
    TestIds.INTERSTITIAL
  ),
  native: unitId(
    process.env.EXPO_PUBLIC_ADMOB_NATIVE_ANDROID,
    process.env.EXPO_PUBLIC_ADMOB_NATIVE_IOS,
    TestIds.NATIVE
  ),
  banner: unitId(
    process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID,
    process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS,
    TestIds.BANNER
  ),
};

/** Açılış reklamı: uygulama her açılışında bir kez gösterilir. */
export function createAppOpenAd() {
  const ad = AppOpenAd.createForAdRequest(AD_UNIT_IDS.appOpen);
  return new Promise<void>((resolve) => {
    let shown = false;
    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      if (!shown) {
        shown = true;
        ad.show();
      }
    });
    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      resolve();
    });
    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
      resolve();
    });
    ad.load();
    // Reklam belirli bir sürede yüklenmezse akışı bloklamadan devam et.
    setTimeout(resolve, 4000);
  });
}

/** Geçiş reklamı: her 3 sekme değişiminde bir gösterilir (bkz. useTabAdCounter). */
export function createInterstitialAd() {
  const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial);
  let loaded = false;

  const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
    loaded = true;
  });
  ad.load();

  return {
    showIfReady: () => {
      if (loaded) ad.show();
    },
    destroy: () => unsubscribeLoaded(),
  };
}
