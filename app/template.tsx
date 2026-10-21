/*
  Page transitions. Unlike layout.tsx, a template is created fresh every time
  you move to another page, so its animations play on every page change:
  a red-to-teal stripe sweeps across the top, and the new page glides up.
  The page is never hidden while it moves, so it doesn't hurt the Lighthouse
  score. The look lives in globals.css (.fx-page and .fx-sweep).
*/
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div aria-hidden="true" className="fx-sweep" />
      <div className="fx-page">{children}</div>
    </>
  );
}
