import { describe, it, expect } from "vitest";
import { angleDelta, deviceTilt } from "./tilt";
describe("device tilt mapping", () => {
  it("follows left and right tilt without depending on compass heading", () => {
    expect(deviceTilt(0, 20, 0).rotate).toBeGreaterThan(0);
    expect(deviceTilt(0, -20, 0).rotate).toBeLessThan(0);
    expect(deviceTilt(0, 0, 0)).toEqual({
      x: 0,
      y: 0,
      rotateX: -0,
      rotateY: 0,
      rotate: 0,
    });
  });
  it("maps the device axes into landscape screen axes", () => {
    const value = deviceTilt(20, 0, 90);
    expect(value.x).toBeCloseTo(7);
    expect(value.rotateY).toBeCloseTo(4.8);
    expect(value.y).toBeCloseTo(0);
  });
  it("bounds travel and handles the wrap at 180 degrees", () => {
    expect(deviceTilt(180, 90, 0)).toEqual({
      x: 10,
      y: 8,
      rotateX: -5,
      rotateY: 6,
      rotate: 6,
    });
    expect(angleDelta(-179, 179)).toBe(2);
    expect(angleDelta(179, -179)).toBe(-2);
  });
});
