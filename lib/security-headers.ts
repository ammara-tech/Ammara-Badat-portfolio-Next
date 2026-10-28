/*
  Security headers: extra instructions sent with every page that tell the
  browser to be stricter. They're added to every address in next.config.ts
  and checked in tests/security.test.ts.

  Anyone can see these (they're in every response), so listing them here
  gives nothing away. Each one switches a browser protection ON.
*/

export type Header = { key: string; value: string };

export const securityHeaders: Header[] = [
  // Don't guess a file's type: a file sent as text is never run as a script
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Other sites can't show my pages inside a frame (stops "clickjacking",
  // where a page is hidden under a fake button). Older browsers read this one...
  { key: "X-Frame-Options", value: "DENY" },

  // ...and newer browsers read frame-ancestors below. The other rules:
  // base-uri: nobody can change where relative links point
  // form-action: forms can only send to my own site
  // object-src: no old plugins (Flash and similar)
  // There's no script-src rule on purpose: Next.js, my theme script and Vercel
  // Analytics need inline scripts, and a wrong rule would quietly break the site.
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },

  // When a visitor clicks a link to another site, only send my domain, not the full address
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Features my site never uses are switched off, so nothing on it can ask for them
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },

  // A page I open in a new tab can't reach back into mine through window.opener
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },

  // Always use https for my site for the next two years, even if someone types http://
  // (browsers ignore this on http://localhost, so local development still works)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];
