const { withAndroidManifest, AndroidConfig } = require("@expo/config-plugins");

const META_DATA_FCM_NOTIFICATION_ICON_COLOR =
  "com.google.firebase.messaging.default_notification_color";

/**
 * expo-notifications, ana uygulamaya kendi bildirim rengini
 * (com.google.firebase.messaging.default_notification_color) yazıyor; bu da
 * @react-native-firebase/messaging'in kendi AndroidManifest'inde tanımladığı
 * aynı meta-data ile manifest merge sırasında çakışıyor. tools:replace
 * ekleyerek bizim değerimizin kazanmasını sağlıyoruz.
 */
function withFirebaseMessagingManifestFix(config) {
  return withAndroidManifest(config, (cfg) => {
    AndroidConfig.Manifest.ensureToolsAvailable(cfg.modResults);
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    const item = AndroidConfig.Manifest.findMetaDataItem(
      application,
      META_DATA_FCM_NOTIFICATION_ICON_COLOR
    );
    if (item > -1) {
      application["meta-data"][item].$["tools:replace"] = "android:resource";
    }
    return cfg;
  });
}

module.exports = withFirebaseMessagingManifestFix;
