import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { config } from "../config";

const Landing = ({ children }: PropsWithChildren) => {
  const nameParts = config.developer.fullName.split(" ");
  const firstName = nameParts[0] || config.developer.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <div className="landing-section" id="landingDiv">
      <div className="landing-container">
        {/* Top Name Greeting */}
        <div className="landing-intro">
          <h2>Hello! I'm</h2>
          <h1>
            {firstName.toUpperCase()}{" "}
            {lastName && <span>{lastName.toUpperCase()}</span>}
          </h1>
        </div>

        {/* Central Hero Photo (shown on mobile, and on desktop before 3D avatar appears) */}
        <div className="landing-hero-photo">
          <img
            src="/images/mypic.jpeg"
            alt={config.developer.fullName}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>

        {/* Subtitle in 2 clean, legible lines centered under the photo */}
        <div className="landing-info">
          <h2 className="landing-title-line-1">
            IA & DATA ENGINEER
          </h2>
          <h3 className="landing-title-line-2">
            GOOGLE CLOUD SOLUTIONS
          </h3>
        </div>
      </div>
      {children}
    </div>
  );
};

export default Landing;
