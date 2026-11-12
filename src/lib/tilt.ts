const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));
export const angleDelta = (value: number, origin: number) =>
  ((value - origin + 540) % 360) - 180;

/** Convert device axes to screen axes, then keep motion small and predictable. */
export function deviceTilt(beta: number, gamma: number, screenAngle: number) {
  const angle = (screenAngle * Math.PI) / 180;
  const horizontal = gamma * Math.cos(angle) + beta * Math.sin(angle);
  const vertical = beta * Math.cos(angle) - gamma * Math.sin(angle);
  return {
    x: clamp(horizontal * 0.35, 10),
    y: clamp(vertical * 0.25, 8),
    rotateX: clamp(-vertical * 0.2, 5),
    rotateY: clamp(horizontal * 0.24, 6),
    rotate: clamp(horizontal * 0.18, 6),
  };
}
