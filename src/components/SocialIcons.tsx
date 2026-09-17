import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import "./styles/SocialIcons.css";
import { TbNotes } from "react-icons/tb";
import { useEffect } from "react";
import HoverLinks from "./HoverLinks";
import { config } from "../config";

const SocialIcons = () => {
  useEffect(() => {
    const social = document.getElementById("social");
    if (!social) return;

    const cleanupFns: (() => void)[] = [];

    social.querySelectorAll("span").forEach((item) => {
      const elem = item as HTMLElement;
      const link = elem.querySelector("a") as HTMLElement;
      if (!link) return;

      let rAFId: number | null = null;
      let targetX = 0;
      let targetY = 0;
      let currentX = 0;
      let currentY = 0;
      let isHovered = false;

      const updatePosition = () => {
        currentX += (targetX - currentX) * 0.2;
        currentY += (targetY - currentY) * 0.2;

        link.style.setProperty("--siLeft", `${currentX}px`);
        link.style.setProperty("--siTop", `${currentY}px`);

        if (!isHovered && Math.abs(targetX - currentX) < 0.2 && Math.abs(targetY - currentY) < 0.2) {
          link.style.setProperty("--siLeft", "0px");
          link.style.setProperty("--siTop", "0px");
          rAFId = null;
          return;
        }

        rAFId = requestAnimationFrame(updatePosition);
      };

      const startAnimation = () => {
        if (!rAFId) {
          rAFId = requestAnimationFrame(updatePosition);
        }
      };

      const onMouseMove = (e: MouseEvent) => {
        const rect = elem.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        targetX = (e.clientX - centerX) * 0.4;
        targetY = (e.clientY - centerY) * 0.4;
        startAnimation();
      };

      const onMouseEnter = () => {
        isHovered = true;
        startAnimation();
      };

      const onMouseLeave = () => {
        isHovered = false;
        targetX = 0;
        targetY = 0;
        startAnimation();
      };

      elem.addEventListener("mouseenter", onMouseEnter);
      elem.addEventListener("mousemove", onMouseMove);
      elem.addEventListener("mouseleave", onMouseLeave);

      cleanupFns.push(() => {
        if (rAFId) cancelAnimationFrame(rAFId);
        elem.removeEventListener("mouseenter", onMouseEnter);
        elem.removeEventListener("mousemove", onMouseMove);
        elem.removeEventListener("mouseleave", onMouseLeave);
      });
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  return (
    <div className="icons-section">
      <div className="social-icons" data-cursor="icons" id="social">
        <span>
          <a href={config.contact.github} target="_blank" rel="noopener noreferrer">
            <FaGithub />
          </a>
        </span>
        <span>
          <a href={config.contact.linkedin} target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn />
          </a>
        </span>
        <span>
          <a href={config.contact.twitter} target="_blank" rel="noopener noreferrer">
            <FaXTwitter />
          </a>
        </span>
        <span>
          <a href={config.contact.instagram} target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
        </span>
      </div>
      <a className="resume-button" href="/Adrian_Alemany_CV.pdf" target="_blank" rel="noopener noreferrer">
        <HoverLinks text="RESUME" />
        <span>
          <TbNotes />
        </span>
      </a>
    </div>
  );
};

export default SocialIcons;
