import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import {
  NativeAd,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaView,
} from "react-native-google-mobile-ads";
import { ThemedSurface, ThemedText } from "@/components/Themed";
import { useTheme } from "@/hooks/useTheme";
import { AD_UNIT_IDS } from "@/services/adsService";

export function NativeAdCard() {
  const { colors } = useTheme();
  const [ad, setAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    let mounted = true;
    NativeAd.createForAdRequest(AD_UNIT_IDS.native)
      .then((loaded) => {
        if (mounted) setAd(loaded);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
      ad?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ad) return null;

  return (
    <NativeAdView nativeAd={ad} style={styles.wrapper}>
      <ThemedSurface style={styles.card}>
        <ThemedText muted style={[styles.sponsored, { color: colors.primary }]}>
          SPONSORLU
        </ThemedText>
        <NativeMediaView style={styles.media} />
        <NativeAsset assetType={NativeAssetType.HEADLINE}>
          <ThemedText style={styles.headline}>{ad.headline}</ThemedText>
        </NativeAsset>
        {ad.body ? (
          <NativeAsset assetType={NativeAssetType.BODY}>
            <ThemedText muted numberOfLines={2}>
              {ad.body}
            </ThemedText>
          </NativeAsset>
        ) : null}
      </ThemedSurface>
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 12 },
  card: { borderRadius: 12, padding: 16, gap: 8 },
  sponsored: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  media: { width: "100%", height: 160, borderRadius: 8 },
  headline: { fontSize: 16, fontWeight: "700" },
});
