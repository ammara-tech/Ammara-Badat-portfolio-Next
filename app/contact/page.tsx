import type { Metadata } from "next";
import { about } from "@/content/about";
import { Accent, Eyebrow, PageTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact — Ammara Badat",
  description: "Get in touch with Ammara Badat.",
};

export default function Contact() {
  const { email, phone, github, linkedin } = about.contact;

  const links = [
    { label: "Email", value: email, href: `mailto:${email}` },
    { label: "Phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    { label: "GitHub", value: github.replace("https://", ""), href: github },
    linkedin
      ? { label: "LinkedIn", value: linkedin.replace("https://", ""), href: linkedin }
      : { label: "LinkedIn", value: "Coming soon", href: "" },
  ];

  return (
    <section className="max-w-3xl">
      <Eyebrow>Contact</Eyebrow>
      <PageTitle>
        Let&apos;s <Accent>talk</Accent>
      </PageTitle>
      <p className="mt-5 max-w-xl text-lg text-mist">
        I&apos;m open to junior developer roles. The quickest way to reach me is by email.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.label}>
            {link.href ? (
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-panel p-5 transition hover:translate-x-1 hover:border-teal"
              >
                <span>
                  <span className="block font-mono text-xs uppercase tracking-widest text-mist">{link.label}</span>
                  <span className="mt-1 block break-all text-snow">{link.value}</span>
                </span>
                <span aria-hidden="true" className="font-mono text-racing transition group-hover:translate-x-1">
                  →
                </span>
              </a>
            ) : (
              <div className="rounded-xl border border-dashed border-line-strong p-5">
                <span className="block font-mono text-xs uppercase tracking-widest text-mist">{link.label}</span>
                <span className="mt-1 block text-mist">{link.value}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
