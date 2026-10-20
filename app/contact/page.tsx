import type { Metadata } from "next";
import { about } from "@/content/about";
import Icon, { type IconName } from "@/components/Icon";
import { Accent, Eyebrow, PageTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact — Ammara Badat",
  description: "Get in touch with Ammara Badat.",
};

type ContactLink = { label: string; value: string; href: string; icon: IconName };

export default function Contact() {
  const { email, phone, github, linkedin } = about.contact;

  const links: ContactLink[] = [
    { label: "Email", value: email, href: `mailto:${email}`, icon: "mail" },
    { label: "Phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}`, icon: "phone" },
    { label: "GitHub", value: github.replace("https://", ""), href: github, icon: "github" },
    linkedin
      ? { label: "LinkedIn", value: linkedin.replace("https://", ""), href: linkedin, icon: "linkedin" }
      : { label: "LinkedIn", value: "Coming soon", href: "", icon: "linkedin" },
  ];

  return (
    <section className="max-w-3xl">
      <Eyebrow>Contact</Eyebrow>
      <PageTitle>
        Let&apos;s <Accent>talk</Accent>
      </PageTitle>
      <p className="fx-rise mt-5 max-w-xl text-lg text-mist" style={{ animationDelay: "180ms" }}>
        I&apos;m open to junior developer roles. The quickest way to reach me is by email.
      </p>

      <p
        className="fx-rise mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-teal"
        style={{ animationDelay: "240ms" }}
      >
        <Icon name="map-pin" className="h-4 w-4" />
        {about.location} · {about.lookingFor.find((item) => item.toLowerCase().includes("available")) ?? about.status}
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {links.map((link, i) => (
          <li key={link.label} className="fx-rise" style={{ animationDelay: `${320 + i * 90}ms` }}>
            {link.href ? (
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-center gap-4 rounded-xl border border-line bg-panel p-5 transition duration-300 hover:-translate-y-0.5 hover:border-teal hover:shadow-[0_0_40px_-18px_rgb(39_244_210/0.5)]"
              >
                <span className="rounded-lg border border-line-strong p-2.5 text-mist transition group-hover:border-teal/50 group-hover:text-teal">
                  <Icon name={link.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-xs uppercase tracking-widest text-mist">{link.label}</span>
                  <span className="mt-1 block break-all text-snow">{link.value}</span>
                </span>
                <Icon
                  name={link.href.startsWith("http") ? "arrow-up-right" : "arrow-right"}
                  className="h-4 w-4 text-racing transition-transform group-hover:translate-x-1"
                />
              </a>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-dashed border-line-strong p-5">
                <span className="rounded-lg border border-line p-2.5 text-mist-dim">
                  <Icon name={link.icon} className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-mono text-xs uppercase tracking-widest text-mist">{link.label}</span>
                  <span className="mt-1 block text-mist">{link.value}</span>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
