"use client";

import { useCallback, useEffect, useState } from "react";
import { getLeads, type GetLeadsParams } from "@/lib/api/leads";
import { getMe } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import type { LeadOut } from "@/lib/api/types";
import { isAuthenticated } from "@/lib/auth/token";

export function useLeads(params: Omit<GetLeadsParams, "all_leads"> = {}) {
  const [leads, setLeads] = useState<LeadOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated()) {
      setNeedsAuth(true);
      setLoading(false);
      setLeads([]);
      return;
    }

    setNeedsAuth(false);
    setLoading(true);
    setError(null);

    try {
      let allLeads = false;
      try {
        const me = await getMe();
        allLeads = me.role_id === 1;
      } catch {
        /* user-scoped list */
      }

      const data = await getLeads({
        ...params,
        ...(allLeads ? { all_leads: true } : {}),
      });
      setLeads(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setNeedsAuth(true);
        setLeads([]);
      } else {
        setError(
          err instanceof ApiError ? err.message : "Failed to load leads",
        );
        setLeads([]);
      }
    } finally {
      setLoading(false);
    }
  }, [params.search, params.status, params.limit, params.skip]);

  useEffect(() => {
    void load();
  }, [load]);

  return { leads, loading, error, needsAuth, refresh: load };
}
