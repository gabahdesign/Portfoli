"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [click, setClick] = useState(false);

  // Disable custom cursor entirely since native cursor was restored globally.
  return null;

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);

      const target = e.target as HTMLElement;
      const isPointerElement = 
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.hasAttribute("data-cursor");
      
      setIsPointer(isPointerElement);
    };

    const onMouseDown = () => setClick(true);
    const onMouseUp = () => setClick(false);
    const onMouseLeave = () => setIsHidden(true);
    const onMouseEnter = () => setIsHidden(false);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, []);

  if (isHidden) return null;

  return (
    <>
      {/* Main Dot */}
      <div
        className={clsx(
          "fixed top-0 left-0 w-2 h-2 bg-[var(--color-accent)] rounded-full pointer-events-none z-[9999] transition-transform duration-100 ease-out",
          click && "scale-150"
        )}
        style={{
          transform: `translate3d(${position.x - 4}px, ${position.y - 4}px, 0)`,
        }}
      />
      
      {/* Outer Ring */}
      <div
        className={clsx(
          "fixed top-0 left-0 w-8 h-8 border border-[var(--color-accent)] rounded-full pointer-events-none z-[9998] transition-all duration-300 ease-out",
          isPointer ? "w-12 h-12 bg-[var(--color-accent-subtle)] border-transparent scale-125" : "w-10 h-10",
          click && "scale-90 opacity-50"
        )}
        style={{
          transform: `translate3d(${position.x - (isPointer ? 24 : 20)}px, ${position.y - (isPointer ? 24 : 20)}px, 0)`,
        }}
      />
    </>
  );
}
