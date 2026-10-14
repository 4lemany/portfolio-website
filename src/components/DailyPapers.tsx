import { useState, useMemo, useCallback } from "react";
import { SiHuggingface } from "react-icons/si";
import {
  MdArrowOutward,
  MdRefresh,
  MdSearch,
  MdClose,
  MdAccessTime,
  MdCheckCircle,
  MdOutlineScience,
} from "react-icons/md";
import { FaArrowUp, FaRegFilePdf, FaGithub } from "react-icons/fa6";
import { useDailyPapers } from "../hooks/useDailyPapers";
import { SortOption } from "../types/papers";
import "./styles/DailyPapers.css";

// Quick filter categories
const TOPIC_TAGS = [
  { id: "all", label: "Todos", query: "" },
  { id: "reasoning", label: "Reasoning & LLMs", query: "reasoning" },
  { id: "agents", label: "Agents", query: "agent" },
  { id: "vision", label: "Diffusion & Vision", query: "diffusion" },
  { id: "multimodal", label: "Multimodal", query: "multimodal" },
  { id: "video", label: "Video Generation", query: "video" },
  { id: "audio", label: "Audio & Speech", query: "audio" },
];

const INITIAL_VISIBLE_COUNT = 9;

export const DailyPapers = () => {
  const { papers, loading, error, lastSync, isCached, refetch } = useDailyPapers({
    ttlMinutes: 45,
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("upvotes");
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Toggle abstract expansion
  const toggleAbstract = useCallback((id: string) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Format sync time
  const formatSyncTime = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle tag selection
  const handleTagClick = (tagId: string, tagQuery: string) => {
    setSelectedTag(tagId);
    if (tagId === "all") {
      setSearchQuery("");
    } else {
      setSearchQuery(tagQuery);
    }
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };

  // Filter and sort papers
  const filteredPapers = useMemo(() => {
    let result = [...papers];

    // Filter by query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((item) => {
        const paper = item.paper;
        const titleMatch = paper.title?.toLowerCase().includes(q);
        const summaryMatch = paper.summary?.toLowerCase().includes(q);
        const authorMatch = paper.authors?.some((a) =>
          a.name.toLowerCase().includes(q)
        );
        const idMatch = paper.id?.toLowerCase().includes(q);
        return titleMatch || summaryMatch || authorMatch || idMatch;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "upvotes") {
        const upvotesA = a.paper.upvotes || 0;
        const upvotesB = b.paper.upvotes || 0;
        if (upvotesB !== upvotesA) {
          return upvotesB - upvotesA;
        }
        // Secondary sort by date
        return (
          new Date(b.paper.publishedAt || 0).getTime() -
          new Date(a.paper.publishedAt || 0).getTime()
        );
      } else {
        return (
          new Date(b.paper.publishedAt || 0).getTime() -
          new Date(a.paper.publishedAt || 0).getTime()
        );
      }
    });

    return result;
  }, [papers, searchQuery, sortBy]);

  const displayedPapers = useMemo(() => {
    return filteredPapers.slice(0, visibleCount);
  }, [filteredPapers, visibleCount]);

  const hasMore = visibleCount < filteredPapers.length;

  return (
    <section className="daily-papers-section section-container" id="papers">
      {/* SECTION HEADER */}
      <div className="papers-header">
        <div className="papers-badge-row">
          <div className="papers-live-badge">
            <span className="live-pulse-dot" />
            <SiHuggingface className="hf-icon" />
            <span className="badge-text">EN VIVO DESDE HUGGING FACE PAPERS</span>
          </div>

          <div className="papers-meta-info">
            <span className="papers-sync-time" title="Hora de sincronización">
              <MdAccessTime className="meta-icon" />
              Sincronizado: {formatSyncTime(lastSync)}
            </span>

            {isCached && (
              <span className="papers-cache-pill" title="Datos guardados en caché local">
                <MdCheckCircle className="meta-icon" /> En caché (45m TTL)
              </span>
            )}

            <span className="papers-count-badge">
              <MdOutlineScience className="meta-icon" /> {papers.length} papers hoy
            </span>

            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              className={`papers-refresh-btn ${isRefreshing ? "spinning" : ""}`}
              title="Actualizar datos en vivo ahora"
              data-cursor="disable"
              aria-label="Actualizar papers"
            >
              <MdRefresh />
            </button>
          </div>
        </div>

        <h2 className="papers-title">
          DAILY <span>PAPERS</span> // AI RADAR
        </h2>

        <p className="papers-description">
          Seguimiento en tiempo real de los artículos científicos y arquitecturas de
          Machine Learning más influyentes publicados hoy en Hugging Face y arXiv.
        </p>
      </div>

      {/* SEARCH AND CONTROLS */}
      <div className="papers-controls-box">
        {/* Search Bar */}
        <div className="papers-search-wrapper">
          <MdSearch className="search-input-icon" />
          <input
            type="text"
            className="papers-search-input"
            placeholder="Buscar por título, autor, id de arXiv o tema (ej. diffusion, reasoning, agents)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setVisibleCount(INITIAL_VISIBLE_COUNT);
            }}
            data-cursor="disable"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag("all");
              }}
              className="search-clear-btn"
              title="Limpiar búsqueda"
              data-cursor="disable"
            >
              <MdClose />
            </button>
          )}
        </div>

        {/* Quick Topic Chips */}
        <div className="papers-tags-bar">
          <span className="tags-label">Filtrar por tema:</span>
          <div className="tags-list">
            {TOPIC_TAGS.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.id, tag.query)}
                className={`tag-chip ${selectedTag === tag.id ? "active" : ""}`}
                data-cursor="disable"
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort & Stats Bar */}
        <div className="papers-sort-bar">
          <div className="papers-stats-count">
            Mostrando <strong>{displayedPapers.length}</strong> de{" "}
            <strong>{filteredPapers.length}</strong> papers
            {searchQuery && ` para "${searchQuery}"`}
          </div>

          <div className="papers-sort-buttons">
            <span className="sort-label">Ordenar por:</span>
            <button
              onClick={() => setSortBy("upvotes")}
              className={`sort-btn ${sortBy === "upvotes" ? "active" : ""}`}
              data-cursor="disable"
            >
              <FaArrowUp className="sort-btn-icon" /> Más votados hoy
            </button>
            <button
              onClick={() => setSortBy("recent")}
              className={`sort-btn ${sortBy === "recent" ? "active" : ""}`}
              data-cursor="disable"
            >
              <MdAccessTime className="sort-btn-icon" /> Más recientes
            </button>
          </div>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && papers.length === 0 && (
        <div className="papers-error-card">
          <div className="error-title">No se pudieron cargar los papers en este momento</div>
          <p className="error-message">{error}</p>
          <button
            onClick={() => refetch(true)}
            className="error-retry-btn"
            data-cursor="disable"
          >
            <MdRefresh /> Reintentar conexión
          </button>
        </div>
      )}

      {/* SKELETON LOADERS */}
      {loading && papers.length === 0 && (
        <div className="papers-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="paper-card skeleton-card">
              <div className="skeleton-line skeleton-header" />
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-title-short" />
              <div className="skeleton-line skeleton-authors" />
              <div className="skeleton-box skeleton-abstract" />
              <div className="skeleton-actions">
                <div className="skeleton-btn" />
                <div className="skeleton-btn" />
                <div className="skeleton-btn" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY SEARCH STATE */}
      {!loading && filteredPapers.length === 0 && papers.length > 0 && (
        <div className="papers-empty-card">
          <h4>No se encontraron papers</h4>
          <p>
            No hay resultados que coincidan con <em>"{searchQuery}"</em>. Prueba con otro
            término como <code>reasoning</code>, <code>diffusion</code> o <code>agent</code>.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTag("all");
            }}
            className="empty-reset-btn"
            data-cursor="disable"
          >
            Ver todos los papers
          </button>
        </div>
      )}

      {/* PAPERS GRID */}
      {displayedPapers.length > 0 && (
        <div className="papers-grid">
          {displayedPapers.map((item) => {
            const paper = item.paper;
            const isExpanded = !!expandedAbstracts[paper.id];
            const authors = paper.authors || [];
            const primaryAuthors = authors.slice(0, 3);
            const extraAuthorsCount = authors.length - primaryAuthors.length;

            return (
              <article key={paper.id} className="paper-card">
                {/* CARD HEADER */}
                <div className="paper-card-top">
                  <div className="paper-upvotes-pill" title={`${paper.upvotes} votos en Hugging Face`}>
                    <FaArrowUp className="upvote-arrow" />
                    <span className="upvotes-num">{paper.upvotes ?? 0}</span>
                  </div>

                  <div className="paper-meta-pills">
                    {paper.publishedAt && (
                      <span className="paper-date-pill">{formatDate(paper.publishedAt)}</span>
                    )}
                    <span className="paper-arxiv-pill" title={`arXiv ID: ${paper.id}`}>
                      arXiv:{paper.id}
                    </span>
                  </div>
                </div>

                {/* PAPER TITLE */}
                <h3 className="paper-title">
                  <a
                    href={`https://huggingface.co/papers/${paper.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="disable"
                    title={paper.title}
                  >
                    {paper.title}
                  </a>
                </h3>

                {/* AUTHORS */}
                {authors.length > 0 && (
                  <div className="paper-authors">
                    <span className="authors-icon">Autores:</span>
                    <div className="authors-tags">
                      {primaryAuthors.map((author, idx) => (
                        <span key={author._id || idx} className="author-tag">
                          {author.name}
                        </span>
                      ))}
                      {extraAuthorsCount > 0 && (
                        <span
                          className="author-tag author-extra"
                          title={authors.map((a) => a.name).join(", ")}
                        >
                          +{extraAuthorsCount} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* ABSTRACT / SUMMARY */}
                {paper.summary && (
                  <div className="paper-abstract-wrapper">
                    <p className={`paper-abstract ${isExpanded ? "expanded" : "collapsed"}`}>
                      {paper.summary}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleAbstract(paper.id)}
                      className="abstract-toggle-btn"
                      data-cursor="disable"
                    >
                      {isExpanded ? "▲ Leer menos" : "▼ Ver abstract completo"}
                    </button>
                  </div>
                )}

                {/* EXTERNAL ACTION LINKS */}
                <div className="paper-actions">
                  <a
                    href={`https://huggingface.co/papers/${paper.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn action-hf"
                    title="Ver discusión y comentarios en Hugging Face"
                    data-cursor="disable"
                  >
                    <SiHuggingface className="btn-icon" />
                    <span>Hugging Face</span>
                    <MdArrowOutward className="btn-arrow" />
                  </a>

                  <a
                    href={`https://arxiv.org/abs/${paper.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn action-arxiv"
                    title="Ver ficha oficial en arXiv"
                    data-cursor="disable"
                  >
                    <span>arXiv</span>
                    <MdArrowOutward className="btn-arrow" />
                  </a>

                  <a
                    href={`https://arxiv.org/pdf/${paper.id}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn action-pdf"
                    title="Descargar documento en PDF directo"
                    data-cursor="disable"
                  >
                    <FaRegFilePdf className="btn-icon" />
                    <span>PDF</span>
                    <MdArrowOutward className="btn-arrow" />
                  </a>

                  {paper.githubRepo && (
                    <a
                      href={paper.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn action-github"
                      title="Repositorio oficial en GitHub"
                      data-cursor="disable"
                    >
                      <FaGithub className="btn-icon" />
                      <span>Code</span>
                      <MdArrowOutward className="btn-arrow" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* PROGRESSIVE LOAD MORE BUTTON */}
      {hasMore && (
        <div className="papers-pagination">
          <button
            onClick={() => setVisibleCount((prev) => prev + 9)}
            className="papers-load-more-btn"
            data-cursor="disable"
          >
            Cargar más papers ({filteredPapers.length - visibleCount} restantes)
          </button>
          <button
            onClick={() => setVisibleCount(filteredPapers.length)}
            className="papers-show-all-btn"
            data-cursor="disable"
          >
            Ver todos ({filteredPapers.length})
          </button>
        </div>
      )}
    </section>
  );
};

export default DailyPapers;
