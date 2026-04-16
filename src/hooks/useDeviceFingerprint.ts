import { useEffect, useState } from "react";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { supabase } from "@/integrations/supabase/client";

export function useDeviceFingerprint(userId?: string) {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [ip, setIp] = useState<string | null>(null);
  const [duplicateDetected, setDuplicateDetected] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fpHash = result.visitorId;
        setFingerprint(fpHash);

        // Get IP
        let ipAddr: string | null = null;
        try {
          const res = await fetch("https://api.ipify.org?format=json");
          const data = await res.json();
          ipAddr = data.ip;
          setIp(ipAddr);
        } catch {
          // IP fetch failed, continue without it
        }

        if (!userId || cancelled) return;
        setChecking(true);

        // Check for duplicates using the DB function
        const { data: dupes } = await supabase.rpc("check_device_duplicate", {
          _fingerprint: fpHash,
          _ip: ipAddr || "",
        });

        if (dupes && dupes.length > 0) {
          setDuplicateDetected(true);
          setChecking(false);
          return;
        }

        // Store fingerprint for this user (upsert-like: ignore conflict)
        await supabase.from("device_fingerprints").upsert(
          {
            user_id: userId,
            fingerprint: fpHash,
            ip_address: ipAddr,
            user_agent: navigator.userAgent,
          },
          { onConflict: "fingerprint" }
        );

        setChecking(false);
      } catch (err) {
        console.error("Fingerprint error:", err);
        setChecking(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [userId]);

  return { fingerprint, ip, duplicateDetected, checking };
}
