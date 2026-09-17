import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let hover = false;
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Use gsap.quickTo for high-performance 60-120fps tracking with zero garbage collection
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power2.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      if (!hover) {
        xTo(e.clientX);
        yTo(e.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const cursorElements = document.querySelectorAll("[data-cursor]");
    const handleMouseOver = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      if (target.dataset.cursor === "icons") {
        cursor.classList.add("cursor-icons");
        xTo(rect.left);
        yTo(rect.top);
        cursor.style.setProperty("--cursorH", `${rect.height}px`);
        hover = true;
      }
      if (target.dataset.cursor === "disable") {
        cursor.classList.add("cursor-disable");
      }
    };

    const handleMouseOut = () => {
      cursor.classList.remove("cursor-disable", "cursor-icons");
      hover = false;
    };

    cursorElements.forEach((element) => {
      element.addEventListener("mouseover", handleMouseOver);
      element.addEventListener("mouseout", handleMouseOut);
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cursorElements.forEach((element) => {
        element.removeEventListener("mouseover", handleMouseOver);
        element.removeEventListener("mouseout", handleMouseOut);
      });
    };
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
