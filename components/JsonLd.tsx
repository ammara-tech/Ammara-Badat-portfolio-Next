/*
  Puts structured data (JSON-LD) on the page for search engines.
  "<" is escaped so nothing in the data can close the <script> tag early.
*/
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
