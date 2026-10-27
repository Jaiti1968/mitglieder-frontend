import { useCallback, useEffect, useRef, useState } from "react";

const VALID_ENVIRONMENTS = ["LOCAL", "DEV", "PROD"];

export default function useSystemInfo() {
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const mountedRef = useRef(false);
  const requestRef = useRef(null);

  const refresh = useCallback(async () => {
    // Einen noch laufenden Abruf abbrechen.
    requestRef.current?.abort();

    const controller = new AbortController();
    requestRef.current = controller;

    setRefreshing(true);
    setError(false);

    try {
      const response = await fetch("/api/system/info", {
        credentials: "include",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Systeminformationen nicht verfügbar");
      }

      const data = await response.json();

      const environment = VALID_ENVIRONMENTS.includes(data.environment)
        ? data.environment
        : null;

      if (!environment) {
        throw new Error("Ungültige Laufzeitumgebung");
      }

      if (!mountedRef.current || controller.signal.aborted) {
        return;
      }

      setSystemInfo({
        environment,
        backendVersion: data.backendVersion ?? null,
        buildTime: data.buildTime ?? null,
        activeProfiles: Array.isArray(data.activeProfiles)
          ? data.activeProfiles
          : [],
      });

      setLastUpdated(new Date());
      setError(false);
    } catch (err) {
      if (controller.signal.aborted || !mountedRef.current) {
        return;
      }

      // Bereits bekannte Informationen bleiben erhalten,
      // werden aber durch error als nicht aktuell gekennzeichnet.
      setError(true);
    } finally {
      if (mountedRef.current && !controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();

    return () => {
      mountedRef.current = false;
      requestRef.current?.abort();
    };
  }, [refresh]);

  return {
    systemInfo,
    loading,
    refreshing,
    error,
    lastUpdated,
    refresh,
  };
}
