import { getLineRealtimeBus } from "./realtime-bus";
import type { LineRealtimeEvent } from "./realtime-events";
import type { LineMessageOut, LineUserOut } from "./types";

function publish(event: LineRealtimeEvent): void {
  try {
    getLineRealtimeBus().publish(event);
  } catch {
    /* optional when bus unavailable */
  }
}

export function publishLineMessage(message: LineMessageOut): void {
  publish({ type: "line:message", message });
}

export function publishLineUser(user: LineUserOut): void {
  publish({ type: "line:user", user });
}
