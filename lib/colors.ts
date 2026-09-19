const PALETTE = [
  "#60a5fa",
  "#34d399",
  "#f472b6",
  "#a78bfa",
  "#fb923c",
  "#facc15",
  "#2dd4bf",
  "#f87171",
  "#c084fc",
  "#4ade80",
];

export function getColorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
