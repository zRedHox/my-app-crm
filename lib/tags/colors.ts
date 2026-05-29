/** Deterministic tag color from name (same name → same color). */

function hashTagName(name: string): number {
  const normalized = name.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function tagColorStyle(name: string): {
  backgroundColor: string;
  color: string;
  borderColor: string;
} {
  const hue = hashTagName(name) % 360;
  return {
    backgroundColor: `hsl(${hue} 75% 93%)`,
    color: `hsl(${hue} 45% 28%)`,
    borderColor: `hsl(${hue} 50% 78%)`,
  };
}
