import { Link } from "react-router-dom";
import DailyPapers from "../components/DailyPapers";
import Cursor from "../components/Cursor";
import "./Papers.css";

const Papers = () => {
  return (
    <div className="papers-page">
      <Cursor />
      
      {/* Page Header */}
      <div className="papers-page-header">
        <Link to="/" className="back-button" data-cursor="disable">
          ← Back to Home
        </Link>
        <div className="papers-page-title-box">
          <span className="papers-page-tag">AI RESEARCH RADAR</span>
          <h1>
            Research <span>Papers</span> & Podcast
          </h1>
          <p>
            Análisis semanal autónomo con IA y seguimiento en tiempo real de los artículos más votados en Hugging Face y arXiv.
          </p>
        </div>
      </div>

      {/* Daily Papers & Weekly Podcast Component */}
      <div className="papers-page-content">
        <DailyPapers />
      </div>
    </div>
  );
};

export default Papers;
