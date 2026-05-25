export const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(1, s));
  const lum = Math.max(0, Math.min(1, l));

  const c = (1 - Math.abs(2 * lum - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lum - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) {
    [r, g, b] = [c, x, 0];
  } else if (hue < 120) {
    [r, g, b] = [x, c, 0];
  } else if (hue < 180) {
    [r, g, b] = [0, c, x];
  } else if (hue < 240) {
    [r, g, b] = [0, x, c];
  } else if (hue < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
};

export const hsl = (h: number, s: number, l: number, a = 1): string => {
  if (a === 1) {
    return `hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }
  return `hsla(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%, ${a})`;
};

export const rgb = (r: number, g: number, b: number, a = 1): string => {
  if (a === 1) return `rgb(${r}, ${g}, ${b})`;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

export type Palette = {
  background: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
};

export const palettes: Record<string, Palette> = {
  sunset: {
    background: '#0b0420',
    primary: '#ff5e7e',
    secondary: '#ffb15c',
    accent: '#7c5cff',
    text: '#ffffff',
  },
  ocean: {
    background: '#021024',
    primary: '#3ec5ff',
    secondary: '#0bd1d1',
    accent: '#7cf5d4',
    text: '#e6f4ff',
  },
  forest: {
    background: '#06140c',
    primary: '#5ddb6c',
    secondary: '#a8e063',
    accent: '#f6e58d',
    text: '#f0fff4',
  },
  mono: {
    background: '#0e0e10',
    primary: '#ffffff',
    secondary: '#bdbdbd',
    accent: '#ff3b3b',
    text: '#ffffff',
  },
  cyber: {
    background: '#0a001a',
    primary: '#ff00d4',
    secondary: '#00fff0',
    accent: '#ffe600',
    text: '#ffffff',
  },
};

export const getPalette = (name: string): Palette => {
  return palettes[name] ?? palettes.sunset!;
};
