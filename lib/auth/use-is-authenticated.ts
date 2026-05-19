"use client";

import { useSyncExternalStore } from "react";
import { getAccessToken, subscribeAuth } from "./token";

export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(
    subscribeAuth,
    () => Boolean(getAccessToken()),
    () => false,
  );
}
