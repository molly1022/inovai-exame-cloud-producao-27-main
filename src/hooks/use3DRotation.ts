
import { useRef, useState } from "react";

export function use3DRotation(initialRotateY = -7) {
  const [rotateY, setRotateY] = useState(initialRotateY);
  const dragging = useRef(false);
  const lastX = useRef(0);

  // Unify move/up handlers for both pointer and touch usage on window scope
  const onPointerMove = (e: PointerEvent | TouchEvent) => {
    if (!dragging.current) return;
    let clientX: number;
    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if ("clientX" in e) {
      clientX = (e as PointerEvent).clientX;
    } else {
      return;
    }
    const deltaX = clientX - lastX.current;
    setRotateY((prev) => Math.max(-30, Math.min(30, prev + deltaX * 0.3)));
    lastX.current = clientX;
  };

  const onPointerUp = () => {
    dragging.current = false;
    window.removeEventListener("pointermove", onPointerMove as any);
    window.removeEventListener("pointerup", onPointerUp as any);
    window.removeEventListener("touchmove", onPointerMove as any);
    window.removeEventListener("touchend", onPointerUp as any);
  };

  // For 'pointer' events (mouse, pen)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    lastX.current = e.clientX;
    window.addEventListener("pointermove", onPointerMove as any);
    window.addEventListener("pointerup", onPointerUp as any);
  };

  // For 'touch' events
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      dragging.current = true;
      lastX.current = e.touches[0].clientX;
      window.addEventListener("touchmove", onPointerMove as any, { passive: false });
      window.addEventListener("touchend", onPointerUp as any);
    }
  };

  const eventHandlers = {
    onPointerDown,
    onTouchStart,
    style: {
      cursor: "grab",
    },
  };

  return { rotateY, eventHandlers };
}
