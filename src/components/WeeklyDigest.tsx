import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaPlay,
  FaPause,
  FaArrowRight,
  FaArrowLeft,
  FaRegFilePdf,
} from "react-icons/fa6";
import {
  MdOutlinePodcasts,
  MdOutlineAutoGraph,
  MdOutlineDescription,
  MdDownload,
} from "react-icons/md";
import { SiHuggingface } from "react-icons/si";
import seedDigest from "../data/weekly_digest.json";
import { WeeklyDigestData } from "../types/digest";
import "./styles/WeeklyDigest.css";

const PLAYBACK_RATES = [1.0, 1.25, 1.5, 1.75];

export const WeeklyDigest: React.FC = () => {
  const [digest, setDigest] = useState<WeeklyDigestData>(seedDigest as WeeklyDigestData);
  const [activeTab, setActiveTab] = useState<"slides" | "transcript" | "papers">("slides");
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  
  // Audio state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [speedIndex, setSpeedIndex] = useState<number>(0);
  const [audioError, setAudioError] = useState<string | null>(null);

  // Try to fetch latest digest dynamically from /digest/digest.json
  useEffect(() => {
    fetch("/digest/digest.json")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Local fallback used");
      })
      .then((data: WeeklyDigestData) => {
        if (data && data.slides && data.podcast) {
          setDigest(data);
        }
      })
      .catch(() => {
        // Fallback to static imported seed data
      });
  }, []);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Play/Pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    setAudioError(null);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          setAudioError("El podcast de audio se sintetizará en el próximo ciclo semanal de GitHub Actions.");
        });
    }
  };

  // Scrubber click handler
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newFraction = Math.max(0, Math.min(1, clickX / width));
    const newTime = newFraction * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Speed cycle
  const cyclePlaybackRate = () => {
    const nextIdx = (speedIndex + 1) % PLAYBACK_RATES.length;
    setSpeedIndex(nextIdx);
    if (audioRef.current) {
      audioRef.current.playbackRate = PLAYBACK_RATES[nextIdx];
    }
  };

  // Slide navigation
  const nextSlide = useCallback(() => {
    if (currentSlideIndex < (digest.slides?.length || 1) - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  }, [currentSlideIndex, digest.slides?.length]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  }, [currentSlideIndex]);

  const currentSlide = digest.slides?.[currentSlideIndex];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="weekly-digest-card" data-cursor="default">
      <div className="digest-ambient-glow" />

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={digest.audioUrl || "/digest/weekly_podcast.mp3"}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onError={() => {
          // Graceful handling if file not yet uploaded
        }}
      />

      <div className="digest-inner">
        {/* HEADER */}
        <div className="digest-header">
          <div className="digest-badge-row">
            <span className="digest-tag-badge">
              <span className="live-pulse-dot" />
              Podcast Semanal IA
            </span>
            <span className="digest-speaker-badge">
              <MdOutlinePodcasts /> Álvaro & Elvira (Voces IA España)
            </span>
            <span className="digest-date-badge">{digest.dateRange}</span>
          </div>

          <h3 className="digest-main-title">{digest.weekTitle}</h3>
          <p className="digest-intro">{digest.introduction}</p>
        </div>

        {/* AUDIO PLAYER */}
        <div className="digest-player-container">
          <div className="player-main-row">
            <button
              onClick={togglePlay}
              className="play-toggle-btn"
              title={isPlaying ? "Pausar" : "Reproducir Podcast"}
              data-cursor="disable"
            >
              {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: "3px" }} />}
            </button>

            <div className="player-info-meta">
              <span className="player-track-name">Edición Semanal #AudioOverview</span>
              <div className="player-voice-info">
                <span>Álvaro & Elvira</span>
                <div className={`equalizer-wave ${isPlaying ? "is-playing" : ""}`}>
                  <span className="equalizer-bar" />
                  <span className="equalizer-bar" />
                  <span className="equalizer-bar" />
                  <span className="equalizer-bar" />
                </div>
              </div>
            </div>

            {/* Scrubber */}
            <div className="player-progress-area">
              <span className="player-time player-time-current">
                {formatTime(currentTime)}
              </span>
              <div
                className="progress-track"
                onClick={handleSeek}
                title="Avanzar / Retroceder audio"
                data-cursor="disable"
              >
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="player-time">
                {duration > 0 ? formatTime(duration) : "3:40"}
              </span>
            </div>

            {/* Extra Controls */}
            <div className="player-extra-controls">
              <button
                onClick={cyclePlaybackRate}
                className="player-btn-pill"
                title="Velocidad de reproducción"
                data-cursor="disable"
              >
                {PLAYBACK_RATES[speedIndex]}x
              </button>

              <a
                href={digest.audioUrl || "/digest/weekly_podcast.mp3"}
                download="weekly_ai_podcast.mp3"
                className="player-btn-pill"
                title="Descargar audio MP3"
                data-cursor="disable"
              >
                <MdDownload /> MP3
              </a>
            </div>
          </div>

          {audioError && (
            <div
              style={{
                fontSize: "12px",
                color: "#ffdf5d",
                background: "rgba(255, 210, 30, 0.08)",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 210, 30, 0.2)",
              }}
            >
              ℹ️ {audioError}
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="digest-tabs">
          <button
            className={`digest-tab-btn ${activeTab === "slides" ? "active" : ""}`}
            onClick={() => setActiveTab("slides")}
            data-cursor="disable"
          >
            <MdOutlineAutoGraph /> Diapositivas Clave ({digest.slides?.length || 0})
          </button>
          <button
            className={`digest-tab-btn ${activeTab === "transcript" ? "active" : ""}`}
            onClick={() => setActiveTab("transcript")}
            data-cursor="disable"
          >
            <MdOutlineDescription /> Transcripción del Diálogo
          </button>
          <button
            className={`digest-tab-btn ${activeTab === "papers" ? "active" : ""}`}
            onClick={() => setActiveTab("papers")}
            data-cursor="disable"
          >
            <SiHuggingface /> Papers Destacados ({digest.papers?.length || 0})
          </button>
        </div>

        {/* TAB 1: SLIDES CAROUSEL */}
        {activeTab === "slides" && currentSlide && (
          <div className="slides-carousel">
            <div className="slide-top-meta">
              <span className="slide-counter">
                Diapositiva {currentSlideIndex + 1} de {digest.slides.length}
              </span>
              {currentSlide.paperTitle && (
                <span className="slide-paper-tag" title={currentSlide.paperTitle}>
                  📄 {currentSlide.paperTitle}
                </span>
              )}
            </div>

            <div className="slide-content">
              <h4>{currentSlide.title}</h4>
              <ul className="slide-points-list">
                {currentSlide.keyPoints?.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>

              {currentSlide.takeaway && (
                <div className="slide-takeaway-box">
                  <span>Conclusión del Paper</span>
                  <p>"{currentSlide.takeaway}"</p>
                </div>
              )}
            </div>

            {/* Carousel navigation */}
            <div className="slide-bottom-nav">
              <button
                className="slide-nav-btn"
                onClick={prevSlide}
                disabled={currentSlideIndex === 0}
                data-cursor="disable"
              >
                <FaArrowLeft /> Anterior
              </button>

              <div className="slide-dots">
                {digest.slides.map((_, idx) => (
                  <button
                    key={idx}
                    className={`slide-dot ${idx === currentSlideIndex ? "active" : ""}`}
                    onClick={() => setCurrentSlideIndex(idx)}
                    title={`Ir a diapositiva ${idx + 1}`}
                    data-cursor="disable"
                  />
                ))}
              </div>

              <button
                className="slide-nav-btn"
                onClick={nextSlide}
                disabled={currentSlideIndex === digest.slides.length - 1}
                data-cursor="disable"
              >
                Siguiente <FaArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSCRIPT */}
        {activeTab === "transcript" && (
          <div className="transcript-dialogue-list">
            {digest.podcast?.map((msg, idx) => {
              const isAlvaro = msg.speaker.toLowerCase().includes("alvaro") || msg.speaker.toLowerCase().includes("álvaro");
              return (
                <div
                  key={idx}
                  className={`dialogue-bubble ${
                    isAlvaro ? "speaker-alvaro" : "speaker-elvira"
                  }`}
                >
                  <span className="speaker-label">
                    {isAlvaro ? "Álvaro (Investigador)" : "Elvira (Divulgadora)"}
                  </span>
                  <p className="dialogue-text">{msg.text}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: PAPERS LIST */}
        {activeTab === "papers" && (
          <div className="digest-papers-grid">
            {digest.papers?.map((p) => (
              <div key={p.id} className="digest-mini-paper-card">
                <div>
                  <h5 className="mini-paper-title">{p.title}</h5>
                  <div className="mini-paper-meta" style={{ marginTop: "8px" }}>
                    <span>{p.publishedAt}</span>
                    <span className="mini-paper-upvotes">▲ {p.upvotes} votos</span>
                  </div>
                </div>

                <div className="mini-paper-actions">
                  <a
                    href={p.hfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mini-paper-btn"
                    data-cursor="disable"
                  >
                    <SiHuggingface /> HF
                  </a>
                  <a
                    href={p.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mini-paper-btn"
                    data-cursor="disable"
                  >
                    <FaRegFilePdf /> PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyDigest;
