/** In-process pub/sub for LINE updates (SSE subscribers on same Node server). */

type Listener = (data: string) => void;

class LineRealtimeBus {
  private listeners = new Set<Listener>();

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(payload: unknown): void {
    const data = JSON.stringify(payload);
    for (const listener of this.listeners) {
      listener(data);
    }
  }

  get size(): number {
    return this.listeners.size;
  }
}

const GLOBAL_KEY = "__ecobzLineRealtimeBus";

export function getLineRealtimeBus(): LineRealtimeBus {
  const g = globalThis as Record<string, unknown>;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new LineRealtimeBus();
  }
  return g[GLOBAL_KEY] as LineRealtimeBus;
}
