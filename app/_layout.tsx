import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";
import { initAppCheck } from "@/services/firebase";
import { createAppOpenAd } from "@/services/adsService";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootStack() {
  const { themeName } = useTheme();
  return (
    <>
      <StatusBar style={themeName === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="content/[id]" options={{ headerShown: true, title: "" }} />
        <Stack.Screen name="auth/login" options={{ headerShown: true, title: "Giriş Yap" }} />
        <Stack.Screen name="auth/register" options={{ headerShown: true, title: "Kayıt Ol" }} />
        <Stack.Screen
          name="auth/verify-email"
          options={{ headerShown: true, title: "E-posta Onayı" }}
        />
        <Stack.Screen
          name="auth/forgot-password"
          options={{ headerShown: true, title: "Şifremi Unuttum" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      await initAppCheck().catch((err) => console.warn("App Check başlatılamadı:", err));
      await createAppOpenAd().catch(() => undefined);
      setReady(true);
      await SplashScreen.hideAsync();
    }
    bootstrap();
  }, []);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </ThemeProvider>
  );
}
