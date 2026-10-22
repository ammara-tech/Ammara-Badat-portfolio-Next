"use client";

/*
  Last-resort error page, used only if the main layout itself fails.
  It can't use the site's layout or Tailwind, so it has its own simple styles.
*/
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#15151e",
          color: "#f5f5f7",
          fontFamily: "system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <main style={{ maxWidth: "28rem" }}>
          <p style={{ color: "#27f4d2", letterSpacing: "0.18em", textTransform: "uppercase", fontSize: "0.75rem" }}>
            Something went wrong
          </p>
          <h1 style={{ fontSize: "2.5rem", margin: "0.5rem 0 1rem", textTransform: "uppercase" }}>
            Pit <span style={{ color: "#ff3b5c" }}>stop.</span>
          </h1>
          <p style={{ color: "#9497a6", lineHeight: 1.6 }}>The site couldn&apos;t load just now. Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              background: "#e8002d",
              color: "#fff",
              border: 0,
              borderRadius: "0.25rem",
              padding: "0.75rem 1.25rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
