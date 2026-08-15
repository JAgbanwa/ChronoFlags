"use client";

/* Flag SVGs must remain raw same-origin images so the canvas export tools can load them. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { FLAGS, type FlagRecord } from "./flag-data";

type Shelf = "all" | "favorites" | "recent";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const FAVORITES_KEY = "chronoflags:favorites";
const RECENTS_KEY = "chronoflags:recent";

function readList(key: string) {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function flagPng(flag: FlagRecord) {
  const image = await loadImage(flag.image);
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 600;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  context.fillStyle = "#f8f4e9";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(
    image,
    (canvas.width - width) / 2,
    (canvas.height - height) / 2,
    width,
    height,
  );
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not create image"))),
      "image/png",
    ),
  );
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.trim().split(/\s+/);
  let line = "";
  let lineY = y;
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = candidate;
    }
  }
  if (line) context.fillText(line, x, lineY);
  return lineY;
}

async function compositionPng(message: string, flags: FlagRecord[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  context.fillStyle = "#0b1720";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#c6a565";
  context.fillRect(64, 54, 72, 5);
  context.font = "600 26px Arial, sans-serif";
  context.fillText("CHRONOFLAGS · HISTORICAL NOTE", 64, 105);
  context.fillStyle = "#f4ecd8";
  context.font = "54px Georgia, serif";
  const messageBottom = drawWrappedText(
    context,
    message || "A flag from another time.",
    64,
    180,
    1060,
    65,
  );

  const visibleFlags = flags.slice(0, 4);
  const top = Math.max(messageBottom + 55, 335);
  const keyWidth = 245;
  await Promise.all(
    visibleFlags.map(async (flag, index) => {
      const image = await loadImage(flag.image);
      const x = 64 + index * 268;
      context.fillStyle = "#f4ecd8";
      context.fillRect(x, top, keyWidth, 162);
      const scale = Math.min(keyWidth / image.width, 162 / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      context.drawImage(
        image,
        x + (keyWidth - width) / 2,
        top + (162 - height) / 2,
        width,
        height,
      );
      context.fillStyle = "#f4ecd8";
      context.font = "18px Arial, sans-serif";
      context.fillText(flag.shortName, x, top + 194);
    }),
  );

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not create card"))),
      "image/png",
    ),
  );
}

export function ChronoKeyboard() {
  const [query, setQuery] = useState("");
  const [shelf, setShelf] = useState<Shelf>("all");
  const [region, setRegion] = useState<"All" | FlagRecord["region"]>("All");
  const [year, setYear] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("A small piece of history:");
  const [sensitiveVisible, setSensitiveVisible] = useState(false);
  const [detail, setDetail] = useState<FlagRecord | null>(null);
  const [toast, setToast] = useState("");
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInput = useRef<HTMLInputElement | null>(null);

  const announce = (text: string) => {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  };

  useEffect(() => {
    const hydrationTimer = setTimeout(() => {
      setFavorites(readList(FAVORITES_KEY));
      setRecents(readList(RECENTS_KEY));
    }, 0);
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
    const captureInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
      if (event.key === "Escape") setDetail(null);
    };
    window.addEventListener("beforeinstallprompt", captureInstall);
    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstall);
      window.removeEventListener("keydown", handleShortcut);
      clearTimeout(hydrationTimer);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const filteredFlags = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const position = new Map(recents.map((id, index) => [id, index]));
    return FLAGS.filter((flag) => {
      const searchable = [
        flag.name,
        flag.shortName,
        flag.polity,
        flag.region,
        flag.displayYears,
        ...flag.aliases,
      ]
        .join(" ")
        .toLowerCase();
      if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;
      if (shelf === "favorites" && !favorites.includes(flag.id)) return false;
      if (shelf === "recent" && !recents.includes(flag.id)) return false;
      if (region !== "All" && flag.region !== region) return false;
      if (year !== null && (year < flag.startYear || year > flag.endYear)) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (shelf === "recent") {
        return (position.get(a.id) ?? 99) - (position.get(b.id) ?? 99);
      }
      return a.startYear - b.startYear;
    });
  }, [favorites, query, recents, region, shelf, year]);

  const selectedFlags = selected
    .map((id) => FLAGS.find((flag) => flag.id === id))
    .filter((flag): flag is FlagRecord => Boolean(flag));

  const chooseFlag = (flag: FlagRecord) => {
    if (flag.sensitive && !sensitiveVisible) {
      setSensitiveVisible(true);
      announce("Historical symbols revealed. Tap the flag again to insert it.");
      return;
    }
    setSelected((current) => [...current, flag.id].slice(-6));
    const nextRecents = [flag.id, ...recents.filter((id) => id !== flag.id)].slice(
      0,
      8,
    );
    setRecents(nextRecents);
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(nextRecents));
    announce(`${flag.shortName} added to your note.`);
  };

  const toggleFavorite = (flag: FlagRecord) => {
    const next = favorites.includes(flag.id)
      ? favorites.filter((id) => id !== flag.id)
      : [...favorites, flag.id];
    setFavorites(next);
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    announce(
      favorites.includes(flag.id)
        ? `${flag.shortName} removed from favorites.`
        : `${flag.shortName} saved to favorites.`,
    );
  };

  const install = async () => {
    if (!installPrompt) {
      announce("Open your browser menu and choose “Add to Home Screen”.");
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  };

  const copyFlag = async (flag: FlagRecord) => {
    try {
      const blob = await flagPng(flag);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      announce(`${flag.shortName} copied as an image.`);
    } catch {
      await navigator.clipboard.writeText(`${flag.name} (${flag.displayYears})`);
      announce("Image copy is unavailable here; the flag label was copied instead.");
    }
  };

  const downloadFlag = async (flag: FlagRecord) => {
    const blob = await flagPng(flag);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chronoflags-${flag.id}.png`;
    link.click();
    URL.revokeObjectURL(link.href);
    announce(`${flag.shortName} downloaded.`);
  };

  const copyNote = async () => {
    const label = selectedFlags
      .map((flag) => `${flag.name} (${flag.displayYears})`)
      .join(", ");
    await navigator.clipboard.writeText([message.trim(), label].filter(Boolean).join("\n"));
    announce("Note and flag labels copied.");
  };

  const exportNote = async (share: boolean) => {
    try {
      const blob = await compositionPng(message, selectedFlags);
      const file = new File([blob], "chronoflags-note.png", { type: "image/png" });
      if (share && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "ChronoFlags historical note",
          text: message,
          files: [file],
        });
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href);
      announce(share ? "Sharing is unavailable; the card was downloaded." : "Card downloaded.");
    } catch {
      announce("The card could not be created in this browser.");
    }
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="ChronoFlags home">
          <span className="brand-mark" aria-hidden="true">CF</span>
          <span>ChronoFlags</span>
        </a>
        <button className="install-button" type="button" onClick={install}>
          <span aria-hidden="true">↓</span> Install app
        </button>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span /> A keyboard for the historical record</p>
          <h1>History, at your <em>fingertips.</em></h1>
          <p className="hero-lede">
            Find, compose with and share carefully sourced flags from states and
            empires that no longer exist—without pretending they are Unicode emoji.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#keyboard">Open the keyboard <span>↓</span></a>
            <button type="button" className="text-action" onClick={() => setDetail(FLAGS[0])}>
              How it works
            </button>
          </div>
        </div>
        <div className="hero-index" aria-label="Catalog summary">
          <div><strong>{FLAGS.length}</strong><span>launch flags</span></div>
          <div><strong>2</strong><span>regions</span></div>
          <div><strong>1400</strong><span>earliest entry</span></div>
        </div>
      </section>

      <section className="composer" aria-labelledby="compose-title">
        <div className="section-heading">
          <div>
            <p className="step-label">01 · COMPOSE</p>
            <h2 id="compose-title">Build a historical note</h2>
          </div>
          <span className="privacy-note">Saved only on this device</span>
        </div>
        <div className="message-board">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            aria-label="Your historical note"
            maxLength={240}
          />
          <div className="selected-strip" aria-label="Flags added to note">
            {selectedFlags.length === 0 ? (
              <p>Choose a flag from the keyboard to place it here.</p>
            ) : (
              selectedFlags.map((flag, index) => (
                <div className="selected-flag" key={`${flag.id}-${index}`}>
                  <img src={flag.image} alt="" />
                  <span>{flag.shortName}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelected((current) => current.filter((_, itemIndex) => itemIndex !== index))
                    }
                    aria-label={`Remove ${flag.shortName}`}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="compose-footer">
            <span>{message.length}/240</span>
            <div>
              <button type="button" className="quiet-button" onClick={copyNote}>Copy text</button>
              <button type="button" className="quiet-button" onClick={() => void exportNote(false)}>Download card</button>
              <button type="button" className="dark-button" onClick={() => void exportNote(true)}>Share</button>
            </div>
          </div>
        </div>
      </section>

      <section className="keyboard-section" id="keyboard" aria-labelledby="keyboard-title">
        <div className="section-heading keyboard-heading">
          <div>
            <p className="step-label">02 · CHOOSE</p>
            <h2 id="keyboard-title">The Chrono keyboard</h2>
          </div>
          <p>Tap a key to add it. Use <span>ⓘ</span> for context and sources.</p>
        </div>

        <div className="keyboard-frame">
          <div className="keyboard-toolbar">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search flags</span>
              <input
                ref={searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search a state, empire or era…"
              />
              <kbd>⌘ K</kbd>
            </label>
            <div className="shelf-tabs" aria-label="Flag shelf">
              {(["all", "favorites", "recent"] as Shelf[]).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={shelf === item ? "active" : ""}
                  onClick={() => setShelf(item)}
                >
                  {item === "favorites" ? "★ Favorites" : item[0].toUpperCase() + item.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <div className="region-filter" aria-label="Region filter">
              {(["All", "Europe", "Africa"] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  className={region === item ? "active" : ""}
                  onClick={() => setRegion(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="timeline-filter">
              <button
                type="button"
                className={year === null ? "active" : ""}
                onClick={() => setYear(year === null ? 1935 : null)}
              >
                {year === null ? "All years" : "Clear year"}
              </button>
              {year !== null && (
                <label>
                  <span>Year <strong>{year}</strong></span>
                  <input
                    type="range"
                    min="1000"
                    max="2000"
                    value={year}
                    onChange={(event) => setYear(Number(event.target.value))}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flag-grid" aria-live="polite">
            {filteredFlags.map((flag) => {
              const hidden = Boolean(flag.sensitive && !sensitiveVisible);
              return (
                <article className="flag-key" key={flag.id}>
                  <button
                    type="button"
                    className="key-face"
                    onClick={() => chooseFlag(flag)}
                    aria-label={hidden ? `Reveal ${flag.shortName}` : `Add ${flag.shortName}`}
                  >
                    <span className={`flag-art${hidden ? " is-hidden" : ""}`}>
                      <img src={flag.image} alt={`${flag.name}, ${flag.displayYears}`} />
                      {hidden && <span className="sensitive-cover">Reveal historical symbol</span>}
                    </span>
                    <span className="flag-meta">
                      <span><b>{flag.shortName}</b><small>{flag.polity}</small></span>
                      <span className="key-years">{flag.displayYears}</span>
                    </span>
                  </button>
                  <div className="key-controls">
                    <button
                      type="button"
                      onClick={() => toggleFavorite(flag)}
                      aria-label={`${favorites.includes(flag.id) ? "Remove" : "Add"} ${flag.shortName} ${favorites.includes(flag.id) ? "from" : "to"} favorites`}
                      className={favorites.includes(flag.id) ? "is-favorite" : ""}
                    >
                      {favorites.includes(flag.id) ? "★" : "☆"}
                    </button>
                    <button type="button" onClick={() => setDetail(flag)} aria-label={`About ${flag.shortName}`}>ⓘ</button>
                  </div>
                </article>
              );
            })}
            {filteredFlags.length === 0 && (
              <div className="empty-state">
                <span aria-hidden="true">⌛</span>
                <h3>No flags in this slice of time</h3>
                <p>Try another year, region or search term.</p>
                <button type="button" onClick={() => { setQuery(""); setYear(null); setRegion("All"); setShelf("all"); }}>Reset filters</button>
              </div>
            )}
          </div>

          <div className="keyboard-footnote">
            <label>
              <input
                type="checkbox"
                checked={sensitiveVisible}
                onChange={(event) => setSensitiveVisible(event.target.checked)}
              />
              Show sensitive historical symbols
            </label>
            <span>Offline-ready · No account · No tracking</span>
          </div>
        </div>
      </section>

      <section className="principles" aria-labelledby="principles-title">
        <p className="step-label">03 · USE WITH CONTEXT</p>
        <div>
          <h2 id="principles-title">A visual archive,<br />not an endorsement.</h2>
          <div className="principle-list">
            <p><span>01</span><strong>Historically scoped</strong>Every flag includes dates, naming notes and a source record.</p>
            <p><span>02</span><strong>Honest about the medium</strong>These are shareable images and stickers—not new Unicode characters.</p>
            <p><span>03</span><strong>Sensitive by design</strong>Extremist and authoritarian symbols are obscured until deliberately revealed.</p>
          </div>
        </div>
      </section>

      <footer>
        <a className="brand footer-brand" href="#top"><span className="brand-mark">CF</span><span>ChronoFlags</span></a>
        <p>Flags change. Context matters.</p>
        <a href="https://github.com/JAgbanwa/ChronoFlags" target="_blank" rel="noreferrer">View the open-source project ↗</a>
      </footer>

      {detail && (
        <div className="detail-backdrop" role="presentation">
          <aside
            className="detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
          >
            <button className="detail-close" type="button" onClick={() => setDetail(null)} aria-label="Close details">×</button>
            <div className={`detail-flag${detail.sensitive && !sensitiveVisible ? " is-obscured" : ""}`}>
              <img src={detail.image} alt={`${detail.name}, ${detail.displayYears}`} />
            </div>
            <p className="detail-region">{detail.region} · {detail.displayYears}</p>
            <h2 id="detail-title">{detail.name}</h2>
            <p className="detail-summary">{detail.summary}</p>
            <div className="context-box">
              <strong>Context note</strong>
              <p>{detail.context}</p>
            </div>
            <dl>
              <div><dt>Polity</dt><dd>{detail.polity}</dd></div>
              <div><dt>Image rights</dt><dd>{detail.license}</dd></div>
            </dl>
            <a className="source-link" href={detail.sourcePage} target="_blank" rel="noreferrer">View source record ↗</a>
            <div className="detail-actions">
              <button type="button" onClick={() => void copyFlag(detail)}>Copy image</button>
              <button type="button" onClick={() => void downloadFlag(detail)}>Download PNG</button>
              <button type="button" className="dark-button" onClick={() => { chooseFlag(detail); setDetail(null); }}>Add to note</button>
            </div>
          </aside>
        </div>
      )}

      <div className={`toast${toast ? " is-visible" : ""}`} role="status" aria-live="polite">{toast}</div>
    </main>
  );
}
