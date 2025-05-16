export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const r = (hash >> 0) & 0xff;
  const g = (hash >> 8) & 0xff;
  const b = (hash >> 16) & 0xff;
  return `rgb(${r}, ${g}, ${b})`;
}

export function darkenColor(rgb: string, factor = 0.6): string {
  const [r, g, b] = rgb.replace(/[^\d,]/g, '').split(',').map(Number).map(c => Math.floor(c * factor));
  return `rgb(${r}, ${g}, ${b})`;
}
