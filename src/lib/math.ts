export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

export const map = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => {
  if (inMax === inMin) return outMin;
  return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
};

export const wrap = (value: number, min: number, max: number): number => {
  const range = max - min;
  if (range <= 0) return min;
  return min + ((((value - min) % range) + range) % range);
};

export const degrees = (rad: number): number => (rad * 180) / Math.PI;
export const radians = (deg: number): number => (deg * Math.PI) / 180;
