import { useState, useEffect } from "react";
import { MdArrowOutward, MdLocationOn, MdOpenInNew } from "react-icons/md";
import "./styles/ValenciaNews.css";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ValenciaArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  category?: string;
}

// ─── RSS feed proxy via allorigins.win ───────────────────────────────────────
const FEED_URL =
  "https://api.allorigins.win/get?url=" +
  encodeURIComponent("https://valenciaplaza.com/rss");

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const strip = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const INITIAL_VISIBLE = 6;

export const ValenciaNews = () => {
  const [articles, setArticles] = useState<ValenciaArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    const CACHE_KEY = "valencia_news_cache";
    const CACHE_TTL = 30 * 60 * 1000; // 30 min

    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          setArticles(data);
          setLoading(false);
          return;
        }
      } catch {}
    }

    const controller = new AbortController();

    fetch(FEED_URL, { signal: controller.signal })
      .then((r) => r.json())
      .then((json: { contents: string }) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(json.contents, "application/xml");
        const items = Array.from(doc.querySelectorAll("item"));

        const parsed: ValenciaArticle[] = items.slice(0, 20).map((item) => ({
          title: strip(item.querySelector("title")?.textContent || "Sin título"),
          link: item.querySelector("link")?.textContent?.trim() || "#",
          pubDate: item.querySelector("pubDate")?.textContent || "",
          description: strip(
            item.querySelector("description")?.textContent || ""
          ).slice(0, 200),
          category: item.querySelector("category")?.textContent || undefined,
        }));

        setArticles(parsed);
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ data: parsed, ts: Date.now() })
        );
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError("No se pudo cargar Valencia Plaza en este momento.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const displayed = articles.slice(0, visible);
  const hasMore = visible < articles.length;

  return (
    <section className="valencia-news-section" id="valencia-news">
      {/* Header */}
      <div className="vn-header">
        <div className="vn-badge">
          <MdLocationOn className="vn-badge-icon" />
          <span>VALÈNCIA · NOTICIAS LOCALES</span>
        </div>
        <h3 className="vn-title">
          VALENCIA <span>PLAZA</span>
        </h3>
        <p className="vn-subtitle">
          Las últimas noticias de Valencia desde el referente del periodismo
          valenciano.
        </p>
        <a
          href="https://valenciaplaza.com"
          target="_blank"
          rel="noopener noreferrer"
          className="vn-source-link"
          data-cursor="disable"
        >
          valenciaplaza.com <MdOpenInNew />
        </a>
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="vn-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="vn-card vn-card-skeleton">
              <div className="vn-sk-line vn-sk-tag" />
              <div className="vn-sk-line vn-sk-title" />
              <div className="vn-sk-line vn-sk-title-short" />
              <div className="vn-sk-line vn-sk-desc" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="vn-error">
          <p>{error}</p>
          <a
            href="https://valenciaplaza.com"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="disable"
          >
            Visitar Valencia Plaza <MdArrowOutward />
          </a>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <>
          <div className="vn-grid">
            {displayed.map((art, idx) => (
              <a
                key={idx}
                href={art.link}
                target="_blank"
                rel="noopener noreferrer"
                className="vn-card"
                data-cursor="disable"
              >
                {art.category && (
                  <span className="vn-card-cat">{art.category}</span>
                )}
                <h4 className="vn-card-title">{art.title}</h4>
                {art.description && (
                  <p className="vn-card-desc">{art.description}…</p>
                )}
                <div className="vn-card-footer">
                  {art.pubDate && (
                    <span className="vn-card-date">{formatDate(art.pubDate)}</span>
                  )}
                  <span className="vn-card-arrow">
                    Leer <MdArrowOutward />
                  </span>
                </div>
              </a>
            ))}
          </div>

          {hasMore && (
            <div className="vn-load-more">
              <button
                onClick={() => setVisible((v) => v + 6)}
                className="vn-load-more-btn"
                data-cursor="disable"
              >
                Ver más noticias ({articles.length - visible} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default ValenciaNews;
