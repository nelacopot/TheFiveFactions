"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { dispatchMyNotificationEmailsAction, ensureCurrentWeekTaskAssignmentsAction } from "./actions";

export function DashboardAutoRefresh() {
  const router = useRouter();
  const ensuredAssignments = useRef(false);

  useEffect(() => {
    let mounted = true;
    if (!ensuredAssignments.current) {
      ensuredAssignments.current = true;
      void ensureCurrentWeekTaskAssignmentsAction().then((success) => {
        if (!mounted) return;
        if (success) router.refresh();
        void dispatchMyNotificationEmailsAction();
      });
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
        void dispatchMyNotificationEmailsAction();
      }
    };
    const interval = window.setInterval(refreshWhenVisible, 60_000);
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      mounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [router]);

  return null;
}
