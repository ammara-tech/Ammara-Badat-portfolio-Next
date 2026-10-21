import Image from "next/image";
import { certificationGroups } from "@/content/certifications";
import { Accent, SectionTitle } from "@/components/ui";
import Icon from "@/components/Icon";
import { LightboxTrigger, type LightboxImage } from "@/components/Lightbox";

const total = certificationGroups.reduce((n, g) => n + g.certificates.length, 0);

// Every certificate in one list, so the viewer can arrow through all of them
const allCerts = certificationGroups.flatMap((g) => g.certificates);
const images: LightboxImage[] = allCerts.map((cert) => ({
  src: cert.image,
  alt: `${cert.name} certificate`,
  caption: `${cert.name} · ${cert.date}`,
}));

/** "Current certifications" list, grouped by issuer, in the v1 portfolio style. */
export default function Certifications() {
  return (
    <section id="certifications" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle>
          Current <Accent>certifications</Accent>
        </SectionTitle>
        <p className="fx-reveal flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-mist">
          <Icon name="badge" className="h-4 w-4 text-teal" />
          {total} certificates
        </p>
      </div>

      <div className="mt-6 space-y-6">
        {certificationGroups.map((group) => (
          <div key={group.issuer} className="spotlight fx-reveal rounded-xl border border-line bg-panel p-5 transition hover:border-line-strong sm:p-7">
            <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-teal">
              <span aria-hidden="true" className="inline-block h-0.5 w-5 bg-racing" />
              {group.issuer}
            </p>
            <p className="mt-1 text-sm text-mist-dim">{group.note}</p>

            <ul className="mt-4 divide-y divide-line border-t border-line">
              {group.certificates.map((cert) => (
                <li key={cert.name} className="group flex flex-wrap items-center gap-x-5 gap-y-3 py-4">
                  <LightboxTrigger
                    images={images}
                    index={allCerts.indexOf(cert)}
                    label={`View the ${cert.name} certificate`}
                    className="relative shrink-0 overflow-hidden rounded border border-line transition hover:border-teal"
                  >
                    {/* next/image sends a small thumbnail instead of the full certificate */}
                    <Image
                      src={cert.image}
                      alt=""
                      width={88}
                      height={56}
                      sizes="88px"
                      className="h-14 w-22 object-cover object-top transition duration-500 group-hover:scale-110"
                    />
                  </LightboxTrigger>

                  <div className="min-w-0 flex-1">
                    <p className="text-lg text-snow">{cert.name}</p>
                    <p className="text-sm text-mist">{cert.date}</p>
                    {cert.code && (
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-mist-dim">
                        Verification code <span className="normal-case tracking-normal text-mist">{cert.code}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <LightboxTrigger
                      images={images}
                      index={allCerts.indexOf(cert)}
                      label={`View the ${cert.name} certificate`}
                      className="inline-flex items-center gap-1.5 rounded border border-line-strong px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-teal transition hover:border-teal hover:bg-teal/10"
                    >
                      <Icon name="expand" className="h-3.5 w-3.5" />
                      View
                    </LightboxTrigger>
                    {cert.verifyUrl && (
                      <a
                        href={cert.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-line-strong px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-mist transition hover:border-teal hover:text-teal"
                      >
                        Verify ↗
                      </a>
                    )}
                    {cert.code && (
                      <a
                        href="https://verify.certiport.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-line-strong px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-mist transition hover:border-teal hover:text-teal"
                      >
                        Verify ↗
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
