/*
  MY CERTIFICATIONS — shown on the About page and used as evidence on the Skills page.
  The certificate images live in public/certificates/.
  I only show my Certiport industry certifications: they're exams with a verification
  code, so an employer can check them.

  Certiport certificates expire 5 years after the date they were awarded.
  The verification codes are printed on the certificates so employers can check them
  at verify.certiport.com.
*/

export type Certificate = {
  name: string;
  date: string; // shown under the name
  image: string; // path in /public
  code?: string; // verification code, if the certificate has one
  verifyUrl?: string; // a direct verification link, if the issuer gives one
};

export type CertificateGroup = {
  issuer: string;
  note: string;
  certificates: Certificate[];
};

export const certificationGroups: CertificateGroup[] = [
  {
    issuer: "Certiport · Information Technology Specialist",
    note: "Industry certifications from Pearson VUE, verifiable at verify.certiport.com",
    certificates: [
      {
        name: "HTML and CSS",
        date: "Current through August 26, 2031",
        image: "/certificates/certiport-html-css.jpg",
        code: "nXWb-DwVk",
      },
      {
        name: "HTML5 Application Development",
        date: "Current through August 28, 2031",
        image: "/certificates/certiport-html5-app-dev.jpg",
        code: "wEMsY-48J7",
      },
      {
        name: "Software Development",
        date: "Current through September 1, 2031",
        image: "/certificates/certiport-software-development.jpg",
        code: "hsen-4wbK",
      },
      {
        name: "JavaScript",
        date: "Current through September 4, 2031",
        image: "/certificates/certiport-javascript.jpg",
        code: "wBUmw-2Fv4",
      },
    ],
  },
];

/** Quick lookup so the Skills page can link to a certificate image by its file name */
export function certificateLink(file: string, label: string) {
  return { label: `Certificate: ${label}`, href: `/certificates/${file}.jpg` };
}
