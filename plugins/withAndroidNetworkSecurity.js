const { withAndroidManifest, withDangerousMod, AndroidConfig } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const NETWORK_SECURITY_CONFIG_XML = `<?xml version="1.0" encoding="utf-8"?>
<!--
  Tüm trafik için TLS zorunlu kılınır (cleartextTrafficPermitted="false").
  Sertifika şeffaflığı (Certificate Transparency) ve geçerlilik doğrulaması
  Android'in sistem güven deposu (Conscrypt) tarafından otomatik uygulanır.
  Bu uygulamanın tüm ağ trafiği Firebase/Google Play Services SDK'ları
  (Firestore, Auth, Functions, FCM, AdMob, Google Sign-In) üzerinden gider;
  Google bu uç noktalar için sertifika pinning YAPILMAMASINI önerir, çünkü
  sertifikalar önceden haber verilmeden döndürülür ve pin'lenmiş bir uygulama
  kalıcı olarak kırılabilir. Kendi backend domain'inizi eklerseniz, sadece o
  domain için <pin-set> tanımlayın.
-->
<network-security-config>
  <base-config cleartextTrafficPermitted="false">
    <trust-anchors>
      <certificates src="system" />
    </trust-anchors>
  </base-config>
  <debug-overrides>
    <trust-anchors>
      <certificates src="system" />
      <certificates src="user" />
    </trust-anchors>
  </debug-overrides>
</network-security-config>
`;

function withAndroidNetworkSecurity(config) {
  config = withDangerousMod(config, [
    "android",
    async (cfg) => {
      const xmlDir = path.join(cfg.modRequest.platformProjectRoot, "app/src/main/res/xml");
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(
        path.join(xmlDir, "network_security_config.xml"),
        NETWORK_SECURITY_CONFIG_XML
      );
      return cfg;
    },
  ]);

  return withAndroidManifest(config, (cfg) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    application.$["android:networkSecurityConfig"] = "@xml/network_security_config";
    return cfg;
  });
}

module.exports = withAndroidNetworkSecurity;
