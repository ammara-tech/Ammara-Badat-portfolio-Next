/*
  The Share button (components/ShareButton.tsx) on project pages, the case study and
  dev notes. On phones it opens the phone's own share sheet (the Web Share API), so
  people can pick WhatsApp, LinkedIn, email or anything else they have. On a laptop it
  shows these links instead. Nothing is sent anywhere until the visitor chooses.
  Tested in tests/content.test.ts.
*/

export type ShareLink = { name: "LinkedIn" | "WhatsApp" | "Email"; href: string; newTab: boolean };

/** Links that open LinkedIn, WhatsApp or an email with the page already filled in */
export function shareLinks(url: string, title: string): ShareLink[] {
  const u = encodeURIComponent(url);
  return [
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, newTab: true },
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, newTab: true },
    {
      name: "Email",
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`I thought you'd like this:\n${url}`)}`,
      newTab: false,
    },
  ];
}

/** True when the phone's share sheet is the better choice: a touch screen that supports it */
export function prefersNativeShare(nav: { share?: unknown } | undefined, coarsePointer: boolean) {
  return Boolean(nav && typeof nav.share === "function" && coarsePointer);
}
