import { MdArrowOutward } from "react-icons/md";
import { FaBriefcase, FaMicrochip, FaShip, FaUser } from "react-icons/fa6";
import "./styles/LinktreeHero.css";

const LINKTREE_LINKS = [
  {
    id: "alina-job",
    label: "Alina",
    sublabel: "Job Search",
    icon: <FaBriefcase />,
    href: "https://alina-brown.vercel.app/",
    external: true,
    accent: "#c481ff",
    glow: "rgba(196,129,255,0.35)",
  },
  {
    id: "tecnocracia",
    label: "Tecnocracia",
    sublabel: "Tech & Society",
    icon: <FaMicrochip />,
    href: "https://tecnocracia.streamlit.app/",
    accent: "#60cfff",
    glow: "rgba(96,207,255,0.35)",
    external: true,
  },
  {
    id: "balearia",
    label: "Balearia",
    sublabel: "Predictor de Consumo",
    icon: <FaShip />,
    href: "https://baleariatravels.vercel.app/",
    external: true,
    accent: "#38efc0",
    glow: "rgba(56,239,192,0.35)",
  },
  {
    id: "who-i-am",
    label: "Who I Am",
    sublabel: "About Me",
    icon: <FaUser />,
    href: "#about",
    accent: "#ffb86c",
    glow: "rgba(255,184,108,0.35)",
  },
];

const LinktreeHero = () => {
  return (
    <div className="linktree-hero" id="linktree-hero">
      <p className="linktree-hero-label">🔗 Quick Links</p>
      <div className="linktree-grid">
        {LINKTREE_LINKS.map((link) => (
          <a
            key={link.id}
            id={`linktree-${link.id}`}
            href={link.href}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noopener noreferrer" : undefined}
            className="linktree-card"
            style={{
              "--card-accent": link.accent,
              "--card-glow": link.glow,
            } as React.CSSProperties}
            data-cursor="disable"
          >
            <span className="linktree-card-icon">{link.icon}</span>
            <span className="linktree-card-text">
              <span className="linktree-card-label">{link.label}</span>
              <span className="linktree-card-sublabel">{link.sublabel}</span>
            </span>
            <MdArrowOutward className="linktree-card-arrow" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default LinktreeHero;
