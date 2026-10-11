"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

let clientTimezone: string | null = null;

function getSnapshot(): string {
  if (clientTimezone === null) {
    clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return clientTimezone;
}

/**
 * Server render: null. Client render: the device's IANA timezone.
 */
export function useDetectedTimezone(): string | null {
  return useSyncExternalStore(emptySubscribe, getSnapshot, () => null);
}
