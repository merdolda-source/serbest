import { useCallback, useRef } from "react";
import { createInterstitialAd } from "@/services/adsService";
import { AD_FREQUENCY } from "@/constants/theme";

/**
 * Her N sekme değişiminde bir geçiş reklamı gösterir (varsayılan N=3).
 * Reklam her gösterimden sonra önceden yüklenir, böylece bir sonraki
 * eşiğe gelindiğinde gecikme olmadan gösterilebilir.
 */
export function useTabAdCounter() {
  const switchCountRef = useRef(0);
  const adRef = useRef(createInterstitialAd());

  const registerTabSwitch = useCallback(() => {
    switchCountRef.current += 1;
    if (switchCountRef.current >= AD_FREQUENCY.tabSwitchesPerInterstitial) {
      switchCountRef.current = 0;
      adRef.current.showIfReady();
      adRef.current.destroy();
      adRef.current = createInterstitialAd();
    }
  }, []);

  return { registerTabSwitch };
}
