import type { LineMessageOut, LineUserOut } from "./types";

export const LINE_EVENTS_PATH = "/api/line/events";

export type LineRealtimeEvent =
  | { type: "connected" }
  | { type: "ping" }
  | { type: "line:message"; message: LineMessageOut }
  | { type: "line:user"; user: LineUserOut };
