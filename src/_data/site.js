export default {
  title: "Iławski Instytut Idei",
  shortTitle: "instytut.14-200.pl",
  url: "https://instytut.14-200.pl",
  lang: "pl",
  description:
    "Iławski Instytut Idei – edukacja przyrodnicza, biologia syntetyczna i otwarte pracownie eksperymentu w Iławie.",
  email: "instytutidei@gmail.com",
  address: {
    street: "ul. Królowej Jadwigi 18B",
    postalCode: "14-200",
    locality: "Iława",
    country: "Polska",
  },
  logo: "/assets/icon.svg",
  // Link preview image for pages without their own `image` (front matter).
  ogImage: "/assets/og-default.png",

  // Registration data shown in the footer.
  legal: {
    register: "Ewidencji Stowarzyszeń Zwykłych Starosty Powiatu Iławskiego",
    entry: "OSO.512.3.2021",
    nip: "744-18-28-909",
    regon: "520470170",
  },

  // rel="me" identities – shown in the footer h-card and used for IndieAuth / Mastodon verification.
  me: [
    { name: "Facebook", url: "https://www.facebook.com/ilawski.instytut.idei" },
  ],

  // IndieWeb: receive webmentions via webmention.io (sign in once at https://webmention.io with this domain).
  webmention: {
    endpoint: "https://webmention.io/instytut.14-200.pl/webmention",
    pingback: "https://webmention.io/instytut.14-200.pl/xmlrpc",
  },

  // ActivityPub / Fediverse: the account @instytut@14-200.pl on the 14-200.pl hub (GoToSocial).
  // Plan: ~/Projects/14-200.pl/docs/plan-instytut.md. The 14-200.pl project does not use Bridgy Fed.
  //   active: false – the account does not exist yet; the site shows "w przygotowaniu" and no fediverse meta.
  //   active: true  – rel="me" + fediverse:creator point to the account.
  fediverse: {
    active: true,
    handle: "@instytut@14-200.pl",
    profile: "https://social.14-200.pl/@instytut",
  },

  // Two strands of the institute. Pages opt in with `area: "lab"` / `area: "pracownia"` in front matter.
  areas: {
    lab: {
      name: "Laboratorium",
      kind: "pracownia biologiczna",
      url: "/laboratorium/",
      text: "Edukacyjne laboratorium biologii: biologia syntetyczna, genomika i badania terenowe w iławskich lasach i wodach.",
    },
    pracownia: {
      name: "Pracownia politechniczna",
      kind: "technika · budowanie · eksperyment",
      url: "/pracownia/",
      text: "Nowy pomysł: wspólny warsztat, w którym można budować, naprawiać, programować i mierzyć. Otwarty dla każdego, kto chce coś zrobić własnymi rękami.",
    },
  },

  // AI use policy (/polityka-ai/). A page or post opts in with `ai: redakcja | wspolpraca | generowane`
  // in front matter (optional `ai_note` says what exactly AI did); a notice is then prepended to its content.
  // Single fragments inside a human-written text: {% ai "what AI did" %}…{% endai %}.
  ai: {
    policy: "/polityka-ai/",
    levels: {
      redakcja: {
        label: "AI: redakcja",
        text: "Tekst napisał człowiek. Narzędzie AI pomogło w korekcie, skrótach lub tłumaczeniu.",
      },
      wspolpraca: {
        label: "AI: współpraca",
        text: "Część tekstu powstała z pomocą narzędzia AI. Człowiek zaplanował treść, sprawdził ją i poprawił.",
      },
      generowane: {
        label: "AI: tekst wygenerowany",
        text: "Tekst w większości napisało narzędzie AI na podstawie ludzkich założeń. Człowiek go sprawdził i odpowiada za treść.",
      },
    },
  },

  nav: [
    { url: "/laboratorium/", label: "Laboratorium", area: "lab" },
    { url: "/pracownia/", label: "Pracownia", area: "pracownia" },
    { url: "/aktualnosci/", label: "Aktualności" },
    { url: "/projekty/", label: "Projekty" },
    { url: "/o-nas/", label: "O nas" },
    { url: "/kontakt/", label: "Kontakt" },
    { url: "/english/", label: "EN", lang: "en" },
  ],
};
