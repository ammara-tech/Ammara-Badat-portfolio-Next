/*
  "HOW IT WORKS" — the diagram on each project's page (components/HowItWorks.tsx).
  Keyed by the project's page address (/projects/<key>). A project without an entry here
  simply has no diagram.

  Each diagram has three lanes, left to right, with a labelled arrow between each pair (one way or
  both ways). For my Firebase apps: Vercel sends the app to your device once, and from then on your
  device talks to Firebase directly. Then numbered steps that follow one action through the lanes.
  ✍️ Keep it general: no exact limits, field names or database paths (the same rule as my dev notes).
  Checked in tests/content.test.ts.
*/

export type Box = { title: string; line: string };
export type Lane = { title: string; icon: "window" | "cube" | "database"; boxes: Box[] };
export type Arrow = { label: string; bothWays: boolean };
export type Architecture = { intro: string; lanes: [Lane, Lane, Lane]; arrows: [Arrow, Arrow]; steps: string[] };

// Vercel -> your device -> Firebase
const firebaseArrows: [Arrow, Arrow] = [
  { label: "Sends the app", bothWays: false },
  { label: "Your data, both ways", bothWays: true },
];

// The parts every one of my Firebase apps shares
const device = (extra: Box[]): Lane => ({
  title: "On your phone or laptop",
  icon: "window",
  boxes: [
    { title: "The app", line: "Next.js and React pages running in the browser. It can be installed like a phone app." },
    { title: "Offline copy", line: "Firestore keeps a copy on the device, so it opens with no signal. Changes wait and send themselves later." },
    ...extra,
  ],
});
const vercel: Lane = {
  title: "Vercel",
  icon: "cube",
  boxes: [{ title: "Hosting", line: "Serves the app's pages and files. Your data never passes through it: the app talks to Firebase directly." }],
};
const firebase = (rules: string): Lane => ({
  title: "Google Firebase",
  icon: "database",
  boxes: [
    { title: "Authentication", line: "Sign in with email and a password, or with Google." },
    { title: "Cloud Firestore", line: "The database. It sends every change to your other devices within a moment." },
    { title: "Security rules", line: rules },
  ],
});

// My plain HTML, CSS and JavaScript projects: Vercel only sends the files
const staticHost: Lane = {
  title: "Vercel",
  icon: "cube",
  boxes: [{ title: "Hosting", line: "Serves the HTML, CSS and JavaScript files. There's no build step and no server code." }],
};

export const architectures: Record<string, Architecture> = {
  papertrail: {
    intro: "PaperTrail runs in the browser and saves to Firebase, so quotes and invoices sync between a phone and a laptop and still work offline.",
    lanes: [
      vercel,
      device([
        { title: "PDFs", line: "A print layout of the quote or invoice; the browser's Save as PDF makes the file." },
        { title: "Receipt photos", line: "Shrunk on the phone before they're saved, so they upload quickly on mobile data." },
      ]),
      firebase("Checked on Google's servers on every read and write: only you can see or change your business's documents."),
    ],
    arrows: firebaseArrows,
    steps: [
      "You sign in, and the app starts listening to your own documents in Firestore.",
      "You add line items. The app works out VAT and totals in cents in the browser, so the sums are exact.",
      "Saving writes to the offline copy first, so it shows straight away, then Firestore sends it to Google.",
      "Your laptop gets the change within a moment. A part payment or a reminder updates the invoice everywhere.",
      "Download PDF opens the print layout, and the browser saves it as a PDF.",
    ],
  },
  ticklist: {
    intro: "TickList is one shared list per household. Every phone listens to the same list, so a tick on one phone shows on all of them.",
    lanes: [
      vercel,
      device([{ title: "Quick add", line: "Type \"2 milk, bread\" and the app splits it into items with amounts." }]),
      firebase("Only people in a household can read or change its list, and joining needs a real invite code."),
    ],
    arrows: firebaseArrows,
    steps: [
      "You make a household and send the invite link. Joining adds only yourself, and the rules check the code.",
      "Every phone in the household listens to the same list in Firestore.",
      "You tick off the milk. The offline copy changes first, then Firestore sends it to everyone else's phone.",
      "In a shop with no signal, ticks are kept on the phone and sent when the signal is back.",
      "Chores that repeat come back by themselves on their next day.",
    ],
  },
  rememba: {
    intro: "Rememba keeps your cards and your progress in your own account, and works out on the device which cards you're about to forget.",
    lanes: [
      vercel,
      device([
        { title: "Study scheduler", line: "Spaced repetition worked out on the device: each answer moves the card's next review further away, or closer." },
        { title: "Importer", line: "Turns notes or an Anki file into cards in the browser." },
      ]),
      firebase("Only you can see your decks and progress. A shared deck can be opened with its link, but shared decks can never be listed."),
    ],
    arrows: firebaseArrows,
    steps: [
      "You sign in and your decks load from the offline copy, then update from Firestore.",
      "You study. The app picks the cards that are due today and checks typed answers, forgiving small typos.",
      "Each answer schedules the card's next review and saves your progress.",
      "Sharing a deck saves a copy of its words under a long random code. The link is that code.",
      "Whoever opens the link can add their own copy. Your progress is never shared.",
    ],
  },
  shiftboard: {
    intro: "ShiftBoard is one rota per team, where managers and staff can do and see different things, and the database enforces it.",
    lanes: [
      vercel,
      device([{ title: "Calendar file", line: "Your shifts as a file your phone's calendar can open." }]),
      firebase("Staff are never sent draft shifts, only managers see pay rates, and a clock-in time must be close to the server's own clock."),
    ],
    arrows: firebaseArrows,
    steps: [
      "A manager builds the week as drafts. Staff phones ask only for published shifts, so a draft never reaches them.",
      "Publish week makes the shifts visible, and every phone in the team updates within a moment.",
      "Staff give a shift away or ask for time off. Approving a giveaway moves the shift in one batch, so the two never get out of step.",
      "At work, staff clock in and out. The rules compare the time with Google's clock, so nobody can clock in for yesterday.",
      "Hours add up for payroll from the clocked times, and managers download them for Excel.",
    ],
  },
  hiretrack: {
    intro: "HireTrack is a private board for one person's job hunt. Reminders, emails and calendar entries go through the phone's own apps.",
    lanes: [
      vercel,
      device([
        { title: "Your email app", line: "Email them opens a follow-up already written. HireTrack never sends anything itself." },
        { title: "Your calendar", line: "Interviews download as a calendar file, so the phone does the reminding." },
      ]),
      firebase("Only you can read or change your jobs, and every saved field is checked: known values, safe links and sensible sizes."),
    ],
    arrows: firebaseArrows,
    steps: [
      "You add a job. Only the company and role are needed.",
      "You drag it to Applied. One function works out what that means: the date you applied, and a reminder a week later.",
      "When they answer, that day is saved as the day you heard back, which keeps the stats honest.",
      "The Today page lists follow-ups that are due and interviews coming up.",
      "Everything syncs to your other devices, and works offline.",
    ],
  },
  stokvelbook: {
    intro: "StokvelBook is one shared book for the whole group. Every member sees the same records live, and Google's servers make sure nobody can quietly change them.",
    lanes: [
      vercel,
      device([{ title: "Your WhatsApp", line: "Remind opens WhatsApp with a polite message already written. StokvelBook never sends anything itself." }]),
      firebase("Only members see the group. Only the chairperson and treasurer add to the money book, and nobody, not even them, can change or delete an entry."),
    ],
    arrows: firebaseArrows,
    steps: [
      "The chairperson starts the group and shares an invite link in the group's WhatsApp chat.",
      "Each month, the treasurer records who has paid. Late payments are flagged, and fines can be added in one press.",
      "Every member's phone shows the new entry within a moment, with who recorded it and when.",
      "A mistake is never edited: the treasurer cancels it with a reason, and both stay in the history for everyone to see.",
      "Payouts, votes, meeting notes and statements all come from the same shared records.",
    ],
  },
  colourcheck: {
    intro: "ColourCheck does all its maths in the browser. Nothing you check is sent anywhere, and it works offline.",
    lanes: [
      {
        title: "Vercel",
        icon: "cube",
        boxes: [{ title: "Hosting", line: "Serves the Next.js pages and files once. There's no database and no server code." }],
      },
      {
        title: "In your browser",
        icon: "window",
        boxes: [
          { title: "Contrast", line: "Works out each colour's brightness with the WCAG formula, and the ratio between them." },
          { title: "Fixes", line: "Tries every lightness in the same hue and picks the closest one that passes." },
          { title: "Colour blindness", line: "Shows each colour as people with four kinds of colour blindness would see it." },
        ],
      },
      {
        title: "Saved on your device",
        icon: "database",
        boxes: [
          { title: "Saved pairs", line: "Pairs you save stay in this browser. There are no accounts." },
          { title: "Share links", line: "The two colours live in the address, so a link opens the same pair anywhere." },
        ],
      },
    ],
    arrows: [
      { label: "Sends the app once", bothWays: false },
      { label: "Saves and loads your pairs", bothWays: true },
    ],
    steps: [
      "You type or pick two colours, in any format.",
      "The browser works out the contrast ratio and checks it against the five WCAG rules.",
      "If it fails, it finds the closest lighter or darker colour that passes, and one press uses it.",
      "You can paste a whole palette to see every pair at once, or share a link to one pair.",
    ],
  },
  cvcraft: {
    intro: "CVcraft keeps your CVs on your device and makes the PDF in the browser, so nothing about you is uploaded.",
    lanes: [
      {
        title: "Vercel",
        icon: "cube",
        boxes: [{ title: "Hosting", line: "Serves the Next.js pages and files once. There's no database and no server code." }],
      },
      {
        title: "In your browser",
        icon: "window",
        boxes: [
          { title: "The editor", line: "A form and a live preview that matches the PDF, with tips as you type." },
          { title: "The PDF", line: "Drawn with pdf-lib: real text and clickable links, fitted to one A4 page." },
        ],
      },
      {
        title: "Saved on your device",
        icon: "database",
        boxes: [
          { title: "Your CVs", line: "Every version is saved in this browser as you type. There are no accounts." },
          { title: "Backups", line: "One file holds all your CVs, to keep them safe or move them to another device." },
        ],
      },
    ],
    arrows: [
      { label: "Sends the app once", bothWays: false },
      { label: "Saves and loads your CVs", bothWays: true },
    ],
    steps: [
      "You fill in your details, or start from a finished example.",
      "The CV check suggests fixes as you type, like leaving out your ID number.",
      "In the background, the PDF is built to check that it fits on one page, making the text slightly smaller if needed.",
      "Download PDF saves a file that job sites' CV readers can read.",
    ],
  },
  "portfolio-v2-this-site": {
    intro: "This site is drawn on Vercel's servers from my projects in Supabase, and an admin area lets only me change them.",
    lanes: [
      {
        title: "In your browser",
        icon: "window",
        boxes: [
          { title: "The pages", line: "Mostly finished HTML from the server, with small pieces of React for the interactive parts." },
          { title: "/admin", line: "My dashboard: projects, the inbox and the activity log, after a password and an authenticator code." },
        ],
      },
      {
        title: "Vercel",
        icon: "cube",
        boxes: [
          { title: "Next.js server", line: "Draws each page on the server with my projects from Supabase, so it arrives ready to read." },
          { title: "Contact form route", line: "Checks a message for spam on the server, saves it, and emails me through Resend." },
        ],
      },
      {
        title: "Supabase",
        icon: "database",
        boxes: [
          { title: "PostgreSQL", line: "Projects, messages and the activity log, which database triggers write." },
          { title: "Row Level Security", line: "Visitors can only read published projects and send messages. Changes need my account and the second step." },
          { title: "Storage and Auth", line: "Project screenshots, and my sign-in with two-step codes." },
        ],
      },
    ],
    arrows: [
      { label: "Pages, and your messages", bothWays: true },
      { label: "Reads and saves, through the rules", bothWays: true },
    ],
    steps: [
      "You open a project page. The Next.js server reads the project from Supabase as a visitor, so drafts are left out.",
      "You send a message. The server route checks it for spam, saves it, and an email reaches my phone.",
      "In /admin, I sign in with a password and a code. Only then do the database's rules let me change anything.",
      "Every change is written to the activity log by the database itself, so it can't be skipped.",
      "GitHub runs the tests on every push, and Lighthouse checks the live site after Vercel deploys it.",
    ],
  },
  myflix: {
    intro: "MyFlix is a streaming-style app in plain JavaScript, with no framework and no server: the browser itself brings together free public services.",
    lanes: [
      staticHost,
      {
        title: "In your browser",
        icon: "window",
        boxes: [
          { title: "The app", line: "Plain scripts with hash routing, so pages change without reloading." },
          { title: "One title model", line: "Shows, films and anime from different services turned into one shape, so every card works with any of them." },
          { title: "My List and caching", line: "Your list, and slow lookups, saved in the browser. A service worker keeps the app and artwork for next time." },
        ],
      },
      {
        title: "Free public services",
        icon: "database",
        boxes: [
          { title: "TV, films and anime", line: "TVMaze, TMDB and AniList for the catalogue, with scores and facts from other free services." },
          { title: "Classic films", line: "Public-domain films streamed from the Internet Archive." },
          { title: "Watch parties", line: "PeerJS connects browsers directly to each other." },
        ],
      },
    ],
    arrows: [
      { label: "Sends the files", bothWays: false },
      { label: "Asks for shows and films", bothWays: true },
    ],
    steps: [
      "You open MyFlix, and Vercel sends the files. From then on, everything happens in the browser.",
      "Each row asks a free service for its titles, and they're turned into the same shape so one card fits all.",
      "Rows further down load only when you scroll to them, which stays within each service's limits.",
      "Pressing play on a classic film finds the best video on the Internet Archive and remembers it.",
      "Your list and settings are saved in the browser, so they're still there next time.",
    ],
  },
  "f1-race-hub": {
    intro: "F1 Race Hub shows live Formula 1 data from a free API, and keeps working when the API doesn't.",
    lanes: [
      staticHost,
      {
        title: "In your browser",
        icon: "window",
        boxes: [
          { title: "JavaScript modules", line: "Separate modules for the data, the state and each part of the page." },
          { title: "A short-term copy", line: "Each answer from the API is kept for 15 minutes, so pages don't ask again and again." },
          { title: "Your picks", line: "Favourite drivers, podium predictions and light or dark mode, remembered in this browser." },
        ],
      },
      {
        title: "Outside services",
        icon: "database",
        boxes: [
          { title: "Jolpica F1 API", line: "Free live standings, results and race start times." },
          { title: "A backup data file", line: "If the API is down, the site uses the last copy it fetched, then a data file it ships with." },
        ],
      },
    ],
    arrows: [
      { label: "Sends the files", bothWays: false },
      { label: "Asks for live results", bothWays: true },
    ],
    steps: [
      "You open a page, and it asks the Jolpica API for the latest standings and results.",
      "The answer is kept for 15 minutes, so moving between pages is instant.",
      "If the API can't be reached, the site falls back to its last copy, then to its own data file.",
      "Race start times are shown in your own time zone, and a race can be added to your calendar.",
      "After each race, your podium prediction is scored from the real results.",
    ],
  },
  "neon-arcade": {
    intro: "Neon Arcade is ten games in one page of plain JavaScript. Once it has loaded, it works with no connection at all.",
    lanes: [
      staticHost,
      {
        title: "In your browser",
        icon: "window",
        boxes: [
          { title: "The arcade floor", line: "A 3D cover-flow of cabinets, controlled with the keyboard or by swiping." },
          { title: "Ten games", line: "From Tic-Tac-Toe with a Minimax opponent to the Gauntlet: five games back to back." },
          { title: "Service worker", line: "Keeps a copy of every file, so it opens offline and installs like an app." },
        ],
      },
      {
        title: "Saved on your device",
        icon: "database",
        boxes: [
          { title: "Your progress", line: "Score, tickets, trophies, prizes and high scores, saved in the browser between visits." },
          { title: "Starting over", line: "Everything can be reset under Trophies, then Settings." },
        ],
      },
    ],
    arrows: [
      { label: "Sends the files once", bothWays: false },
      { label: "Saves and loads progress", bothWays: true },
    ],
    steps: [
      "The first visit downloads the arcade, and the service worker keeps a copy of every file.",
      "You pick a cabinet and a difficulty, and the game starts in the same page.",
      "Every game pays out tickets, which are added to your progress and saved straight away.",
      "Tickets are spent at the prize counter, and trophies unlock as you play.",
      "Next time, it opens from the saved copy, even with no connection.",
    ],
  },
  "fish-bones": {
    intro: "Fish-bones is an arcade game drawn on a canvas, with its own music and sound made in the browser.",
    lanes: [
      staticHost,
      {
        title: "In your browser",
        icon: "window",
        boxes: [
          { title: "The game loop", line: "Moves everything, checks collisions and redraws the canvas many times a second, for one or two players." },
          { title: "Drawings and scenery", line: "Every character and the day-to-night water drawn in code, not loaded as pictures." },
          { title: "Sound", line: "Effects and music generated with the Web Audio API." },
        ],
      },
      {
        title: "Saved on your device",
        icon: "database",
        boxes: [
          { title: "Best scores", line: "Your best score for each level." },
          { title: "Achievements and settings", line: "Unlocked characters, the daily challenge streak, volume and reduce motion." },
        ],
      },
    ],
    arrows: [
      { label: "Sends the files", bothWays: false },
      { label: "Saves scores and unlocks", bothWays: true },
    ],
    steps: [
      "You choose a character and a level. On a phone, a joystick and dash buttons appear.",
      "The game loop spawns fish, bones and predators in waves, and checks every collision.",
      "Catching fish builds combos, and power-ups like Shield and Slow-mo change the rules for a few seconds.",
      "At the end, your score is compared with your best for that level and saved.",
      "Achievements unlock new characters, which are saved for next time.",
    ],
  },
};
