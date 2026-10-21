/*
  ✍️ DEV NOTES — short posts about things I built and learned.

  Each note is a list of blocks: a paragraph ("p"), a sub-heading ("h2"),
  a bullet list ("ul"), a code sample ("code") or a highlighted tip ("tip").
  To add a note, copy one of the objects below, give it a new slug and put it
  at the top of the list (newest first). The page, the sitemap, the RSS feed
  and the Ctrl+K search all pick it up automatically.

  These are drafts — read them and change anything so it sounds like me.
*/

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; lang: string; code: string }
  | { type: "tip"; text: string };

export type Note = {
  slug: string;
  title: string;
  description: string; // one or two sentences, shown on the list and in Google
  date: string; // YYYY-MM-DD
  tags: string[];
  body: Block[];
};

export const notes: Note[] = [
  {
    slug: "lighthouse-74-to-96",
    title: "How I took my Lighthouse score from 74 to 96",
    description:
      "My portfolio scored 100 for accessibility and SEO but only 74 for performance on mobile. The problem was my own animations.",
    date: "2026-10-21",
    tags: ["Performance", "Lighthouse", "Next.js"],
    body: [
      {
        type: "p",
        text: "Lighthouse is a free tool in Chrome that tests a web page and gives it scores out of 100. When I ran it on my portfolio as a phone, Accessibility, Best Practices and SEO were all 100, but Performance was only 74.",
      },
      { type: "h2", text: "What the report said" },
      {
        type: "ul",
        items: [
          "Largest Contentful Paint (when the biggest piece of content appears): 3.4 seconds",
          "Speed Index (how fast the page looks finished): 5.1 seconds",
          "Total Blocking Time (how long JavaScript stops the page from responding): 550 ms",
        ],
      },
      {
        type: "p",
        text: "The surprising part: my page actually showed up in 1.5 seconds. The problem was my entrance animations. My heading and intro started at opacity 0 and faded in, and my code card typed itself out over about two seconds. To Lighthouse, invisible content is content that hasn't loaded yet.",
      },
      { type: "h2", text: "What I changed" },
      {
        type: "ul",
        items: [
          "The heading and intro now slide up a few pixels but are visible from the very first frame.",
          "The code card types in about twice as fast.",
          "The Ctrl+K search, the image viewer and the mouse-glow effect now load just after the page appears, instead of with it.",
          "I only download the two heading font weights I actually use, instead of four.",
        ],
      },
      {
        type: "code",
        lang: "css",
        code: `/* Before: hidden until the animation finishes */
@keyframes fx-rise {
  from { opacity: 0; transform: translateY(18px); }
}

/* After: always visible, it just slides into place */
@keyframes fx-enter {
  from { transform: translateY(14px); }
}`,
      },
      {
        type: "p",
        text: "Performance went from 74 to 88, and then to 96 on a clean run in an Incognito window, because browser extensions slow Lighthouse down. The site looks the same; it just stops hiding itself.",
      },
      {
        type: "tip",
        text: "Lesson: an animation can make a fast page look slow to a test. Animate where things move, not whether they can be seen.",
      },
    ],
  },
  {
    slug: "contact-form-without-captcha",
    title: "Stopping spam on my contact form without a CAPTCHA",
    description:
      "How I protect my portfolio's contact form with a hidden honeypot field, a timing check and a rate limit inside the database.",
    date: "2026-10-21",
    tags: ["Security", "Supabase", "Forms"],
    body: [
      {
        type: "p",
        text: "A public contact form is an open door for spam bots. The usual fix is a CAPTCHA (the \"I'm not a robot\" puzzle), but those annoy real people. I wanted protection that visitors never notice.",
      },
      { type: "h2", text: "Layer 1: a honeypot" },
      {
        type: "p",
        text: "The form has an extra field called \"website\" that people can't see or reach with the keyboard. Bots fill in every field they find, so if that field has anything in it, my API route quietly throws the message away but still answers \"sent\", so the bot doesn't learn anything.",
      },
      { type: "h2", text: "Layer 2: too fast to be human" },
      {
        type: "p",
        text: "The form remembers when it was opened. A message sent less than three seconds later is almost certainly a bot, so it gets the same quiet treatment.",
      },
      { type: "h2", text: "Layer 3: a rate limit in the database" },
      {
        type: "p",
        text: "This is the one that can't be skipped, because it runs inside Supabase itself, not in my website code. A trigger checks every new message before it is saved:",
      },
      {
        type: "ul",
        items: [
          "at most 3 messages per email address every 10 minutes",
          "at most 3 per visitor every 10 minutes (I store a one-way hash of the IP address, never the IP itself)",
          "at most 30 messages an hour in total",
        ],
      },
      {
        type: "code",
        lang: "sql",
        code: `if recent_from_sender >= 3 then
  raise exception 'Too many messages. Please try again in a few minutes.'
    using errcode = 'P0001';
end if;`,
      },
      {
        type: "p",
        text: "My API route turns that error into a friendly \"please try again\" message with the HTTP status 429 (Too Many Requests).",
      },
      { type: "h2", text: "And who can read the messages?" },
      {
        type: "p",
        text: "Row Level Security (database rules for who can see each row) lets anyone add a message, but only my account can read, mark as read or delete them. I tested it: a visitor can send a message, but asking the database for messages gives them an empty list.",
      },
      {
        type: "tip",
        text: "Lesson: put the rule that must never be skipped as close to the data as possible.",
      },
    ],
  },
  {
    slug: "row-level-security-explained",
    title: "Row Level Security: letting the database say no",
    description:
      "My admin page can add, edit and delete projects, but only for my account. Here's how Supabase Row Level Security makes sure of it, and how I proved it.",
    date: "2026-10-21",
    tags: ["Supabase", "RLS", "Security"],
    body: [
      {
        type: "p",
        text: "My Projects page loads from a Supabase database, and my /admin page lets me add, edit and delete projects. The key that connects my site to Supabase is public (anyone can find it in the browser), so the website alone can't be trusted to keep people out. The database has to do it.",
      },
      { type: "h2", text: "What Row Level Security does" },
      {
        type: "p",
        text: "Row Level Security (RLS) is a set of rules on a table. Once it is switched on, the database refuses everything unless a rule (a \"policy\") allows it. I wrote four policies for my projects table:",
      },
      {
        type: "ul",
        items: [
          "Anyone can read projects (they're on my public site).",
          "Only my account can add a project.",
          "Only my account can edit a project.",
          "Only my account can delete a project.",
        ],
      },
      {
        type: "code",
        lang: "sql",
        code: `create policy "Owner can add projects"
  on public.projects for insert
  to authenticated
  with check ((select auth.uid()) = 'my-user-id'::uuid);`,
      },
      {
        type: "p",
        text: "auth.uid() is the ID of whoever is signed in. If it isn't mine, the database says no, even if someone copies my site's code and sends the request themselves.",
      },
      { type: "h2", text: "How I proved it" },
      {
        type: "p",
        text: "I opened my live site as a visitor, opened the browser console and tried to change the database directly with the public key:",
      },
      {
        type: "ul",
        items: [
          "Adding a project failed with error 42501 (\"new row violates row-level security policy\").",
          "Editing and deleting didn't fail loudly — they just changed nothing and returned an empty list, because the visitor can't \"see\" any rows to change.",
          "Signed in as me, all three worked.",
        ],
      },
      {
        type: "p",
        text: "That second point caught me out at first. My admin page now checks whether any rows came back, and shows \"Nothing was saved. You may not have permission\" instead of pretending it worked.",
      },
      {
        type: "tip",
        text: "Lesson: test security as the person you're trying to keep out, not just as yourself.",
      },
    ],
  },
];

export function findNote(slug: string) {
  return notes.find((n) => n.slug === slug) ?? null;
}

/** About how long a note takes to read, at 200 words a minute */
export function readingMinutes(note: Note) {
  const text = note.body
    .map((b) => (b.type === "ul" ? b.items.join(" ") : b.type === "code" ? b.code : b.text))
    .join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

/** "2026-10-21" -> "21 October 2026" */
export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}
