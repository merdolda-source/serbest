# HaberSosyal

Haber, Spor, Ekonomi ve Magazin içerikleri sunan; kullanıcıların yorum
yapıp birbirine cevap verebildiği React Native (Expo) mobil uygulaması.
İçerikler RSS başlıklarından Anthropic (Claude) ile özgün Türkçe metin
olarak üretilir ve Firebase Cloud Functions üzerinden Firestore'a yazılır.

## Mimari Özeti

- **Client**: Expo + Expo Router, `@react-native-firebase` (native SDK —
  firebase-js-sdk DEĞİL; gerçek offline persistence, native FCM ve native
  Google/Apple Sign-In için).
- **Backend**: Firebase Cloud Functions (Node 20, TypeScript). Anthropic API
  anahtarı SADECE burada, Secret Manager üzerinden okunur.
- **Veritabanı**: Firestore. `contents` ve `comments` koleksiyonlarına
  client'tan DOĞRUDAN yazma kapalıdır (bkz. `firestore.rules`) — hız
  limiti, IP takibi ve spam filtresi yalnızca sunucuda uygulanabildiği için
  tüm yazma işlemleri callable Cloud Functions üzerinden yapılır.
- **Reklam**: `react-native-google-mobile-ads`, test modunda başlar.
- AdMob/Apple Sign-In/Google Sign-In native modül gerektirdiğinden bu proje
  **Expo Go ile çalışmaz**; EAS dev client veya `expo prebuild` + native
  build gerekir.

## Kurulum

```bash
npm install
cp .env.example .env          # Google web client ID ve AdMob ID'lerini doldurun
cp functions/.env.example functions/.env
cd functions && npm install && cd ..
```

### 1) Firebase projesi

1. [Firebase Console](https://console.firebase.google.com)'da proje oluşturun.
2. **Authentication** > Sign-in method: Email/Password, Google, Apple'ı açın.
   - Authentication > Settings > **"One account per email address"** seçeneğini
     açın (tek hesap/e-posta kuralı için).
3. Android app ekleyin (`com.habersosyal.app`) → `google-services.json`'ı
   repo köküne koyun.
4. iOS app ekleyin (`com.habersosyal.app`) → `GoogleService-Info.plist`'i
   repo köküne koyun.
5. **Firestore**'u oluşturun, ardından:
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```
6. **App Check**'i etkinleştirin (Android: Play Integrity, iOS: App Attest /
   DeviceCheck). Bot korumasının ilk savunma hattıdır.
7. **Cloud Messaging**: APNs anahtarınızı (iOS push için) Firebase Console'a
   yükleyin.

### 2) Anthropic API anahtarı (SADECE sunucu tarafı)

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
```

Bu anahtar hiçbir zaman client kodunda, `.env` dosyasında veya repo'da
bulunmaz — sadece Secret Manager'da tutulur ve `functions/src/anthropicClient.ts`
tarafından `defineSecret` ile okunur.

### 3) Cloud Functions deploy

```bash
firebase deploy --only functions
```

`ingestRssFeeds` her 30 dakikada bir çalışır, kategorilere göre tanımlı RSS
feed'lerini çeker, yeni başlıkları Claude'a gönderip Firestore'a yazar.
`functions/src/config.ts` içindeki `RSS_SOURCES`'ı kendi lisanslı/izinli
kaynaklarınızla değiştirin (örnek URL'ler yer tutucudur).

### 4) Google / Apple Sign-In

- Google: Firebase Console > Authentication > Sign-in method > Google'dan
  **Web client ID**'yi alıp `.env` → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`'ye,
  iOS reversed client ID'yi `app.json` →
  `plugins > @react-native-google-signin/google-signin > iosUrlScheme`'e yazın.
- Apple: Apple Developer hesabınızda "Sign in with Apple" capability'sini
  açın (zaten `app.json` → `ios.usesAppleSignIn: true`).

### 5) AdMob

- Gerçek AdMob hesabı oluşturup uygulama + reklam birimi ID'lerini alın.
- `.env` dosyasındaki `EXPO_PUBLIC_ADMOB_*` değerlerini doldurun,
  `EXPO_PUBLIC_ADS_TEST_MODE=false` yapın (yayına almadan önce!).
- Google Play / App Store inceleme sürecinde test ID'leri ile gönderim
  YAPMAYIN — bu politika ihlalidir.

### 6) Çalıştırma (native build gerekir)

```bash
npx expo prebuild
npx expo run:android   # veya: npx expo run:ios
```

veya EAS ile:

```bash
eas build --profile development --platform android
```

## Güvenlik Notları

- **Anthropic API anahtarı**: yalnızca `functions/src/anthropicClient.ts`
  içinde, Secret Manager'dan okunur. Hiçbir client kodu erişemez.
- **App Check**: Firestore/Functions çağrılarının sahte istemcilerden
  gelmediğini doğrular (`services/firebase.ts` → `initAppCheck`).
- **Root/Jailbreak tespiti**: `hooks/useSecurityGuard.ts` (jail-monkey),
  tespit edilirse uygulama `SecurityBlockScreen` ile engellenir.
- **Ağ güvenliği**: Android'de cleartext trafik tamamen kapalı
  (`plugins/withAndroidNetworkSecurity.js` → `network_security_config.xml`),
  iOS'ta `NSAllowsArbitraryLoads: false` (ATS).
- **SSL Pinning / Certificate Transparency hakkında önemli not**: Bu
  uygulamanın %100 ağ trafiği Firebase/Google Play Services SDK'ları
  üzerinden gider (Firestore, Auth, Functions, FCM, AdMob, Google Sign-In).
  Google, kendi uç noktaları için sertifika pinning yapılmamasını açıkça
  tavsiye eder; çünkü sertifikalar habersiz döndürülür ve pin'lenmiş bir
  uygulama güncelleme yayınlanana kadar tamamen kırılabilir. Sertifika
  şeffaflığı ve geçerlilik kontrolü bu uç noktalar için zaten OS düzeyinde
  (Apple ATS / Android Conscrypt) uygulanır. **Eğer ileride kendi backend
  domain'inizi eklerseniz** (örn. `api.habersosyal.com`), o domain için
  `react-native-ssl-pinning` veya native `NSURLSession`/`OkHttp`
  pinning'i SADECE o domain'e uygulayın.
- **Bot koruması**: e-posta onayı zorunlu, tek hesap/e-posta (Firebase Auth
  ayarı), yorum hız limiti (`functions/src/rateLimit.ts`, dakikada 5),
  IP takibi (`functions/src/ipTracking.ts`), spam filtresi
  (`functions/src/moderation.ts`).

## Eksikler / Sizin Tamamlamanız Gerekenler

Bunlar kod ile çözülemez, sizin Firebase/Apple/Google/AdMob hesaplarınızla
yapmanız gereken adımlardır:

1. Gerçek Firebase projesi + `google-services.json` / `GoogleService-Info.plist`
2. Gerçek AdMob hesabı ve reklam birimi ID'leri
3. Apple Developer hesabı (Sign in with Apple capability, App Store Connect kaydı)
4. Google Cloud Console OAuth client ID'leri (Google Sign-In)
5. Lisanslı/izinli RSS kaynak URL'leri (örnek URL'ler yer tutucudur,
   telif/lisans uyumluluğunu siz doğrulamalısınız)
6. Anthropic API anahtarı (`firebase functions:secrets:set ANTHROPIC_API_KEY`)
7. Gerçek uygulama ikonu/splash görselleri (`assets/` altında şu an
   placeholder görseller var)
8. EAS hesabı / `app.json` → `extra.eas.projectId`
9. App Store / Play Store gizlilik politikası, KVKK/GDPR aydınlatma metni
   (yorum sisteminde IP takibi yapıldığı için KVKK kapsamında bildirim
   yapılması gerekir)
10. RSS ile üretilen içeriklerin "yapay zeka destekli" ibaresi App
    Store/Play Store içerik politikalarına göre incelenmeli (her ikisi de
    AI-üretilmiş içerik için ek inceleme/onay süreci uygulayabilir)

## Klasör Yapısı

```
/app          Expo Router ekranları
/components   Yeniden kullanılabilir bileşenler
/functions    Firebase Cloud Functions (RSS->Claude, yorum güvenliği, bildirim)
/hooks        Custom hook'lar (auth, tema, içerik/yorum subscription, güvenlik)
/services     Firebase/Auth/İçerik/Yorum/Bildirim/Reklam servisleri
/utils        Paylaşılan tipler
/constants    Tema ve kategori sabitleri
/plugins      Özel Expo config plugin (Android ağ güvenliği)
/assets       İkon/splash (şu an placeholder)
```

## Test

```bash
npm run typecheck
npm run lint
cd functions && npm run build   # Cloud Functions derleme kontrolü
```

UI henüz gerçek bir cihaz/emulator + gerçek Firebase projesiyle manuel test
edilmedi (native build + gerçek Firebase config gerektirir).
