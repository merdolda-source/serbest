import { useEffect, useState } from "react";
import JailMonkey from "jail-monkey";

export interface SecurityCheckResult {
  blocked: boolean;
  reason?: string;
}

/**
 * Root/jailbreak tespiti: bot/sahtekarlık koruma katmanlarından biri.
 * Sonuç kesindir (false-positive riskine karşı sadece güçlü sinyalleri
 * kullanırız: isJailBroken kapsamlı kontrolü zaten root/jailbreak,
 * hooking framework'leri (Frida/Xposed) ve geliştirici modunu kapsar).
 */
export function useSecurityGuard() {
  const [result, setResult] = useState<SecurityCheckResult>({ blocked: false });

  useEffect(() => {
    const isCompromised = JailMonkey.isJailBroken();
    if (isCompromised) {
      setResult({
        blocked: true,
        reason: "Bu cihaz root/jailbreak yapılmış görünüyor. Güvenlik nedeniyle uygulama kullanılamıyor.",
      });
    }
  }, []);

  return result;
}
