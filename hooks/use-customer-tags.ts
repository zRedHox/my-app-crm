"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readCustomerTagsMap,
  readMergedCustomerTags,
  readCustomerTags,
  TAGS_UPDATED_EVENT,
  writeCustomerTags,
} from "@/lib/tags/config";

export function useCustomerTags(customerKey: string | null) {
  const [tags, setTags] = useState<string[]>([]);

  const reload = useCallback(() => {
    if (!customerKey) {
      setTags([]);
      return;
    }
    setTags(readCustomerTags(customerKey));
  }, [customerKey]);

  useEffect(() => {
    reload();
    const onUpdate = () => reload();
    window.addEventListener(TAGS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(TAGS_UPDATED_EVENT, onUpdate);
  }, [reload]);

  const save = useCallback(
    (next: string[]) => {
      if (!customerKey) return;
      writeCustomerTags(customerKey, next);
      setTags(readCustomerTags(customerKey));
    },
    [customerKey],
  );

  return { tags, save, reload };
}

export function useMergedCustomerTags(keys: string[]) {
  const [tags, setTags] = useState<string[]>([]);
  const key = keys.join("|");

  const reload = useCallback(() => {
    if (!keys.length) {
      setTags([]);
      return;
    }
    setTags(readMergedCustomerTags(keys));
  }, [key]);

  useEffect(() => {
    reload();
    const onUpdate = () => reload();
    window.addEventListener(TAGS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(TAGS_UPDATED_EVENT, onUpdate);
  }, [reload]);

  return { tags, reload };
}

export function useCustomerTagsMap() {
  const [map, setMap] = useState<Record<string, string[]>>({});

  const reload = useCallback(() => {
    setMap(readCustomerTagsMap());
  }, []);

  useEffect(() => {
    reload();
    const onUpdate = () => reload();
    window.addEventListener(TAGS_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(TAGS_UPDATED_EVENT, onUpdate);
  }, [reload]);

  return map;
}
