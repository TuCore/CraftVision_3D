"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  AUTH_SESSION_EVENT,
  LAST_ACTIVE_KEY,
  getAccessToken,
  getLastActiveTimestamp,
  logout,
  markSessionActive,
} from "@/lib/authSession";

const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const IDLE_WARNING_MS = 14 * 60 * 1000;
const ACTIVITY_WRITE_THROTTLE_MS = 15 * 1000;
const CHECK_INTERVAL_MS = 10 * 1000;
const WARNING_TOAST_ID = "auth-idle-warning";

export function useIdleTimeout() {
  const lastWriteRef = useRef(0);
  const warningShownRef = useRef(false);

  useEffect(() => {
    const extendSession = () => {
      if (!getAccessToken()) return;
      const now = Date.now();
      if (now - lastWriteRef.current < ACTIVITY_WRITE_THROTTLE_MS) return;
      lastWriteRef.current = now;
      markSessionActive(now);
      if (warningShownRef.current) {
        warningShownRef.current = false;
        toast.dismiss(WARNING_TOAST_ID);
      }
    };

    const checkIdleState = () => {
      if (!getAccessToken()) {
        warningShownRef.current = false;
        toast.dismiss(WARNING_TOAST_ID);
        return;
      }

      const lastActive = getLastActiveTimestamp();
      if (lastActive === null) {
        markSessionActive();
        return;
      }

      const idleFor = Date.now() - lastActive;
      if (idleFor >= IDLE_TIMEOUT_MS) {
        toast.dismiss(WARNING_TOAST_ID);
        logout("idle");
        return;
      }

      if (idleFor >= IDLE_WARNING_MS && !warningShownRef.current) {
        warningShownRef.current = true;
        toast.warning("Phiên đăng nhập sẽ hết hạn sau 1 phút do không hoạt động.", {
          id: WARNING_TOAST_ID,
          duration: IDLE_TIMEOUT_MS - IDLE_WARNING_MS,
          action: {
            label: "Tiếp tục phiên",
            onClick: () => {
              lastWriteRef.current = 0;
              extendSession();
            },
          },
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") checkIdleState();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "token" && event.oldValue && !event.newValue) {
        logout();
        return;
      }
      if (event.key === LAST_ACTIVE_KEY || event.key === "token") checkIdleState();
    };

    const activityEvents: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    for (const event of activityEvents) window.addEventListener(event, extendSession, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorage);
    window.addEventListener(AUTH_SESSION_EVENT, checkIdleState);
    checkIdleState();
    const interval = window.setInterval(checkIdleState, CHECK_INTERVAL_MS);

    return () => {
      for (const event of activityEvents) window.removeEventListener(event, extendSession);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(AUTH_SESSION_EVENT, checkIdleState);
      window.clearInterval(interval);
      toast.dismiss(WARNING_TOAST_ID);
    };
  }, []);
}
