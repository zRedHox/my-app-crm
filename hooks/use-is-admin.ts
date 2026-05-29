"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api/users";

export function useIsAdmin() {
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getMe()
      .then((me) => setIsAdmin(me.role_id === 1))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, []);

  return { isAdmin, checking };
}
