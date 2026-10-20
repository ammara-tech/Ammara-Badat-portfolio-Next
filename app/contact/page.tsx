import type { Metadata } from "next";
import { about } from "@/content/about";
import ContactForm from "@/components/ContactForm";
import Icon, { type IconName } from "@/components/Icon";
import { Accent, Eyebrow, PageTitle, btnGhost } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact — Ammara Badat",
  description: "Send Ammara Badat a message, or download her CV.",
};

type ContactLink = { label: string; value: string; href: string; icon: IconName };

export default function Contact() {
  const { email, phone, github, linkedin, cv } = about.contact;

  const links: ContactLink[] = [
    { label: "Email", value: email, href: `mailto:${email}`, icon: "mail" },
    { label: "Phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}`, icon: "phone" },
    { label: "GitHub", value: github.replace("https://", ""), href: github, icon: "github" },
    linkedin
      ? { label: "LinkedIn", value: linkedin.replace("https://", ""), href: linkedin, icon: "linkedin" }
      : { label: "LinkedIn", value: "Coming soon", href: "", icon: "linkedin" },
  ];

  const availability = about.lookingFor.find((item) => item.toLowerCase().includes("available")) ?? about.status;

  return (
    <section>
      <Eyebrow>Contact</Eyebrow>
      <PageTitle>
        Let&apos;s <Accent>talk</Accent>
      </PageTitle>
      <p className="fx-rise mt-5 max-w-xl text-lg text-mist" style={{ animationDelay: "180ms" }}>
        I&apos;m open to junior developer roles. Send me a message below, or reach me directly.
      </p>

      <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.35fr]">
        {/* Left: direct links and CV */}
        <div className="fx-rise space-y-4" style={{ animationDelay: "260ms" }}>
          <p className="flex items-start gap-2 font-mono text-xs uppercase leading-5 tracking-widest text-teal">
            <Icon name="map-pin" className="mt-0.5 h-4 w-4" />
            <span>
              {about.location} · {availability}
            </span>
          </p>

          <ul className="space-y-3">
            {links.map((link) => (
              <li key={link.label}>
                {link.href ? (
                  <a
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group flex items-center gap-4 rounded-xl border border-line bg-panel p-4 transition duration-300 hover:-translate-y-0.5 hover:border-teal hover:shadow-[0_0_40px_-18px_rgb(39_244_210/0.5)]"
                  >
                    <span className="rounded-lg border border-line-strong p-2.5 text-mist transition group-hover:border-teal/50 group-hover:text-teal">
                      <Icon name={link.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-xs uppercase tracking-widest text-mist">{link.label}</span>
                      <span className="mt-0.5 block break-all text-snow">{link.value}</span>
                    </span>
                    <Icon
                      name={link.href.startsWith("http") ? "arrow-up-right" : "arrow-right"}
                      className="h-4 w-4 text-teal transition-transform group-hover:translate-x-1"
                    />
                  </a>
                ) : (
                  <div className="flex items-center gap-4 rounded-xl border border-dashed border-line-strong p-4">
                    <span className="rounded-lg border border-line p-2.5 text-mist">
                      <Icon name={link.icon} className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-mono text-xs uppercase tracking-widest text-mist">{link.label}</span>
                      <span className="mt-0.5 block text-mist">{link.value}</span>
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-racing/40 bg-linear-to-br from-panel to-panel-alt p-5">
            <p className="font-display text-xl font-black uppercase">My CV</p>
            <p className="mt-1 text-sm text-mist">One page: skills, projects, certifications and education.</p>
            <a href={cv} download className={`${btnGhost} mt-4`}>
              <Icon name="download" className="h-4 w-4" />
              Download CV (PDF)
            </a>
          </div>
        </div>

        {/* Right: the contact form */}
        <div className="fx-rise" style={{ animationDelay: "340ms" }}>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
