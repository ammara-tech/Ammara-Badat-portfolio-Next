import { certificationGroups } from "@/content/certifications";
import { Accent, SectionTitle } from "@/components/ui";

const total = certificationGroups.reduce((n, g) => n + g.certificates.length, 0);

/** "Current certifications" list, grouped by issuer, in the v1 portfolio style. */
export default function Certifications() {
  return (
    <section id="certifications" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionTitle>
          Current <Accent>certifications</Accent>
        </SectionTitle>
        <p className="font-mono text-xs uppercase tracking-widest text-mist">{total} certificates</p>
      </div>

      <div className="mt-6 space-y-6">
        {certificationGroups.map((group) => (
          <div key={group.issuer} className="rounded-xl border border-line bg-panel p-5 sm:p-7">
            <p className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.18em] text-teal">
              <span aria-hidden="true" className="inline-block h-0.5 w-5 bg-racing" />
              {group.issuer}
            </p>
            <p className="mt-1 text-sm text-mist-dim">{group.note}</p>

            <ul className="mt-4 divide-y divide-line border-t border-line">
              {group.certificates.map((cert) => (
                <li key={cert.name} className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4">
                  <a
                    href={cert.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 overflow-hidden rounded border border-line transition hover:border-teal"
                    aria-label={`View the ${cert.name} certificate`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cert.image} alt="" loading="lazy" className="h-14 w-22 object-cover object-top" />
                  </a>

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
                    <a
                      href={cert.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded border border-line-strong px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-teal transition hover:border-teal hover:bg-teal/10"
                    >
                      View ↗
                    </a>
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
