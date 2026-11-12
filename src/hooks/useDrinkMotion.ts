import { useEffect, useState, useSyncExternalStore } from "react";
import type { PointerEvent } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { angleDelta, deviceTilt } from "../lib/tilt";

type Permission = "unavailable" | "prompt" | "asking" | "granted" | "denied";
type SensorConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};
const subscribeVisibility = (notify: () => void) => {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
};
const getVisibility = () => document.visibilityState === "visible";
const sensor = () =>
  typeof DeviceOrientationEvent === "undefined"
    ? undefined
    : (DeviceOrientationEvent as SensorConstructor);
const motionSensor = () =>
  typeof DeviceMotionEvent === "undefined"
    ? undefined
    : (DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<"granted" | "denied">;
      });

export function useDrinkMotion(allowed: boolean) {
  const [mobile] = useState(() => matchMedia("(pointer: coarse)").matches);
  const [permission, setPermission] = useState<Permission>(() => {
    if (!mobile || !window.isSecureContext || (!sensor() && !motionSensor()))
      return "unavailable";
    return typeof sensor()?.requestPermission === "function" ||
      typeof motionSensor()?.requestPermission === "function"
      ? "prompt"
      : "granted";
  });
  const [hasSensorData, setHasSensorData] = useState(false);
  const [noSensorData, setNoSensorData] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const visible = useSyncExternalStore(
    subscribeVisibility,
    getVisibility,
    () => true,
  );
  const active = allowed && visible;
  const mx = useMotionValue(0),
    my = useMotionValue(0),
    rx = useMotionValue(0),
    ry = useMotionValue(0),
    roll = useMotionValue(0);
  const spring = { stiffness: 90, damping: 24 };
  const x = useSpring(mx, spring),
    y = useSpring(my, spring),
    rotateX = useSpring(rx, spring),
    rotateY = useSpring(ry, spring),
    rotate = useSpring(roll, spring);

  useEffect(() => {
    mx.set(0);
    my.set(0);
    rx.set(0);
    ry.set(0);
    roll.set(0);
    if (!active || permission !== "granted") return;
    let origin: { beta: number; gamma: number } | null = null;
    let reported = false;
    let lastOrientation = 0;
    const timeout = window.setTimeout(() => {
      if (!reported) setNoSensorData(true);
    }, 2500);
    const reset = () => {
      origin = null;
      mx.set(0);
      my.set(0);
      rx.set(0);
      ry.set(0);
      roll.set(0);
    };
    const applyAngles = (beta: number | null, gamma: number | null) => {
      if (
        typeof beta !== "number" ||
        typeof gamma !== "number" ||
        !Number.isFinite(beta) ||
        !Number.isFinite(gamma)
      )
        return;
      if (!reported) {
        reported = true;
        setHasSensorData(true);
        setNoSensorData(false);
      }
      if (!origin) {
        origin = { beta, gamma };
        return;
      }
      const value = deviceTilt(
        angleDelta(beta, origin.beta),
        angleDelta(gamma, origin.gamma),
        screen.orientation?.angle ?? 0,
      );
      mx.set(value.x);
      my.set(value.y);
      rx.set(value.rotateX);
      ry.set(value.rotateY);
      roll.set(value.rotate);
    };
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (
        typeof event.beta !== "number" ||
        typeof event.gamma !== "number" ||
        !Number.isFinite(event.beta) ||
        !Number.isFinite(event.gamma)
      )
        return;
      lastOrientation = performance.now();
      applyAngles(event.beta, event.gamma);
    };
    const onMotion = (event: DeviceMotionEvent) => {
      // Some Android browsers expose gravity data without orientation events.
      if (lastOrientation && performance.now() - lastOrientation < 1000) return;
      const gravity = event.accelerationIncludingGravity;
      if (
        !gravity ||
        typeof gravity.x !== "number" ||
        typeof gravity.y !== "number" ||
        typeof gravity.z !== "number" ||
        ![gravity.x, gravity.y, gravity.z].every(Number.isFinite) ||
        Math.hypot(gravity.x, gravity.y, gravity.z) < 1
      )
        return;
      applyAngles(
        (Math.atan2(gravity.y, gravity.z) * 180) / Math.PI,
        (Math.atan2(-gravity.x, Math.hypot(gravity.y, gravity.z)) * 180) /
          Math.PI,
      );
    };
    window.addEventListener("deviceorientation", onOrientation, {
      passive: true,
    });
    window.addEventListener("orientationchange", reset);
    window.addEventListener("devicemotion", onMotion, { passive: true });
    screen.orientation?.addEventListener("change", reset);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("orientationchange", reset);
      window.removeEventListener("devicemotion", onMotion);
      window.clearTimeout(timeout);
      screen.orientation?.removeEventListener("change", reset);
      reset();
    };
  }, [active, permission, attempt, mx, my, rx, ry, roll]);

  async function requestTilt() {
    if (!active) return;
    if (!window.isSecureContext || (!sensor() && !motionSensor())) {
      setNoSensorData(true);
      return;
    }
    const apis = [sensor(), motionSensor()].filter(
      (api) => typeof api?.requestPermission === "function",
    );
    setNoSensorData(false);
    setHasSensorData(false);
    setPermission("asking");
    try {
      // Invoke both permission methods in the original user gesture.
      const results = await Promise.allSettled(
        apis.map((api) => api!.requestPermission!()),
      );
      setPermission(
        !results.length ||
          results.some(
            (result) =>
              result.status === "fulfilled" && result.value === "granted",
          )
          ? "granted"
          : "denied",
      );
      setAttempt((value) => value + 1);
    } catch {
      setPermission("denied");
    }
  }
  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (
      !active ||
      (hasSensorData && permission === "granted") ||
      event.pointerType === "pen"
    )
      return;
    const box = event.currentTarget.getBoundingClientRect();
    const px = Math.max(
      -1,
      Math.min(1, (event.clientX - box.left - box.width / 2) / (box.width / 2)),
    );
    const py = Math.max(
      -1,
      Math.min(
        1,
        (event.clientY - box.top - box.height / 2) / (box.height / 2),
      ),
    );
    mx.set(px * (mobile ? 10 : 14));
    my.set(py * (mobile ? 8 : 10));
    rx.set(-py * 3);
    ry.set(px * 5);
    roll.set(px * 2.5);
  }
  function onPointerLeave() {
    if (hasSensorData && permission === "granted") return;
    mx.set(0);
    my.set(0);
    rx.set(0);
    ry.set(0);
    roll.set(0);
  }
  return {
    style: { x, y, rotateX, rotateY, rotate, transformPerspective: 1000 },
    mobile,
    permission,
    hasSensorData,
    noSensorData,
    requestTilt,
    onPointerMove,
    onPointerLeave,
    active,
  };
}
