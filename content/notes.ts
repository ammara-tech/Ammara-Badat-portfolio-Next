/*
  ✍️ DEV NOTES — short posts about things I built and learned.

  Each note is a list of blocks: a paragraph ("p"), a sub-heading ("h2"),
  a bullet list ("ul"), a code sample ("code") or a highlighted tip ("tip").
  To add a note, copy one of the objects below, give it a new slug and put it
  at the top of the list (newest first). The page, the sitemap, the RSS feed
  and the Ctrl+K search all pick it up automatically.

  These are drafts — read them and change anything so it sounds like me.
*/

import { slugify } from "@/lib/slug";

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
  date: string; // YYYY-MM-DD, when I published it
  updated?: string; // YYYY-MM-DD, only if I changed the note on a later day (shown as "Updated ...")
  tags: string[];
  body: Block[];
};

export const notes: Note[] = [
  {
    slug: "a-money-book-nobody-can-quietly-change",
    title: "A money book nobody can quietly change",
    description:
      "StokvelBook keeps a stokvel's records where every member can see them. The key to trusting it: entries can be added, but never edited or deleted.",
    date: "2026-11-10",
    tags: ["Firebase", "Security", "Testing"],
    body: [
      {
        type: "p",
        text: "A stokvel runs on trust. Members hand over money every month, and usually one person, the treasurer, keeps the record in a notebook or a WhatsApp chat. If a payment goes missing from the record, it's one person's word against another's. So when I built StokvelBook, the most important feature wasn't a page. It was a rule: once something is in the money book, nobody can change it.",
      },
      { type: "h2", text: "Only ever adding" },
      {
        type: "p",
        text: "Payments, payouts, fines and corrections are all entries in one list. My Firebase security rules let the chairperson and treasurer add an entry, always in their own name and stamped with the real time, and then refuse every edit and every delete, from anyone. Not even the chairperson can tidy the past.",
      },
      {
        type: "p",
        text: "Mistakes still happen, so the fix is another entry: a correction that points at the wrong one and needs a reason. The rules check that it points at a real entry for the same member and amount. In the history, the wrong entry is crossed out with the reason next to it. Everyone can see what was fixed, by whom and why, which is exactly what a treasurer's notebook can't show.",
      },
      { type: "h2", text: "One function for every total" },
      {
        type: "p",
        text: "Because entries are never changed, every total is worked out from the list itself: one function leaves out corrections and the entries they cancel, and the balances, the payout turns and the statements all start from that. So the totals can never disagree with the history. My tests check it with made-up groups: a payment recorded twice and cancelled, a member who's behind with a fine, and turns paid out in order.",
      },
      {
        type: "ul",
        items: [
          "Roles: the chairperson runs the group, the treasurer keeps the book, and members see everything and vote.",
          "Members without a smartphone can be added by name, so the whole group is in the book.",
          "Remind on WhatsApp opens a polite message already written, so it comes from someone the member knows, and costs nothing.",
          "Deleting a whole group is still possible, but only by a chairperson, and only after marking it as being deleted.",
        ],
      },
      {
        type: "tip",
        text: "Lesson: if people need to trust a record, don't make editing safer. Make editing unnecessary, and keep every correction visible.",
      },
    ],
  },
  {
    slug: "two-apps-with-no-database",
    title: "Two apps with no database: ColourCheck and CVcraft",
    description:
      "Not every app needs accounts. A contrast checker and a CV builder that do everything in the browser: free to run, offline, and private.",
    date: "2026-11-10",
    tags: ["Next.js", "Accessibility", "Testing"],
    body: [
      {
        type: "p",
        text: "After six apps with Firebase, I built two with no database at all. ColourCheck checks whether text is easy to read, and CVcraft makes a one-page CV. Neither needs to know who you are, so neither asks: everything happens in the browser.",
      },
      { type: "h2", text: "ColourCheck: a fix, not just a fail" },
      {
        type: "p",
        text: "Most contrast checkers just say pass or fail. ColourCheck works out each colour's brightness with the WCAG formula, and if a pair fails, it tries every lightness of the same hue and suggests the closest one that passes, so the fix still looks like your colour. My tests check it against known answers: black on white is 21:1, and one particular grey is the lightest that passes on white. I also made sure a ratio like 4.496 is shown as 4.49, never rounded up to 4.50 next to a fail.",
      },
      { type: "h2", text: "CVcraft: a PDF made on your phone" },
      {
        type: "p",
        text: "A CV holds personal details, so CVcraft keeps it in the browser and makes the PDF there too, with pdf-lib, the same library I use for my own CV on this site. The PDF has real text that job sites can read, and it's fitted to one A4 page: if it's a little too long, the text gets slightly smaller before a second page is allowed. The tests build real PDFs and read them back to check the page count and the links.",
      },
      {
        type: "ul",
        items: [
          "Both work offline and install like apps.",
          "Saved work stays on the device. CVcraft can download a backup file to move your CVs to another phone or laptop.",
          "CVcraft's tips warn people to leave out their ID number and date of birth, which employers don't need.",
          "Known gap: without accounts, saved work lives in one browser until you move it.",
        ],
      },
      {
        type: "tip",
        text: "Lesson: ask what an app really needs to store, and where. If the answer is \"nothing, on a server\", leaving the database out makes it simpler, free and more private.",
      },
    ],
  },
  {
    slug: "try-the-demo-without-an-account",
    title: "Letting people try my apps without making an account",
    description:
      "Recruiters rarely make accounts, so my five Firebase apps now have a Try the demo button: a guest account, example data, and one press to delete it all.",
    date: "2026-11-09",
    tags: ["Firebase", "Security", "UX"],
    body: [
      {
        type: "p",
        text: "Every one of my Firebase apps starts with a sign-in screen. That's right for the people who use them, but it's a wall for someone looking at my portfolio for two minutes. Nobody wants to make an account just to see what a rota app does. So I added a Try the demo button to PaperTrail, TickList, Rememba, ShiftBoard and HireTrack, and a matching button on each of their project pages here.",
      },
      { type: "h2", text: "A guest is still a real account" },
      {
        type: "p",
        text: "The demo uses Firebase's anonymous sign-in. One press, and Firebase gives the visitor their own account with no email or password. The part I like most is that I didn't have to change a single security rule. My rules already say \"you can only see your own data\", and a guest has their own ID like anyone else, so a demo is protected in exactly the same way. Two guests trying the demo at the same time can't see each other's examples.",
      },
      { type: "h2", text: "Filling it with examples, once" },
      {
        type: "p",
        text: "An empty app doesn't show much, so the first time a guest has nothing saved, the app fills it with examples: a café with staff and a rota in ShiftBoard, a plumbing business with an overdue invoice in PaperTrail, a household with a shopping list in TickList. PaperTrail's dates are worked out from today, so its demo always has something due, overdue and paid. A small note on the device remembers that the examples were added, so a guest who deletes them doesn't get them back on the next refresh.",
      },
      { type: "h2", text: "Ending a demo, and what the rules taught me" },
      {
        type: "p",
        text: "End the demo deletes everything the guest saved, then the guest account itself. Writing that, I found that in three apps my rules only allowed the profile to be written, never deleted, so a batch that tried to delete it would have failed completely. Instead of loosening the rules, the demo empties the profile. In ShiftBoard I learned something else: the rules check a batch against the database as it was before the batch. So the made-up staff have to be saved first, on their own, before their shifts, because the rules check that a shift's person is in the team.",
      },
      {
        type: "ul",
        items: [
          "Each app's sign-in screen moves the demo box to the top when it's opened from my portfolio's button.",
          "A strip at the top says it's a demo the whole time, so nobody mistakes it for their real data.",
          "Signing out as a guest ends the demo, so nothing is left behind by accident.",
          "Known gap: a guest who just closes the tab leaves their examples in the database. It's small, but nothing cleans it up yet.",
        ],
      },
      {
        type: "tip",
        text: "Lesson: when you add a new way to sign in, check it against the rules you already have. If the rules are about whose data it is, not how they signed in, the new way is protected for free.",
      },
    ],
  },
  {
    slug: "a-guestbook-that-spam-cant-take-over",
    title: "A guestbook that spam can't take over",
    description:
      "Visitors can now leave a message on my site. Nothing shows until I approve it, and most of the protection lives in the database, where it can't be skipped.",
    date: "2026-11-09",
    tags: ["Supabase", "Security", "Testing"],
    body: [
      {
        type: "p",
        text: "A guestbook is a friendly way for visitors to say hello. It's also an open door for spam, and anything a stranger writes on my site reflects on me. So I built it in layers, with the most important ones in the database.",
      },
      { type: "h2", text: "Nothing shows until I approve it" },
      {
        type: "p",
        text: "Every new entry is saved as waiting. Not because the form says so: a database trigger sets it, whatever is sent, so even someone calling the database directly can't post something straight onto the page. The guestbook page reads as a visitor, and Row Level Security only gives visitors approved entries. Approving, hiding and deleting are only allowed for my account with its second sign-in step, and I do them from my admin area.",
      },
      { type: "h2", text: "Hiding one column from everyone" },
      {
        type: "p",
        text: "To slow down someone posting again and again, each entry keeps a one-way hash of the visitor's IP address, never the address itself. But approved entries are public, and Row Level Security works on whole rows. I didn't want the hash to be readable with the rest of the row. The answer was column rights: visitors are only allowed to read the name, message and date columns. Asking for the hash is refused, even on an approved entry.",
      },
      { type: "h2", text: "The spam checks" },
      {
        type: "ul",
        items: [
          "A hidden field that people never see but bots fill in, and a check that the form wasn't sent impossibly fast. Bots are told it worked, so they don't learn what gave them away.",
          "No links allowed, in the name or the message, because links are what spam is for.",
          "A limit in the database on how many entries one visitor can post in a few minutes, and on how many arrive in an hour.",
        ],
      },
      { type: "h2", text: "Proving it" },
      {
        type: "p",
        text: "My database tests run every setup file in a real PostgreSQL database and then act as a visitor, a signed-in stranger and me. I added fifteen checks for the guestbook: who can sign it, read it, approve it and delete it, that a new entry can't approve itself, that the hash stays hidden, and that the limit works.",
      },
      {
        type: "tip",
        text: "Lesson: Row Level Security decides which rows someone can see. When part of a row is private, column rights decide which parts.",
      },
    ],
  },
  {
    slug: "how-it-works-diagrams-and-a-status-page",
    title: "Showing how my apps work, and whether they're up",
    description:
      "A How it works diagram on ten project pages, built from HTML instead of pictures, and a status page that checks whether every one of my live sites is up.",
    date: "2026-11-09",
    tags: ["Next.js", "Accessibility", "Testing"],
    body: [
      {
        type: "p",
        text: "Screenshots show what an app looks like. They don't show how it works, and that's what I'd want to know if I were hiring. So ten of my project pages now have a How it works diagram, and a new status page shows that all my sites are actually running.",
      },
      { type: "h2", text: "Diagrams made of HTML, not pictures" },
      {
        type: "p",
        text: "Each diagram has three lanes with labelled arrows between them, then numbered steps that follow one action through the lanes. I built them from ordinary HTML boxes instead of drawing images. They fit a phone (the lanes stack and the arrows point down), they follow light and dark mode, and a screen reader reads them as text, which a picture of a diagram can't do. The words live in one content file, and a test checks that they stay general, with no database paths in them.",
      },
      {
        type: "p",
        text: "Drawing them made me be precise. My first version put Vercel in the middle, with arrows from the phone through Vercel to Firebase. That's wrong for my Firebase apps: Vercel only sends the app once, and after that the phone talks to Firebase directly. The diagram now says exactly that. For my plain JavaScript projects, the third lane is the free services the browser talks to, or the progress it saves on the device.",
      },
      { type: "h2", text: "A status page that checks itself" },
      {
        type: "p",
        text: "The status page asks every site in my projects list for its home page, all at the same time, and times the answer: up, slow or down. The list comes from my projects in the database, so a new app is checked without me editing anything. Next.js keeps the result for a few minutes, so the sites aren't asked on every visit. The check takes its fetch function as an argument, so the tests can pass in a fake one and check up, slow and down without the internet.",
      },
      {
        type: "ul",
        items: [
          "Each site's card also shows its Lighthouse scores, but only the ones I've actually measured, with the date.",
          "Other new pages: For recruiters (me in 60 seconds), My journey, a Now page, and By the numbers on the Home page, where every number is counted from real data.",
        ],
      },
      {
        type: "tip",
        text: "Lesson: if a diagram could be text, build it from text. It's easier to keep correct, and everyone can read it.",
      },
    ],
  },
  {
    slug: "building-hiretrack-job-hunt-board",
    title: "Building HireTrack: my job hunt on one board",
    description:
      "My fifth Firebase app, built for my own job hunt: a board from Saved to Offer, follow-up reminders, interview prep, and stats that stay honest.",
    date: "2026-11-08",
    tags: ["Firebase", "Next.js", "Accessibility"],
    body: [
      {
        type: "p",
        text: "I'm about to start looking for my first developer job, and I could already see the problem: applications on LinkedIn, PNet and company websites, and no single place that says where each one stands. It's easy to forget to follow up, or to walk into an interview without having looked the company up. So I built HireTrack for myself first.",
      },
      {
        type: "p",
        text: "It's a board with five columns: Saved, Applied, Interview, Offer and Closed. Each job has a page with its details, a follow-up reminder, interviews, interview prep and which CV I sent. A Today page lists what needs doing, and a Stats page shows how the job hunt is going.",
      },
      { type: "h2", text: "One function decides what a move means" },
      {
        type: "p",
        text: "Moving a card changes more than its column. Moving it to Applied fills in the date I applied and sets a reminder to follow up a week later. The first answer after applying (an interview, an offer, or a no) is saved as the day I heard back. Once they answer, the automatic reminder goes. Instead of spreading these rules across the screens, they all live in one plain function that takes the job and the new stage and returns what changes. That made them easy to test: every kind of move has its own test.",
      },
      { type: "h2", text: "Keeping the stats honest" },
      {
        type: "p",
        text: "I wanted the response rate to mean something. \"They said no\" counts as hearing back, but \"no reply\" doesn't, so closing a job asks why it closed. A job that had an interview and then closed still counts as reaching an interview, because each job keeps its story of when it moved. And everything counts from the day I applied, so jobs I've only saved don't make the rates look worse.",
      },
      { type: "h2", text: "Drag and drop that isn't the only way" },
      {
        type: "p",
        text: "Dragging cards between columns feels natural with a mouse, but it doesn't work with a keyboard, and it's clumsy on a phone. So every card also has a small Move to box, and on a phone the stages become tabs showing one column at a time. When a card is dropped between two others, it gets an order number halfway between theirs, so only that one card is saved, not the whole column.",
      },
      { type: "h2", text: "Using what ShiftBoard taught me" },
      {
        type: "p",
        text: "In ShiftBoard, editing a shift would have been refused because the form sent back fields it didn't own. This time I started with that lesson: every form on a job's page sends its changes through one function that keeps only the fields that form is allowed to change, trims the text and checks links and dates. The security rules check the same things on Google's servers, so only links starting with http or https can be saved.",
      },
      {
        type: "ul",
        items: [
          "Follow-up emails: Email them opens my own email app with a polite message already written, so HireTrack never sends anything itself.",
          "CVs as links: it keeps each CV version's name and a link to where the file lives, not the file, which keeps it free and private.",
          "Interviews go into my phone's calendar, so the phone does the reminding.",
          "Example jobs with made-up companies let anyone try every part, and one press removes them.",
        ],
      },
      {
        type: "tip",
        text: "Lesson: when a feature has rules, like what applying or hearing back means, put them in one plain function. The screens get simpler, and the tests can check every case without a database.",
      },
    ],
  },
  {
    slug: "building-shiftboard-staff-rotas",
    title: "Building ShiftBoard: a staff rota that lives on everyone's phone",
    description:
      "My fourth Firebase app: a staff rota with drafts staff can't see, private pay rates, clocking in that can't be backdated, and a bug my test page missed.",
    date: "2026-11-07",
    tags: ["Firebase", "Next.js", "Security"],
    body: [
      {
        type: "p",
        text: "At a lot of small cafés and salons, the rota is a photo of a whiteboard sent to a WhatsApp group. If someone swaps a shift, the photo is out of date and nobody knows which version is right. ShiftBoard is a rota for a small team: the manager builds the week and publishes it, staff see their shifts on their phone, give a shift away or ask for time off, and the hours add up for payroll.",
      },
      {
        type: "p",
        text: "I started from my TickList app, which already had sign-in, invite links and live updates between phones. What was new was that people in the same team have different jobs: a manager can do things a barista can't, and some things a barista shouldn't even see.",
      },
      { type: "h2", text: "Drafts that staff can't see" },
      {
        type: "p",
        text: "A manager builds the week as drafts and presses Publish week when it's ready, so staff don't see a half-finished rota and plan around it. Hiding drafts on the screen isn't enough, because the data still reaches the phone. So the security rules on Google's servers refuse to send a draft to anyone who isn't a manager.",
      },
      {
        type: "p",
        text: "That changed how the app asks for shifts. Firestore checks the question, not each answer: if a staff member's phone asks for \"all of this team's shifts\", the whole request is refused, because it could include drafts. Staff phones ask only for published shifts, which the rules can see is safe.",
      },
      { type: "h2", text: "Pay rates in a separate place" },
      {
        type: "p",
        text: "Managers can add each person's pay per hour to get a pay estimate. Firestore's rules give access to a whole record or none of it, never to part of one. If the rates were kept with the rest of the team's details, every member could read everyone's pay. So the rates are kept in their own record that only managers can open, and staff see their hours without any amounts.",
      },
      { type: "h2", text: "Times without time zones" },
      {
        type: "p",
        text: "A shift is saved as a day and two clock times, like 8:00 to 16:00, not as a moment in time. A shift at 8:00 should say 8:00 on every phone, even one set to another time zone. Weeks run Monday to Sunday, and a shift from 22:00 to 6:00 ends the next morning, with its hours still counted on the day it starts. The tests run these sums for weeks that cross a month and a year.",
      },
      { type: "h2", text: "Clocking in that can't be backdated" },
      {
        type: "p",
        text: "From half an hour before a shift, a Clock in button appears, then Clock out. Hours then use the real times, and arriving late is noted. A phone's clock can be set to any time, so the rules compare the time the phone sends with the server's own clock, and refuse it if they're far apart. Nobody can clock in for yesterday. If someone forgets to clock out, a manager corrects it in the shift editor.",
      },
      { type: "h2", text: "The bug my test page couldn't see" },
      {
        type: "p",
        text: "I test the screens on a page with made-up data and no real database, so I can try every situation quickly. On that page, editing a shift worked. On the real site, it would have been refused. The form sent back the whole shift, including details it doesn't own, like whether it's published and when it was made, and the rules only let the editor change the shift's person, day, times, break and note. Now the form sends only what it owns, and I check every save against the rules, not just my test page.",
      },
      {
        type: "ul",
        items: [
          "Staff added by name: a manager can put someone on the rota before they've joined, then link them up when they join, and their shifts move to their account.",
          "When you can't work: everyone adds the times they can't work each week, and the rota warns in red if they're booked then.",
          "A notice board: managers post a short notice and can see who's pressed Got it.",
          "It works with no signal, installs on a phone, and scored 99 to 100 on Lighthouse when I checked it.",
        ],
      },
      {
        type: "tip",
        text: "Lesson: a test page without the real security rules can only tell you the screen works. Whether a save is allowed is decided by the rules, so check every save against them.",
      },
    ],
  },
  {
    slug: "checking-every-page-with-axe",
    title: "Checking every page of my site with axe",
    description:
      "An accessibility tool ran on every page of my live site, in dark and light mode. It found four problems, and while fixing one I found a bug it couldn't see.",
    date: "2026-11-05",
    tags: ["Accessibility", "Testing", "Next.js"],
    body: [
      {
        type: "p",
        text: "Lighthouse gives my site 100 for accessibility, but Lighthouse only looks at the pages I point it at. Before I hand in my final project I wanted every page checked: every project, every dev note, the CV, the 404 page and the sign-in screen for my admin page.",
      },
      { type: "h2", text: "How I ran it" },
      {
        type: "p",
        text: "axe is a free accessibility checker made by Deque, and it's what Lighthouse uses inside. I loaded it into my live site in the browser, then moved from page to page using Next.js's own navigation, so one visit could check every address in my sitemap. I ran the whole list in dark mode, then again in light mode, at phone width.",
      },
      { type: "h2", text: "What it found" },
      {
        type: "ul",
        items: [
          "The counting numbers on the About page (\"10+ technologies\") gave a label to a plain span. Screen readers are allowed to ignore a label on an element with no role, so some would read nothing. Now the final number is written once in hidden text that screen readers read, and the counting animation is hidden from them.",
          "The \"role I want\" card on the About page was an aside inside the main content. An aside is meant for a sidebar, so screen readers announced it as a separate area. It's now an ordinary part of the page.",
          "On the Projects and Notes pages, the number inside the selected filter button was faded to 70%. White at 70% on my racing red is only 2.7:1, well below the 4.5:1 that small text needs. The number is now full white on the selected button and stays faded on the others.",
          "In light mode, the small \"Takeaway\" label at the end of a dev note was 4.2:1, just under the line. It now uses a slightly darker teal in light mode only.",
        ],
      },
      { type: "h2", text: "The bug axe couldn't see" },
      {
        type: "p",
        text: "While fixing the counting numbers I read the code again and found that \"2026\" was being counted up to 202 with a \"6\" stuck on the end. It ended on the right number, so it looked fine, but the code said years should never count. The pattern allowed up to three digits followed by anything, and \"6\" counted as anything. Now it only counts when the number is followed by something that isn't a digit, and a test checks \"2026\" stays as it is.",
      },
      { type: "h2", text: "One false alarm" },
      {
        type: "p",
        text: "On the admin sign-in screen axe reported grey text that was too faint, but only in light mode. I had just switched the theme, and the phone navigation bar fades its colours over a moment. axe measured it halfway through the fade. Run again a second later, the page passed.",
      },
      {
        type: "tip",
        text: "Lesson: an automatic checker finds problems I can't see by looking, like a label screen readers ignore. But it checks what's on screen, not what the code means, so I still read the code, and I check a result again before trusting it.",
      },
    ],
  },
  {
    slug: "papertrail-expenses-and-stock",
    title: "PaperTrail learns expenses and stock",
    description:
      "My invoicing app now keeps receipts, works out profit and VAT owed, and tracks stock that invoices take off, without paying for any extra service.",
    date: "2026-11-05",
    tags: ["Firebase", "Next.js", "Testing"],
    body: [
      {
        type: "p",
        text: "PaperTrail started as quotes and invoices for small South African businesses. A plumber also needs to know what they spent, whether they made a profit, what they owe SARS, and whether there's a geyser element left on the shelf. This week I added Expenses and Stock.",
      },
      { type: "h2", text: "Expenses without paying for file storage" },
      {
        type: "p",
        text: "Each expense can have a photo of the receipt. Firebase's file storage now needs a paid plan, and I wanted PaperTrail to stay free, so the phone makes the photo small first and saves it as text in the database instead. Receipt photos are kept apart from the list of expenses and only loaded when you open one, so the list stays quick.",
      },
      {
        type: "p",
        text: "From the expenses and the invoices, PaperTrail works out profit, and for VAT-registered businesses the VAT owed: VAT on invoices minus the VAT that can be claimed on receipts. It covers this month, last month, the two-month VAT period and the tax year, and it's labelled as a guide, not tax advice.",
      },
      { type: "h2", text: "Stock that can't be taken off twice" },
      {
        type: "p",
        text: "The obvious way to track stock is to save a number and subtract from it every time you invoice. But then editing an invoice, deleting one, or two phones saving at the same time can all take stock off twice, or not at all. So PaperTrail doesn't save how many are left. It saves how many there were when you last counted, and works out what's left from the invoices made since then.",
      },
      {
        type: "ul",
        items: [
          "Edit an invoice from 4 tins to 7, and 3 more come off. Delete it, and they come back.",
          "Quotes don't take stock off. Turning a quote into an invoice does.",
          "A delivery adds to the count. Counting the shelf starts a new count from that moment.",
          "Items running low are listed first, and the Overview shows a warning.",
        ],
      },
      {
        type: "p",
        text: "On an invoice line, \"From your stock\" fills in the name and price and says how many will be left, or warns you if you don't have enough. The tests cover editing, deleting, duplicating, quotes becoming invoices and part quantities like 0.1 litres.",
      },
      {
        type: "tip",
        text: "Lesson: if a number can be worked out from data you already keep, work it out instead of saving it. A saved total can drift from the truth, but one you work out every time can't.",
      },
    ],
  },
  {
    slug: "a-cv-that-updates-itself",
    title: "A CV that updates itself",
    description:
      "My CV page and my CV PDF used to be written twice. Now the PDF is built from the same words, and new projects from my admin page appear on both by themselves.",
    date: "2026-11-04",
    tags: ["Next.js", "Supabase", "Testing"],
    body: [
      {
        type: "p",
        text: "My portfolio has a CV page and a PDF to download. They said the same things, but I wrote them separately: the page from a file of my words, the PDF by hand. Every change meant changing both, and the PDF had already fallen behind. It said nothing about my newest projects.",
      },
      { type: "h2", text: "One set of words, two outputs" },
      {
        type: "p",
        text: "Now the PDF is built by code, from the same file as the page, using a library called pdf-lib. It draws the page the way a person would: my name, my contact details, then each section, measuring every line so the text wraps before the edge of the paper. The text is real text, not a picture, so job sites that read CVs automatically can read mine, and every link (email, GitHub, each project's live site and code) can be clicked.",
      },
      {
        type: "p",
        text: "The PDF lives at the same address as the old one, so every Download button on my site still works. Next.js builds it when the site deploys and keeps it ready, so downloading it is as fast as downloading a normal file.",
      },
      { type: "h2", text: "New projects appear by themselves" },
      {
        type: "p",
        text: "My main projects have bullet points I wrote carefully. Everything else I've published in my admin page is now added under \"More projects\": one line each, with the first sentence of its summary and its links. When I publish a new project, it appears on my CV page and in the PDF within ten minutes, without me touching any code.",
      },
      {
        type: "p",
        text: "The tricky part was not listing a project twice. My capstone is called \"Next.js Dashboard\" in my admin page but \"Family Clinic Platform\" on my CV, so matching titles wouldn't work. Instead, a project counts as already on my CV if its live site or code address matches one of the links there, after ignoring differences like https, www and a slash at the end.",
      },
      { type: "h2", text: "Keeping it on one page" },
      {
        type: "ul",
        items: [
          "With five extra projects it first spilled onto a second page, so I tightened the spacing until it fit, with room for a couple more.",
          "A long summary is cut at a whole word with \"…\", so each extra project stays on one line.",
          "Helvetica, the font built into every PDF reader, can't draw some characters, like curly quotes. Those are swapped for plain ones, so a stray character can't break the whole PDF.",
          "Tests check that it's one A4 page even with five extra projects, has my name as its title, and links to every project and contact on my CV.",
        ],
      },
      {
        type: "tip",
        text: "If the same information lives in two places, one of them will go out of date. Keep it in one place and build everything else from it.",
      },
    ],
  },
  {
    slug: "why-my-phone-lighthouse-score-moves",
    title: "100 on a laptop, 91 to 100 on a phone: why my Lighthouse score moves",
    description:
      "My portfolio scores 100 for everything on a laptop. On a phone, Performance lands anywhere from 91 to 100. Why that happens, and how I show it honestly.",
    date: "2026-11-03",
    tags: ["Lighthouse", "Performance", "Mobile"],
    body: [
      {
        type: "p",
        text: "My footer has a Lighthouse badge. It used to show one row of scores, from a phone test. Now it shows two: a phone and a laptop. On a laptop, my Home page scores 100 for Performance, Accessibility, Best Practices and SEO. On a phone, the last three are always 100, but Performance comes out anywhere from 91 to 100 (I've seen 100 once, on 6 November), even when I run it twice in a row without changing anything.",
      },
      { type: "h2", text: "A phone test is a slow phone on purpose" },
      {
        type: "p",
        text: "Lighthouse doesn't use your real phone. It pretends to be a mid-range phone on a slow 4G connection, with the processor slowed down about four times. The laptop test uses a fast connection and no slowdown. That's deliberate: plenty of people visit websites on cheap phones and patchy data, and a site that's fast there is fast everywhere.",
      },
      {
        type: "p",
        text: "Because the phone test multiplies every delay, tiny differences count. If my site's server answers a little slower on one run, or the computer running the test is busy, that becomes a much bigger difference after the slowdown. On a laptop, the same small delay is too small to change the score.",
      },
      { type: "h2", text: "Why only Performance moves" },
      {
        type: "ul",
        items: [
          "Performance is made from timings: how soon something appears, how soon the biggest thing appears, how long the page is too busy to respond, and whether things jump around. Timings change a little on every run, so the score does too.",
          "Accessibility, Best Practices and SEO are checklists: does every image have alt text, can the text be read against its background, does the page have a title. A check passes or fails the same way every time, so those scores don't move.",
        ],
      },
      { type: "h2", text: "Showing it honestly" },
      {
        type: "p",
        text: "It would be easy to run the phone test until it says 100 and show only that. Instead the badge shows a real recent result, and its hover text says the phone Performance score is usually between 91 and 100. My README has the same range, with a real screenshot from each device, cropped to the same size, with the site's address at the top so it's clear which site was tested.",
      },
      {
        type: "tip",
        text: "Run Lighthouse three times and look at the middle score, not the best one. And only compare a phone score with a phone score: a laptop 100 and a phone 95 don't mean the phone version is broken.",
      },
    ],
  },
  {

    slug: "share-time-ago-and-duplicate",
    title: "Share, \"2 days ago\" and Duplicate: three small features",
    description:
      "Three small additions to my portfolio and admin page, and the details that made each one work properly on phones, for screen readers and with tricky links.",
    date: "2026-11-03",
    tags: ["UX", "Accessibility", "Admin"],
    body: [
      {
        type: "p",
        text: "Today was three small features. None of them took long to make work, but each had one detail that decided whether it worked well, and those details are what this note is about.",
      },
      { type: "h2", text: "1. A Share button that acts like the device" },
      {
        type: "p",
        text: "Project pages and dev notes already had Copy link. Now they have Share too. On a phone it opens the phone's own share sheet, through the Web Share API, so people can pick WhatsApp, LinkedIn or anything else they have installed. On a laptop the built-in share window is less useful, so the button opens a small menu with LinkedIn, WhatsApp and Email links instead.",
      },
      {
        type: "code",
        lang: "ts",
        code: "// The phone's share sheet only on touch screens that support it\nif (navigator.share && matchMedia(\"(pointer: coarse)\").matches) {\n  await navigator.share({ title, url });\n} else {\n  setOpen(true); // LinkedIn, WhatsApp and Email links\n}",
      },
      {
        type: "ul",
        items: [
          "Closing the share sheet without sharing throws an error in the browser. That isn't a real error, so the button ignores it.",
          "Every address is encoded before it goes into a share link. Without that, a & in the address would cut the link short. A test checks this.",
          "The menu works with a keyboard: it moves focus to the first link, and Escape closes it and puts focus back on the button.",
        ],
      },
      { type: "h2", text: "2. \"2 days ago\" instead of a timestamp" },
      {
        type: "p",
        text: "My admin inbox showed the full date and time on every message. \"2 days ago\" is quicker to read, so messages now say \"just now\", \"5 min ago\", \"yesterday\" or \"2 days ago\", and show the date after a week, with the year only if it's a different year. The exact time is still there when you hover, in a <time> element a computer can read too. The words update every 30 seconds, so \"just now\" doesn't stay \"just now\" all afternoon. My activity log already had a simpler version of this, so I moved it into one shared helper and both use it now.",
      },
      { type: "h2", text: "3. Duplicate project" },
      {
        type: "p",
        text: "Adding a project that's similar to another one meant typing everything again. Now Duplicate copies a project into the Add form as \"Copy of …\", or \"Copy of … (2)\" if that name is taken. Nothing is saved until I press Add project, and the copy starts as a draft, so a half-finished copy can never appear on my site by accident. The database rule that hides drafts already existed, so this is safe without any new security work.",
      },
      {
        type: "p",
        text: "The detail here was a phone screen. The extra button pushed Delete onto a second line, which looked messy. On phones the button now says \"Copy\" instead of \"Duplicate\". For screen readers I didn't use an aria-label, because the name a screen reader hears should include the words you can see. So each size reads its own visible word plus the project's name: \"Copy Rememba\" on a phone, \"Duplicate Rememba\" on a laptop.",
      },
      {
        type: "tip",
        text: "For a small feature, the working version is quick. Spend the extra time on the edges: a phone, a keyboard, a screen reader, and the strange input, like an address with a & in it.",
      },
    ],
  },
  {
    slug: "two-warnings-from-github",
    title: "Two warnings from GitHub: a moved test machine and a fake secret",
    description:
      "In two days, my browser tests broke without me changing anything, and a secret scanner flagged a password in my code. What each one taught me.",
    date: "2026-11-02",
    tags: ["GitHub Actions", "Security", "Testing"],
    body: [
      {
        type: "p",
        text: "Two things went red this week that had nothing to do with my site's code. Neither was serious, but both were the kind of thing that's easy to ignore and shouldn't be.",
      },
      { type: "h2", text: "1. My browser tests broke, but I hadn't changed them" },
      {
        type: "p",
        text: "My browser tests run on a GitHub machine after every push. On Sunday they failed before testing anything, at the step that installs the test browser: \"Playwright does not support chromium on ubuntu26.04\". My workflow asked for ubuntu-latest, and GitHub had just moved \"latest\" to a newer version of Ubuntu that my version of Playwright didn't know yet.",
      },
      {
        type: "code",
        lang: "yaml",
        code: "jobs:\n  browser-tests:\n    # Before: runs-on: ubuntu-latest (it changes when GitHub decides)\n    runs-on: ubuntu-24.04 # a fixed version, so it only changes when I change it",
      },
      {
        type: "p",
        text: "\"Latest\" sounds safe, but it means something different on different days. A test that fails because the machine changed tells you nothing about your code, so now my workflows ask for a fixed version. The catch is that I have to move it forward myself one day, on purpose, when Playwright supports the newer one.",
      },
      { type: "h2", text: "2. A secret scanner found a \"password\"" },
      {
        type: "p",
        text: "A few minutes after I pushed my new database tests, GitGuardian emailed me: \"Generic Password\" detected in my repo. My heart dropped for a second. Then I checked the commit. The \"password\" was the word postgres, for the empty test database GitHub creates for about a minute and then deletes. It didn't protect anything real: my Supabase keys and email key are only in Vercel and my own computer, never in the code.",
      },
      {
        type: "p",
        text: "It was a false alarm, but I still removed it, because a repo where scanners shout about harmless things trains you to ignore them. That throwaway database can only be reached from inside the test run, so it doesn't need a password at all, and now it doesn't have one. Then I marked the alert as a false positive.",
      },
      {
        type: "ul",
        items: [
          "Check before you panic: open the exact commit and line the scanner points to.",
          "Ask what the value actually unlocks. A real key or password must be changed straight away, because deleting it from the code doesn't remove it from the history.",
          "If it unlocks nothing, still make the warning go away properly, so the next real one stands out.",
        ],
      },
      {
        type: "tip",
        text: "Treat a red warning you didn't expect as information, not noise. Both of mine took minutes to understand and fix, and both would have been easy to ignore until they mattered.",
      },
    ],
  },
  {
    slug: "testing-my-database-rules-automatically",
    title: "Testing my database rules automatically",
    description:
      "My tests checked the website's code but not the rules that protect my data. How I turned hand-made security checks into 65 automatic ones on GitHub.",
    date: "2026-11-02",
    tags: ["Security", "Testing", "GitHub Actions"],
    body: [
      {
        type: "p",
        text: "The most important security on my site isn't in the website at all. It's in the database: row level security decides who can read my messages, see my drafts or change my projects, even if someone skips my website and talks to the database directly. Until now I checked those rules by hand. My 129 automatic tests covered the site's code, and the rules that matter most were the one thing they couldn't reach.",
      },
      { type: "h2", text: "A throwaway database on GitHub" },
      {
        type: "p",
        text: "Testing on my real database was never an option, because a test that checks \"can a visitor delete a project?\" could actually delete one if the rule was wrong. So every time a database file changes, GitHub starts a brand new, empty Postgres database that only exists for that run. It loads all my setup files in order, then loads them a second time, because each one says it's safe to run twice and now that's tested too. Then it runs the checks, and the database is thrown away.",
      },
      {
        type: "p",
        text: "My rules use a few things that only exist on Supabase, like the function that says who is signed in. So the run first loads a small stand-in for those parts. The most important part of it copies something Supabase does: the website's database roles are allowed to use every table by default, and only my rules stop them. If the stand-in was stricter than Supabase, my tests could pass for the wrong reason.",
      },
      { type: "h2", text: "Four people, 65 checks" },
      {
        type: "ul",
        items: [
          "A visitor, who isn't signed in: can see published projects and send a message, and nothing else.",
          "Someone else's account, fully signed in: gets exactly what a visitor gets. Being signed in isn't enough.",
          "My account with only the password, like someone who guessed it: can't read or change anything private.",
          "Me with my authenticator code too: can do everything, except fake or delete history entries and read the stored backup codes. Not even I can do those.",
        ],
      },
      {
        type: "p",
        text: "There are also checks for the spam limit and my backup codes: a code works once, typed any way, removes only my authenticator, and too many wrong guesses lock out further tries.",
      },
      {
        type: "code",
        lang: "sql",
        code: "-- Pretend to be someone, the same way the website's database connection does\nselect test.become('visitor');\n\n-- Try something, undo it straight after, and record what happened\nselect test.check('can''t read messages', 'select * from <messages>', 'blocked');\nselect test.check('can send a message', 'insert into <messages> ...', '1');",
      },
      {
        type: "p",
        text: "Every check runs inside a small transaction that is always undone, even when it works. So the owner deleting a project in one check doesn't leave one fewer project for the next check, and every check starts from the same data.",
      },
      { type: "h2", text: "Testing the tests" },
      {
        type: "p",
        text: "A security test that always passes is worse than none, because it makes you feel safe. So I broke my own rules on purpose. When I removed the two-step check, 11 checks failed, all for \"my account with only the password\". When I let visitors read messages, exactly one check failed: \"a visitor can't read messages\". Both times the run went red, and green again when I put the rules back.",
      },
      { type: "h2", text: "What it still can't catch" },
      {
        type: "p",
        text: "It's a stand-in, not Supabase itself. Yesterday Supabase refused a delete in my backup codes that had passed on my local copy, because Supabase has a safety rule my stand-in doesn't. Tests on a copy can only find the problems the copy is able to have, so I've listed that under Known gaps instead of pretending the tests cover everything.",
      },
      {
        type: "tip",
        text: "Before you trust a security test, make it fail. Break the rule it protects and check the right test goes red.",
      },
    ],
  },
  {
    slug: "three-apps-to-100-on-lighthouse",
    title: "Getting three Firebase apps to 100 on Lighthouse",
    description:
      "PaperTrail, TickList and Rememba scored in the 70s and 80s on phones. What was slowing them down, the fix that made it worse first, and how they reached 100.",
    date: "2026-11-01",
    tags: ["Lighthouse", "Performance", "Firebase"],
    body: [
      {
        type: "p",
        text: "My portfolio already scores 99 to 100 on Lighthouse, so I ran it on my three Firebase apps too. On a laptop they were fine. On a phone, performance was 83 for Rememba, 78 for TickList and 84 for PaperTrail, and two of them lost points for accessibility. Lighthouse tests phones as a mid-range phone on slow 4G, so small delays get much bigger.",
      },
      { type: "h2", text: "Problem 1: the sign-in screen waited for Firebase" },
      {
        type: "p",
        text: "All three apps showed a loading screen until Firebase had checked whether you were signed in, and only then drew the sign-in screen. For a new visitor that meant about 4 seconds of a spinning logo on a slow phone. Now the server sends the sign-in screen straight away. A small note saved on the device says whether someone has signed in there before. If so, the page shows the loading screen instead while Firebase checks, so a returning user never sees the sign-in screen flash. It's only a hint for what to show first: Firebase still decides who is signed in.",
      },
      { type: "h2", text: "The fix that made it worse" },
      {
        type: "p",
        text: "After that change, Rememba's phone score went down, from 84 to 74. The page looked faster, but Lighthouse said nothing appeared for 4.4 seconds. Instead of guessing, I opened the report's network dependency tree, which shows which downloads the first paint waits for. At the end of the chain was a 93 KB file from Firebase's own servers: the helper for Google's sign-in window, downloaded the moment the page opened.",
      },
      { type: "h2", text: "Problem 2: Google's sign-in helper loaded on every visit" },
      {
        type: "p",
        text: "Firebase's usual getAuth() sets up that helper straight away on phones, even if the person never presses Continue with Google. So I set up sign-in without it, and only hand it over when the button is pressed. Email sign-in and staying signed in work exactly as before.",
      },
      {
        type: "code",
        lang: "ts",
        code: "// Before: getAuth(app) also loads Google's sign-in helper on phones\nconst auth = initializeAuth(app, {\n  persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],\n});\n\n// Only when someone presses \"Continue with Google\":\nsignInWithPopup(auth, provider, browserPopupRedirectResolver);",
      },
      { type: "h2", text: "The accessibility points" },
      {
        type: "ul",
        items: [
          "The sign-in screens had no main landmark, so a screen reader couldn't jump to the form. The form's area is now a <main>.",
          "Some text on the example cards was too faint: an orange \"12-day streak\" was 2.9 to 1 against its card, under the 3 to 1 needed for large text, and a light blue time stamp was under 2 to 1. Both are darker now.",
        ],
      },
      { type: "h2", text: "The results" },
      {
        type: "p",
        text: "On a phone, TickList and PaperTrail now score 100 for performance, accessibility, best practices and SEO, and Rememba scores 96 to 99 for performance and 100 for the rest. On a laptop all three score 100 or close to it. The first screen on a phone now appears in under a second instead of about four.",
      },
      {
        type: "tip",
        text: "When a fix makes a score worse, don't undo it straight away. Read what the report says the page is waiting for. Mine was waiting for a file nobody had asked for yet.",
      },
    ],
  },
  {
    slug: "backup-codes-for-two-step-sign-in",
    title: "Backup codes: a way back in if I lose my phone",
    description:
      "Two-step sign-in protects my admin page, but a lost phone could lock me out. How I added one-time backup codes, stored like passwords.",
    date: "2026-11-01",
    tags: ["Security", "Supabase", "Testing"],
    body: [
      {
        type: "p",
        text: "My admin page needs a password and a 6-digit code from an authenticator app on my phone. That stops someone who guesses my password, but it had a weak spot I listed under Known gaps: if I lost my phone, the only way back in was through the Supabase dashboard. Big sites solve this with backup codes, so I built them.",
      },
      { type: "h2", text: "What I built" },
      {
        type: "ul",
        items: [
          "A Backup codes panel on my dashboard makes 10 codes, each 8 characters, like 7KQM-3XPA. They're shown once, with Download and Copy buttons, and I keep them somewhere that isn't my phone.",
          "If the phone is lost, I sign in with my password and choose \"Lost your phone? Use a backup code\". A correct code removes the old authenticator, and the page shows a new QR code for my new phone.",
          "Each code works once. Making a new set stops the old ones working, and the dashboard warns me when only a few are left.",
        ],
      },
      { type: "h2", text: "Treat them like passwords" },
      {
        type: "p",
        text: "A backup code is as powerful as my phone, so it must never be stored where someone could read it. The database keeps only a bcrypt hash of each code, the same way passwords are stored. When I enter a code, the database hashes it again and compares the hashes. Even someone who could see the table would only see hashes, which can't be turned back into codes.",
      },
      {
        type: "p",
        text: "The codes are made inside the database, not in the browser, so the real codes only exist for a moment on their way to my screen. The letters and digits leave out ones that are easy to mix up, like 0 and O, or 1, I and L, because I might be typing them from a piece of paper in a hurry.",
      },
      { type: "h2", text: "Locked tables, three doors" },
      {
        type: "code",
        lang: "sql",
        code: "-- Row level security on, and no policies at all:\n-- the API can't read or change these tables\nalter table public.<codes table> enable row level security;\n\n-- The only way in is through functions that check who is asking\ncreate function public.<make codes>() ... security definer ...\n  -- needs my account AND a full two-step sign-in\ncreate function public.<use a code>(code text) ... security definer ...\n  -- needs my account and password only, because the phone is gone",
      },
      {
        type: "p",
        text: "Making codes needs a full two-step sign-in, so someone with only my password can't make their own set. Using a code needs only the password step, because that's the whole point: the phone is gone. To stop anyone trying codes one after another, wrong codes are limited, and after a few in a short time every try is refused for a while. Making codes and using one both appear in my activity log, so I'd notice if it ever happened without me.",
      },
      { type: "h2", text: "Testing it before it touched my real database" },
      {
        type: "p",
        text: "Database rules are the part of my site my automatic tests can't reach, so I ran the SQL on a local copy of Postgres first, with pretend sign-ins. Visitors and other accounts were refused, the tables couldn't be read directly, a wrong code was rejected, too many wrong codes locked every try, a used code never worked twice, and only my authenticator was removed. The browser side has its own tests for the code shape, the download file and the \"codes left\" warning.",
      },
      { type: "h2", text: "The one thing my local test missed" },
      {
        type: "p",
        text: "The first time I pressed Make backup codes on the live site, it said \"DELETE requires a WHERE clause\". Making a new set first clears out the old codes, and I'd written that as a delete with no WHERE. Supabase refuses that when the request comes from the website, as a safety net against wiping a whole table by mistake. My local Postgres doesn't have that rule, so every test there had passed. The fix was to say which rows on purpose (every row whose id isn't empty), and nothing was lost, because the error stopped the request before it changed anything. A local copy is a great test, but it isn't the real thing.",
      },
      {
        type: "tip",
        text: "If you add two-step sign-in to anything, add a way back in at the same time, and store it like a password. Security that locks out the owner isn't finished.",
      },
    ],
  },
  {
    slug: "building-rememba-spaced-repetition",
    title: "Building Rememba: flashcards that know when you'll forget",
    description:
      "My flashcard app shows each card just before you'd forget it. How the maths works, a quiz that forgives typos, and why I renamed it.",
    date: "2026-10-31",
    tags: ["Next.js", "Firebase", "Testing"],
    body: [
      {
        type: "p",
        text: "Rememba is a flashcard app for studying. You put cards into decks, group the decks into colour-coded subjects like Biology or Languages, and study a few minutes a day. The clever part is deciding when you see each card again.",
      },
      { type: "h2", text: "Spaced repetition" },
      {
        type: "p",
        text: "After each card you say how well you remembered it: Again, Hard, Good or Easy. Each card has an \"ease\" number. A Good answer multiplies the gap before you see the card again by its ease, so a card you keep getting right comes back after about 1, 3, 8, 20 and 50 days. Forget it, and it comes back in 10 minutes, a little harder than before. It's a simpler version of SM-2, the algorithm behind apps like Anki.",
      },
      {
        type: "p",
        text: "Dates were trickier than the maths. \"Due today\" has to mean today where you are, so reviews fall due at your local midnight. Adding days by changing the date, instead of adding 24 hours, stops a daylight saving change from moving a card to the wrong day. My tests run the same checks in South African, UK and US time zones, and pass in all three.",
      },
      { type: "h2", text: "A quiz that forgives typos, but not wrong answers" },
      {
        type: "p",
        text: "In \"type the answer\" quizzes, being marked wrong for a missing accent or one wrong letter feels unfair. So capitals, punctuation and accents don't count, and a small typo is still right, with the exact spelling shown. To decide what a small typo is, I used edit distance: how many single-letter changes turn one word into another. One change is allowed for answers up to 10 letters and two for longer ones, but none for very short answers, so \"Ja\" can never pass for \"Nee\".",
      },
      { type: "h2", text: "Why I renamed it" },
      {
        type: "p",
        text: "I first called it Recall. Then I found an existing app with that name, so I renamed mine before launching. Sharing a name with a real product would confuse people, and it could cause trouble later. Rememba is a South African twist on \"remember\".",
      },
      {
        type: "tip",
        text: "Lesson: check that a name is free before you build on it, and write tests for dates in more than one time zone.",
      },
    ],
  },
  {
    slug: "email-alerts-for-new-messages",
    title: "Getting an email when someone messages me",
    description:
      "New contact messages now email me through Resend, sent after the visitor already has their reply, and written so a message can't sneak anything into my email.",
    date: "2026-10-31",
    tags: ["Next.js", "Security", "Admin"],
    body: [
      {
        type: "p",
        text: "My contact form saves messages to my database, and my admin inbox shows them live. But I only saw them when I opened the admin page. If a recruiter wrote to me, I might not notice for days. Now every new message also sends me an email, and I can reply to the person straight from my email app.",
      },
      { type: "h2", text: "The message comes first" },
      {
        type: "p",
        text: "Saving the message is what matters, and the email is a bonus. So the server saves the message, sends the visitor their \"sent\" reply, and only then sends my email. Next.js has a function for exactly this, called after(): code inside it runs once the response has gone back. The visitor never waits for the email, and if the email service is slow or down, their message is still saved and they still see \"sent\".",
      },
      {
        type: "code",
        lang: "ts",
        code: `// saved, so let me know by email
after(() => sendAlert({ name, email, message }, siteUrl, process.env));
return NextResponse.json({ ok: true });`,
      },
      { type: "h2", text: "A visitor writes part of my email" },
      {
        type: "p",
        text: "The email shows the visitor's name and message, so it's text from a stranger going into my inbox. I made sure it can't do anything there:",
      },
      {
        type: "ul",
        items: [
          "Everything they typed is escaped, so HTML like an image or a link shows as plain text instead of working.",
          "Line breaks are taken out of the subject, because a line break in an email's header can be used to add extra headers, like a hidden copy to someone else.",
          "Reply goes to the visitor's address, so I answer them, not the email service.",
          "Bots that fall for my spam trap, and senders who hit the limit, never reach this point, so nobody can flood my inbox through the form.",
          "The key for the email service is a server-only setting, so it never reaches anyone's browser.",
        ],
      },
      { type: "h2", text: "Testing without sending emails" },
      {
        type: "p",
        text: "My tests never send a real email. The function that sends the alert takes the sending function as an option, so the tests pass in a pretend one that records what it was given. They check the email goes to the right place with my key, that a failed send doesn't crash anything, and that a message with HTML in it comes out harmless.",
      },
      {
        type: "tip",
        text: "Lesson: anything a stranger types is untrusted, even when it ends up somewhere private like my own inbox.",
      },
    ],
  },
  {
    slug: "building-ticklist-live-lists",
    title: "Building TickList: one list, live on everyone's phone",
    description:
      "My shared shopping and chores app: live updates between phones, invite links, owners, repeating chores, offline use, and a bug where my own app beat the server.",
    date: "2026-10-30",
    tags: ["Firebase", "Next.js", "Debugging"],
    body: [
      {
        type: "p",
        text: "TickList is a shopping and chores list for families and flatmates. When someone ticks off the milk, it disappears from everyone's phone a moment later, with a message like \"Lerato ticked Milk\". PaperTrail kept one person's data private; TickList had to share data between several people safely, which was new for me.",
      },
      { type: "h2", text: "Live updates" },
      {
        type: "p",
        text: "Firestore can send the app a new copy of the data whenever it changes. TickList listens to the household and its items, and every screen re-draws when a new copy arrives. To write the \"ticked Milk\" messages, the app compares the list before and after, and stays quiet about your own changes.",
      },
      { type: "h2", text: "Who can join, and who can remove people" },
      {
        type: "ul",
        items: [
          "A household and its lists can only be read by its members. The rules on Google's servers check this, not the app.",
          "An invite link carries a long random code. Knowing the code is the invitation, and codes can be looked up one at a time but never listed.",
          "When you join, you can add only yourself, and only with a real code for that household.",
          "The person who starts a household is its owner, who can remove people or hand over ownership. If the owner leaves, the person who's been there longest takes over, so a household is never left without one.",
        ],
      },
      { type: "h2", text: "The bug: my app was faster than the server" },
      {
        type: "p",
        text: "When I first pressed Create household, the screen flickered back to the start for a few seconds. The app switched to the new household as soon as I pressed the button, before the server had saved it. The server then refused to show a household that, as far as it knew, I wasn't in yet. I fixed it in two ways: the app now waits until the household is saved before switching to it, and if the server still says \"not yet\", the app quietly tries again a few times instead of sending you back.",
      },
      { type: "h2", text: "Chores that come back by themselves" },
      {
        type: "p",
        text: "A weekly chore like taking the bins out comes back to the list without any server job. The app stores when it was last done, and works out on the phone that it's due again from the same day next week. Until then it waits in Done, showing \"Back tomorrow\" or a date like \"Back Mon 9 Nov\". The tests check this in any time zone.",
      },
      {
        type: "tip",
        text: "Lesson: when an app shows changes instantly, it can get ahead of the server. Wait for the save that everything else depends on, and retry the moments when the server hasn't caught up yet.",
      },
    ],
  },
  {
    slug: "four-small-additions",
    title: "Four small additions: Mark all read, topics, related notes and my local time",
    description:
      "A one-click inbox clean-up with Undo, a topic filter and related notes for my dev notes, and my local time on the Contact page.",
    date: "2026-10-30",
    tags: ["UX", "Next.js", "Admin"],
    body: [
      {
        type: "p",
        text: "Today's changes are small, but they're the kind people notice every day. One is for me in my admin inbox, two are for readers of my dev notes, and one is for anyone thinking of getting in touch.",
      },
      { type: "h2", text: "Mark all read" },
      {
        type: "p",
        text: "After a few days away, opening every message just to clear the unread dots was slow. Now a Mark all read button appears next to the inbox heading, only when something is unread. It changes every unread message in one request to the database, instead of one request per message, and the tab badge and title count go back to zero straight away.",
      },
      {
        type: "ul",
        items: [
          "Undo: for five seconds a pop-up lets me put them back to unread, in case I clicked by mistake.",
          "It only changes the messages that were unread, so Undo never marks an older, already-read message as new.",
          "A message waiting for Undo delete is left alone.",
          "The database still checks it's my account doing it, the same as marking one message.",
        ],
      },
      { type: "h2", text: "Filter by topic" },
      {
        type: "p",
        text: "With twenty-five notes, finding the ones about one subject meant scrolling. The Dev notes page now has a Filter by topic row, like the tech filter on my Projects page, with a count on each topic. Choosing one puts it in the address (for example /notes?tag=Security), so I can send someone a link to just my security notes. The topics on each note link there too.",
      },
      {
        type: "p",
        text: "Only topics used by two or more notes get a button, so the row stays short. A one-note topic still works from a shared link. The page also sends the browser only what the list shows (title, date, description and topics), not the full text of every note, so it stays light.",
      },
      { type: "h2", text: "Related notes" },
      {
        type: "p",
        text: "At the end of each note there are now up to three related notes. They're the notes that share the most topics with the one you just read. When several share the same number, the note's first topic wins, because I list the main topic first, and then the newest. Notes already linked as Older or Newer are skipped, so nothing is offered twice. My first version ranked by date alone, so a note about security headers suggested notes that only shared Next.js. Ranking by the main topic fixed that.",
      },
      { type: "h2", text: "My local time" },
      {
        type: "p",
        text: "The Contact page now says what time it is for me, for example \"It's 13:16 here in Johannesburg\", and adds the visitor's own time when it's different. It's worked out in the visitor's browser, because my server doesn't know their time zone and a saved page would show an old time. It updates every 30 seconds.",
      },
      {
        type: "tip",
        text: "Lesson: small features that save a few clicks or answer a question before it's asked are worth as much as big ones, and an Undo makes a one-click action feel safe.",
      },
    ],
  },
  {
    slug: "building-papertrail-with-firebase",
    title: "Building PaperTrail with Firebase instead of Supabase",
    description:
      "PaperTrail, my quotes and invoices app for South African small businesses, uses Firebase. Here's why, and what carried over from Supabase.",
    date: "2026-10-29",
    tags: ["Firebase", "Next.js", "PaperTrail"],
    body: [
      {
        type: "p",
        text: "PaperTrail is my newest project: quotes and invoices for South African small businesses, with rand amounts, 15% VAT, part payments, WhatsApp reminders and PDFs, in English or Afrikaans. You sign in, and your documents follow you from your phone to your laptop. It's live, and it's on my Projects page.",
      },
      { type: "h2", text: "Why Firebase this time" },
      {
        type: "p",
        text: "Supabase's free plan only lets me run two projects at a time, and this site and my clinic platform already use both. Instead of pausing one, I used Firebase Authentication and Cloud Firestore from Google. That also meant learning a second way to store data, which is useful in itself.",
      },
      { type: "h2", text: "Same idea, different tool" },
      {
        type: "p",
        text: "In Supabase, Row Level Security policies written in SQL decide which rows someone can see. Firestore has security rules that do the same job. PaperTrail's rules say that a signed-in user can only read and write their own documents, and nobody else's.",
      },
      {
        type: "p",
        text: "The lesson I learned on this site carried straight over: anyone can change the code running in their browser, so the app hiding something isn't protection. The rules run on Google's servers, and they're what actually keep each business's invoices private.",
      },
      { type: "h2", text: "Money is counted in cents" },
      {
        type: "p",
        text: "Computers store decimals in a way that can't hold some numbers exactly, so adding prices can come out a tiny bit wrong. PaperTrail keeps every amount as a whole number of cents, and only turns it back into rand on screen:",
      },
      {
        type: "code",
        lang: "ts",
        code: `0.1 + 0.2; // 0.30000000000000004 (rand as decimals: wrong)
10 + 20;   // 30 (cents as whole numbers: right)`,
      },
      {
        type: "p",
        text: "I also format rand myself, like R 1 250,50, because different browsers wrote South African amounts differently. Tests check the money maths, the VAT and the formatting, so a change can't quietly break an invoice total.",
      },
      {
        type: "tip",
        text: "Lesson: the tools change, but the security idea doesn't. Decide on the server who can see what, and never trust the browser to do it.",
      },
    ],
  },
  {
    slug: "showing-work-in-progress",
    title: "Showing work in progress honestly",
    description:
      "My Projects page now has a Currently building section for two apps I'm working on, designed so nobody mistakes them for finished work.",
    date: "2026-10-29",
    updated: "2026-10-31",
    tags: ["Portfolio", "Design", "Next.js"],
    body: [
      {
        type: "p",
        text: "I'm building two new apps. They're not live yet, but I wanted visitors to see what I'm working on next.",
      },
      {
        type: "tip",
        text: "Update (30 October): I first listed an F1 Prediction League and a Booking + Client Portal. After finishing PaperTrail, I swapped them for TickList, a shared household list that updates live on everyone's phone, and Recall, a flashcard app with spaced repetition (since renamed Rememba). The booking portal repeated what my clinic platform and PaperTrail already show, and the new two each prove something my other projects don't: people working together live, offline use and a real algorithm.",
      },
      { type: "h2", text: "Not pretending they're finished" },
      {
        type: "p",
        text: "The risk with showing unfinished work is that it looks finished. So the cards for these projects are deliberately different from my real project cards:",
      },
      {
        type: "ul",
        items: [
          "A dashed border instead of a solid card, and no screenshot.",
          "An \"In progress\" label with a small pulsing dot, which stays still for people who turn animations off.",
          "No buttons or links, because there's nothing to open yet.",
          "They sit under my finished projects, never above them.",
        ],
      },
      { type: "h2", text: "Built to disappear" },
      {
        type: "p",
        text: "The list lives in one small file in my code. When a project goes live, I add its real card in my admin page and delete it from the list. When the list is empty, the whole section hides itself, so I can't forget to remove a heading. A test checks every entry has a name, a short summary and tags, and that nothing is listed twice.",
      },
      {
        type: "tip",
        text: "Lesson: it's fine to show work in progress, as long as it's obvious that it's in progress.",
      },
    ],
  },
  {
    slug: "testing-my-site-like-a-real-visitor",
    title: "Testing my site like a real visitor, on a laptop and a phone",
    description:
      "Browser tests now open my live site after every deploy, fill in forms and tap the phone menu, as a laptop and a phone, without sending one real message.",
    date: "2026-10-29",
    tags: ["Testing", "Playwright", "GitHub Actions"],
    body: [
      {
        type: "p",
        text: "My site has over a hundred unit tests. They check my functions with example inputs, and they're fast. But they never open a page. A function can be perfectly right while the button that uses it is hidden, or the page it's on doesn't load. In my reflection, I wrote that I'd add browser tests that click through the contact form and the admin page. Today I did.",
      },
      { type: "h2", text: "What Playwright does" },
      {
        type: "p",
        text: "Playwright is a tool that controls a real browser. My tests open my live site twice, once as a laptop and once as a phone screen, and do what a visitor would: type in boxes, press buttons, refresh, open the menu. Then they check what's on the screen. A test reads almost like instructions to a person:",
      },
      {
        type: "code",
        lang: "ts",
        code: `await page.getByRole("textbox", { name: "Message" }).fill("Hi");
await page.getByRole("button", { name: /Send message/ }).click();
// the browser should stop a message that's too short`,
      },
      {
        type: "p",
        text: "The tests find things the way a screen reader does, by their role and name, like \"the textbox called Message\". So if a label goes missing, the test fails too, which also protects accessibility.",
      },
      { type: "h2", text: "Testing a contact form without sending messages" },
      {
        type: "p",
        text: "The tricky part was the contact form. A test that really sends a message after every deploy would fill my inbox and hit my own rate limit. So when a test presses Send, the test answers instead of my server, and checks what would have been sent: the right name, and an empty spam trap.",
      },
      {
        type: "p",
        text: "I still wanted to test my real server, so a few tests call it directly, but only with requests it throws away before the database: a bot filling in the hidden field, a form sent too fast, or a wrong email address. My server answers each one correctly, and nothing is saved.",
      },
      { type: "h2", text: "What else they check" },
      {
        type: "ul",
        items: [
          "My contact form's draft really comes back after a refresh.",
          "The admin page shows only the sign-in form to a stranger, and asks search engines not to list it.",
          "The new Show password button switches the password between hidden and visible. The tests never type a real password or press Sign in.",
          "Every main page loads with its own title, and a made-up project page gives a real 404.",
          "The live site really sends my security headers.",
          "On a phone, the menu opens, shows the links, and closes with Escape.",
        ],
      },
      {
        type: "p",
        text: "They run on GitHub after every deploy, waiting until Vercel is serving the new version first, the same trick my Lighthouse check uses. If one fails, GitHub keeps screenshots and a step-by-step recording of what happened.",
      },
      { type: "h2", text: "Also today: Show password" },
      {
        type: "p",
        text: "My admin sign-in now has a Show / Hide button on the password box, so I can check what I typed. The password is hidden again the moment I press Sign in, so it's never left on screen.",
      },
      {
        type: "tip",
        text: "Lesson: unit tests prove the parts work; browser tests prove the page works. And a good test never makes a mess in the real world, like sending real messages.",
      },
    ],
  },
  {
    slug: "keeping-a-visitors-message-safe",
    title: "Keeping a visitor's message safe, and a Copy link button",
    description:
      "My contact form now remembers what a visitor typed if they refresh by accident, without sending anything anywhere. Plus an easy way to share a project.",
    date: "2026-10-28",
    tags: ["UX", "Privacy", "React"],
    body: [
      {
        type: "p",
        text: "Earlier today I added a warning so I don't lose what I type in my admin page. Then I thought about the people writing to me. If a recruiter writes a long message on my contact form and their phone refreshes the page, it's gone, and they might not write it again.",
      },
      { type: "h2", text: "A draft that stays in the tab" },
      {
        type: "p",
        text: "Now, half a second after a visitor stops typing, the form saves their name, email and message in their own browser. If the page refreshes or they press Back by accident, everything comes back, with a short note saying so and a Start over button.",
      },
      { type: "h2", text: "Where it's kept, and why there" },
      {
        type: "p",
        text: "Browsers have two kinds of storage for this. One keeps things until they're deleted, even after the browser closes. The other, session storage, belongs to one tab and is wiped when that tab closes. I chose session storage. A message to a stranger shouldn't stay on a shared computer for the next person to find.",
      },
      {
        type: "ul",
        items: [
          "Nothing is sent to my site or to Supabase until the visitor presses Send. The draft never leaves their device.",
          "Once the message is sent, the draft is deleted straight away.",
          "The hidden spam field is never saved.",
          "If the saved draft is broken or too long, the form ignores it and starts empty instead of crashing.",
          "Some private browsing modes block storage. Then the form still works; it just doesn't remember.",
        ],
      },
      {
        type: "p",
        text: "There was one catch. My spam protection rejects forms sent faster than a person could type. After a refresh, the timer would restart, and a visitor whose message came back could send it straight away and be treated as a bot. So the draft also remembers when the form was first opened, and the check uses that.",
      },
      { type: "h2", text: "A Copy link button" },
      {
        type: "p",
        text: "Each project page and my case study now has a Copy link button, for sharing a project on LinkedIn or WhatsApp. It copies the clean address, without any filter or heading on the end. It uses the same copy helper as my other Copy buttons, so all three behave the same way.",
      },
      {
        type: "tip",
        text: "Lesson: when you store something for a visitor, choose the place that keeps it the shortest time that still does the job.",
      },
    ],
  },
  {
    slug: "small-things-that-save-work",
    title: "Small things that save people's work: copy buttons and unsaved changes",
    description:
      "A Copy button on every code example, and a warning before I lose what I've typed in my admin page. Small features, but each one saves someone a bad minute.",
    date: "2026-10-28",
    tags: ["UX", "React", "Next.js"],
    body: [
      {
        type: "p",
        text: "Not every feature has to be big. Today I added two small ones that each stop a small, annoying moment: selecting code by hand and missing a line, and losing a project description I'd half-written.",
      },
      { type: "h2", text: "1. A Copy button on code examples" },
      {
        type: "p",
        text: "My dev notes have code examples. Selecting them by hand is fiddly, especially on a phone. Now each example has a Copy button in its top bar, and it says \"Copied!\" for two seconds. My contact page already had a Copy email button, so I moved the copying into one shared helper that both buttons use, with a fallback for older browsers.",
      },
      {
        type: "p",
        text: "The note pages are server components, which means they're built on the server and send finished HTML. Only the small button is a client component that runs in the browser, so the rest of the page stays just as fast.",
      },
      { type: "h2", text: "2. A warning before I lose my typing" },
      {
        type: "p",
        text: "In my admin page I write project summaries, tags and links. If I clicked the navbar or closed the tab halfway through, it was all gone. Now the form remembers what it started with, empty or the project I'm editing, and compares. As soon as something is different, \"Unsaved changes\" appears next to the Save button.",
      },
      {
        type: "ul",
        items: [
          "Closing the tab or refreshing: the browser shows its own \"Leave site?\" box. Browsers choose that wording, so sites can't use it to trick people.",
          "Clicking a link on my site: Next.js changes pages without reloading, so the browser's box never appears. I listen for link clicks and ask \"Leave without saving?\" first.",
          "Editing a different project or signing out asks too.",
          "It doesn't ask for links that open a new tab, Ctrl-clicks, links further down the same page, or email links, because none of those lose anything.",
          "Adding a space at the end of a field doesn't count as a change.",
        ],
      },
      {
        type: "p",
        text: "One thing deliberately doesn't ask: my automatic sign-out after a long time without activity. If I've walked away from my laptop, signing out matters more than a half-typed summary.",
      },
      {
        type: "tip",
        text: "Lesson: the best small features remove a moment of frustration. If you've ever lost your typing, you know which one I mean.",
      },
    ],
  },
  {
    slug: "security-headers",
    title: "Security headers: telling the browser to be stricter",
    description:
      "Seven lines of config that switch on browser protections for every page, why I left one rule out, and a tab badge for unread messages.",
    date: "2026-10-28",
    tags: ["Security", "Next.js", "Headers"],
    body: [
      {
        type: "p",
        text: "Most of my site's security lives in the database: Row Level Security decides who can read or change anything. But the browser has protections too, and they're switched off unless the website asks for them. A website asks using headers: short instructions sent with every page, before the page itself.",
      },
      { type: "h2", text: "What I switched on" },
      {
        type: "ul",
        items: [
          "No framing: other sites can't show my pages inside a frame. This stops clickjacking, where a real page is hidden under a fake button so you click something you didn't mean to.",
          "No type guessing: a file sent as text is never run as a script.",
          "Always https: browsers remember to use the secure version of my site for two years, even if someone types http://.",
          "Less shared: when a visitor clicks a link to another site, that site only sees my domain, not the exact page.",
          "Unused features off: my site never needs the camera, microphone, location or payments, so nothing on it can ask for them.",
          "Forms only send to my own site, and old browser plugins are blocked.",
        ],
      },
      {
        type: "p",
        text: "In Next.js, they all go in next.config.ts, and one rule adds them to every address:",
      },
      {
        type: "code",
        lang: "ts",
        code: `async headers() {
  return [{ source: "/(.*)", headers: securityHeaders }];
},`,
      },
      {
        type: "p",
        text: "Headers aren't secret. Anyone can see them in the Network tab of the browser's developer tools, so writing about them doesn't help an attacker. They only switch protections on.",
      },
      { type: "h2", text: "The rule I left out on purpose" },
      {
        type: "p",
        text: "The strongest header is a Content Security Policy with a script rule, which says exactly which scripts may run. I didn't add that part. Next.js, my dark-mode script and Vercel Analytics all use small scripts written inside the page, and a strict rule would block them. The site would look fine in some places and quietly break in others. Doing it properly needs a nonce, a new random code for every page load, which is a bigger change. So it's listed in my README's known gaps instead of half-done.",
      },
      {
        type: "p",
        text: "A test checks that every header is sent on every page, and it also fails if a script rule is ever added by accident. I proved it works by adding one: the test failed straight away.",
      },
      { type: "h2", text: "Also today: a badge on the admin tab" },
      {
        type: "p",
        text: "My admin tab already showed \"(2) Admin\" when I had unread messages, but with lots of tabs open the title gets cut off. Now the tab icon gets a small number badge too, like an app on a phone. My icon is an SVG, which is just text, so the page shrinks the logo into the corner, adds a circle with the number, and swaps the tab icon for the new picture. I made sure the badge never covers my initials. When everything is read, the normal icon comes back.",
      },
      {
        type: "tip",
        text: "Lesson: security has layers. The database protects the data, and headers protect the visitor's browser. Knowing which rule to leave out, and saying so, is part of doing it well.",
      },
    ],
  },
  {
    slug: "why-my-missing-pages-said-200",
    title: "Why my missing project pages said 200, not 404",
    description:
      "A made-up project address showed my \"not found\" page, but told browsers and Google everything was fine. Here's why, and the fix.",
    date: "2026-10-27",
    tags: ["Next.js", "SEO", "Debugging"],
    body: [
      {
        type: "p",
        text: "While checking my live site today, I tried a project address that doesn't exist. The page said \"Project not found\", which looked right. But when I checked the status code, the number a server sends back with every page, it was 200, which means \"OK\". A missing page should say 404, \"Not Found\". My made-up note addresses already returned 404. Only project pages didn't.",
      },
      { type: "h2", text: "Why it happened" },
      {
        type: "p",
        text: "My Projects page has a loading screen: a loading.tsx file that shows grey placeholder cards while my projects load from Supabase. What I didn't know is that a loading screen also covers every page in the folders below it, so it was covering each project page too.",
      },
      {
        type: "p",
        text: "To show a loading screen straight away, Next.js has to start sending the page before the data arrives, and the status code is sent first. So by the time my project page found out the project didn't exist, the 200 had already been sent and couldn't be taken back. Next.js did the next best thing: it showed my not-found page and added a tag telling Google not to list it. Google calls this a \"soft 404\".",
      },
      { type: "h2", text: "The fix: a route group" },
      {
        type: "p",
        text: "I still wanted the loading screen on the Projects list, just not above each project. Next.js has route groups for this: a folder whose name is in brackets organises files without becoming part of the address. I moved the Projects page and its loading screen into a (list) folder:",
      },
      {
        type: "code",
        lang: "text",
        code: `app/projects/(list)/page.tsx      → still /projects
app/projects/(list)/loading.tsx   → only covers /projects
app/projects/[slug]/page.tsx      → no loading screen above it`,
      },
      {
        type: "p",
        text: "Now a project page checks Supabase before sending anything, so a wrong address gets a real 404. I also added a test that fails if anyone puts a loading screen back above the project pages, because nothing on screen would show the problem: the page looks exactly the same either way.",
      },
      { type: "h2", text: "Also today: numbers on the filters" },
      {
        type: "p",
        text: "On my admin activity log, the All / Projects / Messages / Images buttons now show how many recent entries each kind has, so I can see at a glance if a new message has arrived. Counting is a small tested function, and entries from before I added kinds still count as projects.",
      },
      {
        type: "tip",
        text: "Lesson: \"it looks right\" and \"it is right\" aren't the same. The page looked perfect; only the status code showed the problem. Checking what the server actually sends is part of testing.",
      },
    ],
  },
  {
    slug: "one-timeline-for-projects-messages-and-images",
    title: "One timeline for projects, messages and images",
    description:
      "My admin activity log only knew about projects. Now the database also records messages and images, without keeping anything private.",
    date: "2026-10-27",
    tags: ["Supabase", "Triggers", "Privacy"],
    body: [
      {
        type: "p",
        text: "My admin page has an activity log: a timeline of changes, written by the database itself. Until today it only recorded projects. If a message arrived and I deleted it, or I uploaded a screenshot and then removed it, there was no record. For my final project, I wanted one place that answers the question \"what happened on my site recently?\"",
      },
      { type: "h2", text: "Two more triggers" },
      {
        type: "p",
        text: "The project history is written by a trigger: code that runs inside the database every time a row changes. I added two more in the same style. One runs when a message is saved or deleted, and one runs when a file in my project images folder in Supabase Storage is uploaded or deleted. Storage keeps a row for every file, so a trigger can watch it like any other table.",
      },
      {
        type: "code",
        lang: "sql",
        code: `create trigger messages_activity
  after insert or delete on public.messages
  for each row execute function public.log_message_activity();`,
      },
      {
        type: "p",
        text: "Each entry now also says what kind of thing it is about: a project, a message or an image. Older entries were all about projects, so the page treats an entry without a kind as a project, and nothing from before is lost.",
      },
      { type: "h2", text: "Keeping private things private" },
      {
        type: "p",
        text: "Messages come from strangers, so I thought about what the log should keep. It only copies the sender's name, never their email address or what they wrote. That's enough for \"New message from Thabo\", and if I delete a message, its text really is gone, not hiding in my history. For images, the log keeps only the file name.",
      },
      { type: "h2", text: "Same rules as before" },
      {
        type: "ul",
        items: [
          "Only my account, signed in with my authenticator code, can read the log.",
          "Nobody can add, change or delete entries from a browser, not even me. Only the triggers can write.",
          "The trigger functions can't be called directly through the API either; they only run when a row changes.",
          "New entries appear live, so a message shows up in the timeline the moment it arrives.",
        ],
      },
      { type: "h2", text: "Filters" },
      {
        type: "p",
        text: "With three kinds of entry, the timeline got busy, so I added All / Projects / Messages / Images buttons above it, in the same style as my inbox filters. The filtering is a small function with its own tests, including one that checks older entries still count as projects.",
      },
      {
        type: "p",
        text: "Before running the new setup file on Supabase, I ran all my setup files on a local copy of the database and acted out a real day: a visitor sent a message, then I uploaded an image, deleted it and deleted the message. The log had exactly four new entries, a visitor could still read none of them, and trying to call the trigger functions directly was refused.",
      },
      {
        type: "tip",
        text: "Lesson: a log is only useful if you trust it, and only safe if it doesn't keep more than it needs. Letting the database write it handles the first part; choosing what to copy handles the second.",
      },
    ],
  },
  {
    slug: "from-65-to-83-tests",
    title: "From 65 to 83 tests: testing my docs, my buttons and my spreadsheets",
    description:
      "Every small feature I added this week came with tests, and some tests now check my documentation too. Here's where the 18 new checks came from.",
    date: "2026-10-26",
    tags: ["Testing", "Vitest", "Security"],
    body: [
      {
        type: "p",
        text: "Two days ago I wrote about my tests growing from 47 to 65. This week I added more small features, and npm test now runs 83 checks. I kept the same rule: if a feature makes a decision, the decision gets a test.",
      },
      { type: "h2", text: "Where the 18 new checks came from" },
      {
        type: "ul",
        items: [
          "65 → 69, my docs (4 checks): the README's dev note count matches the real notes, every database setup file is listed in the setup steps, and every file the README or my code guide mentions really exists.",
          "69 → 72, dev note navigation (3 checks): every sub-heading gets its own unique address, two headings with the same words get -2 on the end, and each note links to the right older and newer note.",
          "72 → 76, updated dates and back to top (4 checks): an \"Updated\" date is a real date and never before the note was published, and the back-to-top button stays hidden near the top and appears after scrolling down.",
          "76 → 78, Back and Forward buttons (2 checks): they follow what the browser says when it can tell us, and make a sensible guess when it can't.",
          "78 → 79, README links (1 check): every link inside the README points to a heading that exists, so reorganising it can't leave a broken link.",
          "79 → 83, CSV download (4 checks): cells are quoted correctly, the file has the right header and rows, the file name has the date, and messages can't sneak a formula into a spreadsheet.",
        ],
      },
      { type: "h2", text: "The test I'm proudest of" },
      {
        type: "p",
        text: "My admin inbox can now download messages as a CSV file for Excel or Google Sheets. Those messages come from a public contact form, so anyone can write anything. Spreadsheets treat a cell that starts with = as a formula, so a message written to look like one could run when I open the file. This is called CSV injection. My download puts a ' in front of any cell that starts with a formula character, so it shows as plain text. The test proves it:",
      },
      {
        type: "code",
        lang: "ts",
        code: `it("stops a message from running as a spreadsheet formula", () => {
  expect(csvCell("@everyone")).toBe("'@everyone");
});`,
      },
      { type: "h2", text: "Tests that check words, not code" },
      {
        type: "p",
        text: "Five of the new checks don't test my code at all. They read my README and code guide as plain text and compare them with the real project. I proved they work by breaking my README on purpose, with a wrong count, a misspelt file name and a broken link, and each time a test failed and said exactly what was wrong.",
      },
      {
        type: "p",
        text: "Like before, my database rules aren't in these 83, because they run inside Supabase. I test those separately on a local copy of the database.",
      },
      {
        type: "tip",
        text: "Lesson: a small feature still deserves a test. The CSV button is about 20 lines of code, but one of those lines is a security fix, and a test makes sure nobody removes it by accident.",
      },
    ],
  },
  {
    slug: "lighthouse-check-that-never-ran",
    title: "The Lighthouse check that never ran, and making it four times faster",
    description:
      "My README said Lighthouse tested my site after every deploy. When I looked at GitHub, it had never run once. Here's what I found and how I fixed it.",
    date: "2026-10-26",
    tags: ["Lighthouse", "GitHub Actions", "Debugging"],
    body: [
      {
        type: "p",
        text: "For Milestone 5, I set up Lighthouse CI: a GitHub Action that runs Lighthouse on my live site and fails if Accessibility or SEO drops below 90. My README said it ran after every deploy. Then I opened the Actions tab on GitHub and noticed something: my Tests workflow had 23 green runs, and Lighthouse had none. Not failed, just never started.",
      },
      { type: "h2", text: "Why it never ran" },
      {
        type: "p",
        text: "The workflow was set to start on a deployment_status event: a message that some hosting setups send to GitHub when a deployment finishes. My Vercel project doesn't send that message to GitHub, so the trigger never fired. Nothing was broken in a way that showed up as an error. The check just sat there waiting.",
      },
      { type: "h2", text: "Fix 1: run after every push" },
      {
        type: "p",
        text: "I changed it to start on every push to main, wait 4 minutes for Vercel to deploy, then test six pages three times each. It worked: the first run was green. But it took 8 minutes 46 seconds, and most of that was waiting.",
      },
      { type: "h2", text: "Fix 2: start the moment the new version is live" },
      {
        type: "p",
        text: "Instead of guessing how long Vercel takes, I let the site say which version it is. I added a tiny address, /api/version, that returns the ID of the commit the live site was built from. That ID is already public on GitHub, so it shares nothing private. The workflow checks it every 15 seconds and starts Lighthouse as soon as it matches the commit that was just pushed.",
      },
      {
        type: "code",
        lang: "bash",
        code: `for i in $(seq 1 40); do
  live=$(curl -fsS "$SITE/api/version" | grep -oE '[0-9a-f]{40}')
  if [ "$live" = "$GITHUB_SHA" ]; then exit 0; fi   # the new version is live
  sleep 15
done`,
      },
      {
        type: "p",
        text: "I made two smaller changes too. Each page is tested once instead of three times, because Accessibility and SEO scores don't change between runs (Performance only gives a warning). And pushes that only change documents, like my README, skip Lighthouse completely, because they don't change the live site.",
      },
      { type: "h2", text: "The result" },
      {
        type: "ul",
        items: [
          "Before: never ran at all.",
          "Fix 1: 8 minutes 46 seconds, then 8 minutes 7 seconds.",
          "Fix 2: 2 minutes 14 seconds on the first run, about four times faster.",
        ],
      },
      {
        type: "p",
        text: "I also fixed my README and code guide, which had described a check that wasn't happening.",
      },
      {
        type: "tip",
        text: "Lesson: an automatic check that never runs looks exactly like one that always passes. Every now and then, go and look at the Actions tab and make sure it's really there.",
      },
    ],
  },
  {
    slug: "keeping-docs-honest",
    title: "Keeping my docs as honest as my code",
    description:
      "My README and code guide fell behind my site without me noticing. I fixed them, and now my tests fail if the docs go stale again.",
    date: "2026-10-26",
    tags: ["Documentation", "Testing", "GitHub Actions"],
    body: [
      {
        type: "p",
        text: "My portfolio has two documents that explain it: the README, which is the first thing anyone sees on GitHub, and Docs/how-it-works.md, a plain-English guide to the code that I study from. Last week I added a lot to my admin page in a few days. The code was tested. The docs weren't, and they quietly fell behind.",
      },
      { type: "h2", text: "What had gone stale" },
      {
        type: "ul",
        items: [
          "The README still said my database had one table. It had three, plus storage for images.",
          "The code guide still said signing in takes you straight to the dashboard. By then there was a second sign-in step.",
          "The security tables described the older, weaker version of my rules.",
          "My Lighthouse scores table was missing its header row, so GitHub didn't show it as a table at all.",
          "One line named an image format my site no longer uses.",
        ],
      },
      {
        type: "p",
        text: "None of this broke the site, which is exactly why nobody noticed. But a README is a promise about what the code does. If my lecturer or an employer reads it and then finds the code does something different, they stop trusting the rest.",
      },
      { type: "h2", text: "Fixing it, and a new habit" },
      {
        type: "p",
        text: "I rewrote the out-of-date parts of both documents and added the missing sections. Then I made a rule for myself: every commit updates everything it affects, including the README, the code guide, the dev note count, the test count and the setup steps.",
      },
      { type: "h2", text: "Letting the tests check the docs" },
      {
        type: "p",
        text: "Rules you have to remember are easy to forget, so I wrote tests that read my docs as plain text and compare them with the real project. They run on GitHub on every push, with the rest of my tests:",
      },
      {
        type: "ul",
        items: [
          "The README's dev note count must match the real number of notes, in numbers and in words.",
          "Every SQL file in my Supabase folder must appear in the README's setup steps, so nobody setting up the project misses one.",
          "Every file the README or the code guide mentions must really exist, so a renamed or deleted file can't leave a broken reference behind.",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: `it("every SQL file in Supabase/ is in the README's setup steps", () => {
  const sqlFiles = readdirSync("Supabase").filter((f) => f.endsWith(".sql"));
  const notListed = sqlFiles.filter((f) => !readme.includes(\`\\\`\${f}\\\`\`));
  expect(notListed).toEqual([]);
});`,
      },
      {
        type: "p",
        text: "To make sure the tests really work, I broke my README on purpose: I changed the note count and misspelt one file name. Two tests failed and named exactly what was wrong. Then I put it back and everything passed.",
      },
      { type: "h2", text: "What the tests can't do" },
      {
        type: "p",
        text: "They check numbers and file names, not meaning. A test can't tell whether a sentence still describes what the code does. That part is still my job, which is why the habit matters as much as the tests.",
      },
      {
        type: "tip",
        text: "Lesson: documentation is part of the product. If something can be checked automatically, check it; if it can't, make updating it part of every change.",
      },
    ],
  },
  {
    slug: "writing-about-security-safely",
    title: "Writing about security without handing hackers a map",
    description:
      "I went back through my dev notes and took out details that could help an attacker, but kept the code. Here's what I removed, what I kept, and why.",
    date: "2026-10-25",
    tags: ["Security", "Writing", "Supabase"],
    body: [
      {
        type: "p",
        text: "My dev notes explain how I built my portfolio, including its security: Row Level Security, the spam protection on my contact form and two-step sign-in for my admin page. Explaining your work is the point of a dev log. But I realised some of my notes were also a step-by-step guide to the exact numbers and names behind my defences. So I read every note again, as if I were someone trying to get in.",
      },
      { type: "h2", text: "Two kinds of security" },
      {
        type: "ul",
        items: [
          "Security that depends on secrets staying hidden. If someone learns the detail, the protection is gone. Hiding things is called \"security through obscurity\", and on its own it's weak.",
          "Security that still works when people know exactly how it's built. My database rules are like this: knowing that only my account, with my authenticator code, can change a project doesn't help anyone become my account.",
        ],
      },
      {
        type: "p",
        text: "My portfolio leans on the second kind. Row Level Security, the two-step rule and the rate limit all run inside the database, so they protect my data even from someone who has read all my code. My GitHub repo is public anyway, so the code itself was never a secret.",
      },
      { type: "h2", text: "So why remove anything?" },
      {
        type: "p",
        text: "Because some details make an attacker's job easier, even when they can't break the main defence. If you know exactly how many messages you can send before a limit kicks in, you can send just under it. If you know the name of a hidden spam-trap field, a bot can be told to skip it. That doesn't open my database, but it does make my spam protection weaker. A blog post doesn't need those details to teach the idea.",
      },
      { type: "h2", text: "What I changed" },
      {
        type: "ul",
        items: [
          "Exact numbers became descriptions: \"a limit on messages from the same email address in a short time\" instead of the real numbers.",
          "Hidden field names and internal storage names were left out. The idea is explained; the name isn't needed.",
          "Code examples stayed, but with placeholders like max_per_sender and 'my-user-id' instead of real values.",
          "Timings became general, like \"after a while without activity\".",
          "I stopped naming the address of my admin page in the notes.",
          "I also updated two notes whose code showed an older, weaker version of my rules, so nobody reads them and thinks a password alone is enough.",
        ],
      },
      {
        type: "code",
        lang: "sql",
        code: `-- Before: the real limit was in the post
-- After: the idea is the same, the number stays in the database
if recent_from_sender >= max_per_sender then
  raise exception 'Too many messages. Please try again in a few minutes.';
end if;`,
      },
      { type: "h2", text: "What I kept on purpose" },
      {
        type: "p",
        text: "I didn't hide how my defences work, because that is the useful part for anyone learning, and because it shows the defences are strong. Saying \"visitors get an empty list\" or \"only a database trigger can write to the history\" explains why an attack fails. It doesn't help anyone make it succeed.",
      },
      { type: "h2", text: "The checklist I use now" },
      {
        type: "ul",
        items: [
          "No real IDs, emails, passwords, keys or project addresses. Placeholders only.",
          "No exact limits, thresholds or time windows for security features.",
          "No names of hidden fields, internal storage keys or private pages.",
          "Explain why an attack fails, not how to get around a defence.",
          "If a note shows old code, update it or say clearly that it changed.",
        ],
      },
      {
        type: "tip",
        text: "Lesson: real security should still work when everyone knows how it's built. Writing about it carefully is just good manners: share the idea, keep the numbers.",
      },
    ],
  },
  {
    slug: "from-47-to-65-tests",
    title: "From 47 to 65 tests: what changed and why",
    description:
      "A day after writing about my 47 automated tests, I had 65. Every new feature on my admin page came with tests of its own. Here's the breakdown.",
    date: "2026-10-24",
    tags: ["Testing", "Vitest", "Admin"],
    body: [
      {
        type: "p",
        text: "Yesterday I wrote a note called \"Why my portfolio has 47 automated tests\". It was true when I wrote it, but the number has already moved: npm test now runs 65 checks. That isn't a mistake. The number grew because I followed my own rule: every new feature gets tests for the logic that must not break.",
      },
      { type: "h2", text: "Where the 18 new checks came from" },
      {
        type: "p",
        text: "All of them are in one new file, tests/admin.test.ts, because they all test my admin page:",
      },
      {
        type: "ul",
        items: [
          "47 → 52, live inbox (5 checks): searching by name, email or text in any capitals, an empty search showing everything, non-matches being hidden, and the Reply link using the right address, subject, first name and quoted message.",
          "52 → 58, activity log and auto sign-out (6 checks): each change described in plain words, reorders from one drag grouped into one line, \"5 min ago\" style times, and the sign-out timer staying quiet, warning before the time runs out and signing out when it does, even after the laptop was asleep.",
          "58 → 61, one-tab sign-in (3 checks): a normal refresh keeps me signed in, a closed tab reopened later signs out, and a tab that was never closed is left alone.",
          "61 → 65, two-step sign-in (4 checks): the code screen after the password, the set-up screen when no app is connected, the dashboard only after both steps, and pasted codes with spaces cleaned up.",
        ],
      },
      { type: "h2", text: "Tests I wrote vs checks that run" },
      {
        type: "p",
        text: "In my last note, 28 written tests became 47 checks, because one test runs once for every skill on my Skills page. Now there are 46 written tests (28 + 18) and still one check per skill, so 65 checks run.",
      },
      { type: "h2", text: "Making the admin code testable" },
      {
        type: "p",
        text: "Most of the new admin code talks to Supabase or the browser, which is hard to test. So I moved the decisions into small functions in lib/ that only take values in and give an answer back. For example, nextStep() in lib/two-step.ts decides what to show after the password, and idleState() in lib/idle.ts decides whether to warn or sign out. The components call these functions, and the tests check them directly.",
      },
      {
        type: "code",
        lang: "ts",
        code: `it("only shows the dashboard after both steps", () => {
  expect(nextStep({ currentLevel: "aal2", nextLevel: "aal2" })).toBe("dashboard");
});`,
      },
      {
        type: "p",
        text: "The database rules (RLS, the activity log trigger and the two-step aal2 rule) aren't in these 65, because they run inside Supabase, not in my code. I tested those separately on a local copy of the database as a visitor, as another account and as me, and wrote the results in each feature's note.",
      },
      {
        type: "tip",
        text: "Lesson: a number in a blog post is only true on the day it was written. What matters is that it keeps going up with every feature.",
      },
    ],
  },
  {
    slug: "two-step-sign-in",
    title: "Two-step sign-in: a password isn't enough any more",
    description:
      "My admin page now needs a 6-digit code from an authenticator app on my phone, and the database itself refuses owner access without it.",
    date: "2026-10-24",
    updated: "2026-10-25",
    tags: ["Security", "Supabase", "MFA"],
    body: [
      {
        type: "p",
        text: "My admin page was protected by an email and password. If someone guessed or stole the password, they could read my messages and change my projects. Two-step sign-in (also called MFA, multi-factor authentication) fixes that: after the password, you also need a code that only my phone can make.",
      },
      { type: "h2", text: "Why an authenticator app and not email codes" },
      {
        type: "p",
        text: "Supabase can send sign-in codes by email, but I wanted something that doesn't depend on an inbox. An authenticator app on my phone makes a new 6-digit code every 30 seconds from a secret that is only on my phone. This is called TOTP, a time-based one-time password. It works offline, and Supabase supports it for free.",
      },
      { type: "h2", text: "How signing in works now" },
      {
        type: "ul",
        items: [
          "Step 1: email and password, as before.",
          "Step 2: the 6-digit code from the app. Only then does the dashboard appear.",
          "The first time, the page shows a QR code instead. I scanned it with the app and typed in the first code to prove it worked. After that, it only ever asks for the code.",
          "There's no way to skip it: without an app set up, the page goes straight to the set-up screen.",
        ],
      },
      {
        type: "code",
        lang: "ts",
        code: `const { data } = await supabase.auth.mfa.enroll({ factorType: "totp" }); // QR code to scan
await supabase.auth.mfa.challengeAndVerify({ factorId, code });             // check a code`,
      },
      { type: "h2", text: "The part that really protects the data" },
      {
        type: "p",
        text: "Hiding the dashboard behind a code screen isn't enough on its own, because someone with my password could skip my page and call the Supabase API directly. So I changed the database rules too. Supabase puts an \"assurance level\" in every login token: aal1 means password only, aal2 means password plus code. All my owner rules now go through one function that checks both my user ID and aal2:",
      },
      {
        type: "code",
        lang: "sql",
        code: `create function public.is_owner() returns boolean as $$
  select auth.uid() = 'my-user-id'::uuid
     and (auth.jwt() ->> 'aal') = 'aal2';
$$;

create policy "Owner can read messages"
  on public.messages for select to authenticated
  using ((select public.is_owner()));`,
      },
      {
        type: "p",
        text: "I tested it on a local copy of the database. Signed in as me with only a password (aal1), I couldn't read messages, drafts or the activity log, adding a project or uploading an image failed with \"violates row-level security policy\", and editing or deleting changed nothing. With the code (aal2), everything worked. Visitors can still send messages from the Contact page.",
      },
      {
        type: "p",
        text: "One small bug I found while testing: pasting a code like \"123 456\" only kept 5 digits, because the box had a 6-character limit and counted the space. Now the page removes spaces first.",
      },
      {
        type: "tip",
        text: "Lesson: two-step sign-in only counts if the database checks it too. A code screen stops people using my page; the aal2 rule stops them using my data.",
      },
    ],
  },
  {
    slug: "sign-in-that-ends-when-the-tab-closes",
    title: "A sign-in that ends when I close the tab",
    description:
      "If I forgot to sign out of my admin page, anyone using that computer could open it. Now the sign-in lives in one tab and ends when it closes.",
    date: "2026-10-24",
    updated: "2026-10-25",
    tags: ["Security", "Supabase", "Browser storage"],
    body: [
      {
        type: "p",
        text: "I noticed a problem with my admin page: if I signed in on a computer and forgot to press Sign out, the next person to open my admin page on that computer went straight into my dashboard. Opening it in a new tab did the same. That's because of where Supabase keeps the sign-in.",
      },
      { type: "h2", text: "localStorage vs sessionStorage" },
      {
        type: "p",
        text: "Browsers have two small storage spaces for each website. localStorage is shared by every tab and stays until it is cleared, even after the browser is closed. sessionStorage belongs to one tab only and is wiped when that tab or window closes. Supabase uses localStorage by default, so the sign-in stayed around. I told it to use sessionStorage instead:",
      },
      {
        type: "code",
        lang: "ts",
        code: `createClient(url, key, {
  auth: { storage: window.sessionStorage },
});`,
      },
      { type: "h2", text: "What happens now" },
      {
        type: "ul",
        items: [
          "My admin page always opens on the sign-in form. Nothing from the dashboard is in the page until Supabase confirms a sign-in made in this tab.",
          "A new tab, a new window or another person on the same computer gets the sign-in form, while my own tab stays signed in.",
          "Closing the window signs me out, even if I forget to press Sign out.",
          "Refreshing keeps me signed in, because sessionStorage survives a refresh.",
        ],
      },
      { type: "h2", text: "The sneaky case: reopening a closed tab" },
      {
        type: "p",
        text: "While testing, I learned that browsers can bring a closed tab back together with its sessionStorage, with Ctrl+Shift+T or when Chrome restores tabs after a restart. So the page writes down the time whenever it is closed or left (the pagehide event). When it opens again, it compares: a refresh comes back within about a second, but a reopened tab comes back much later. If it was gone for more than a few seconds, it signs out.",
      },
      {
        type: "code",
        lang: "ts",
        code: `window.addEventListener("pagehide", () =>
  sessionStorage.setItem(LEFT_AT_KEY, String(Date.now())));

// when the page opens again
if (Date.now() - leftAt > REOPEN_LIMIT) await supabase.auth.signOut({ scope: "local" });`,
      },
      {
        type: "p",
        text: "I also delete the old sign-in that earlier versions saved in localStorage, so nothing is left behind. I tested every case in a browser: a fresh visit, signing in, refreshing, a second tab, reopening a closed tab and starting a new browser. Only my own open tab ever showed the dashboard.",
      },
      {
        type: "tip",
        text: "Lesson: where you store a sign-in decides how long it lasts. For a private admin page, shorter is safer.",
      },
    ],
  },
  {
    slug: "drafts-and-activity-log",
    title: "Drafts and an activity log: letting the database keep track",
    description:
      "My admin page now has drafts that visitors can't see, a live preview, a history of every change and an automatic sign-out.",
    date: "2026-10-24",
    updated: "2026-10-27",
    tags: ["Supabase", "RLS", "Triggers"],
    body: [
      {
        type: "p",
        text: "Until now, every project I added in my admin page went live on my site straight away, and nothing remembered what I had changed. I wanted to work on a project before showing it, see how it would look first, and have a history of my changes.",
      },
      { type: "h2", text: "1. Drafts that are really hidden" },
      {
        type: "p",
        text: "Each project now has a published column and a Live / Draft switch in my admin page. The easy way to hide drafts would be to filter them out in my page code, but then anyone calling the Supabase API directly could still read them. So I changed the Row Level Security rule instead:",
      },
      {
        type: "code",
        lang: "sql",
        code: `create policy "Anyone can read published projects"
  on public.projects for select
  to anon, authenticated
  using (published or (select public.is_owner()));`,
      },
      {
        type: "p",
        text: "Visitors only get published projects. is_owner() is true only for my account (and, since I added two-step sign-in, only after I've entered my authenticator code), so I get everything, so drafts still show in my admin page with a Draft label. My public pages didn't need any changes at all, because the database now leaves drafts out for them.",
      },
      { type: "h2", text: "2. A live preview" },
      {
        type: "p",
        text: "While I fill in the form, a preview underneath shows the real project card from my Projects page, built from what I've typed so far. It's the same component, not a copy, so it can't look different. The preview has the HTML attribute inert, which means its buttons can't be clicked or reached with Tab, so I can't leave the page with unsaved changes by accident.",
      },
      { type: "h2", text: "3. An activity log written by the database" },
      {
        type: "p",
        text: "I could have saved a history entry from my admin page after each change, but a history written by the browser can be faked or skipped. Instead, a trigger (code that runs inside the database automatically) writes to an activity_log table whenever a project is added, edited, published, moved to drafts, reordered or deleted. It even works out what changed, like \"Edited MyFlix (summary, tags)\".",
      },
      {
        type: "code",
        lang: "sql",
        code: `create trigger projects_activity
  after insert or update or delete on public.projects
  for each row execute function public.log_project_activity();`,
      },
      {
        type: "ul",
        items: [
          "Only my account can read the log (an RLS select policy).",
          "There are no insert, update or delete policies, so nobody can add, change or remove entries from a browser, not even me. Only the trigger can write.",
          "Dragging one project can move several others, so entries made within a few seconds are grouped into one line: \"Changed the project order (3 projects moved)\".",
          "New entries appear live, using Realtime like my inbox.",
        ],
      },
      {
        type: "p",
        text: "Update: the log now also records messages and project images, not just projects. My note \"One timeline for projects, messages and images\" explains how.",
      },
      {
        type: "p",
        text: "I tested it on a local copy of the database: as a visitor and as another signed-in account, reading the log returned nothing, and adding, changing or deleting entries failed with \"permission denied\". A draft stayed hidden from both, even when they tried to publish it.",
      },
      { type: "h2", text: "4. Automatic sign-out" },
      {
        type: "p",
        text: "If I leave my laptop open, anyone could use my admin page. Now, after a while without clicks, typing or scrolling, a \"Still there?\" box counts down, and then I'm signed out. If the laptop was asleep, I'm signed out as soon as it wakes.",
      },
      {
        type: "tip",
        text: "Lesson: if a rule really matters, like who can see a draft or what goes in a history, let the database enforce it. The page can then focus on looking good.",
      },
    ],
  },
  {
    slug: "live-admin-inbox",
    title: "Making my admin inbox live with Supabase Realtime",
    description:
      "New contact messages now pop into my admin page the moment they're sent, without refreshing, and only my account receives them.",
    date: "2026-10-24",
    updated: "2026-10-25",
    tags: ["Supabase", "Realtime", "Admin"],
    body: [
      {
        type: "p",
        text: "My contact form saves messages to Supabase, and my private admin page has an inbox to read them. It worked, but I had to press Refresh to see anything new. A real inbox should tell you when something arrives, so I made it live.",
      },
      { type: "h2", text: "Supabase Realtime" },
      {
        type: "p",
        text: "Supabase Realtime keeps a connection open between my admin page and the database. When a row is added, changed or deleted in the messages table, the database pushes that change to the page straight away. I only had to switch it on for my table, once, in the SQL Editor:",
      },
      {
        type: "code",
        lang: "sql",
        code: `alter publication supabase_realtime add table public.messages;`,
      },
      {
        type: "p",
        text: "Then the inbox listens for changes. A new message is added to the top of the list and a small pop-up says \"New message from Thabo\". A small \"Live\" dot next to the title shows the connection is working.",
      },
      {
        type: "code",
        lang: "ts",
        code: `supabase
  .channel("admin-inbox")
  .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
    if (payload.eventType === "INSERT") {
      // add it to the top of the inbox and show the pop-up
    }
  })
  .subscribe();`,
      },
      { type: "h2", text: "Is that safe?" },
      {
        type: "p",
        text: "This was my first question. If the database pushes messages out, could a visitor listen in? No: Realtime follows the same Row Level Security rules as everything else. A browser is only sent the rows it is allowed to read, and only my account is allowed to read messages. A visitor who subscribes to the same table simply receives nothing.",
      },
      { type: "h2", text: "Small things that make it feel like a real inbox" },
      {
        type: "ul",
        items: [
          "The browser tab shows how many messages are unread, like \"(2) Admin\", so I notice even when I'm in another tab.",
          "A search box finds messages by name, email or text, and All / Unread / Read buttons filter the list.",
          "Reply opens my email app with the sender's address, a subject, a greeting with their first name and their message quoted underneath.",
          "Deleting a message shows \"Message deleted · Undo\" for 5 seconds before it is really deleted, so one wrong tap isn't permanent.",
        ],
      },
      {
        type: "p",
        text: "For Undo, the message disappears from the list straight away, but the delete is only sent to Supabase after 5 seconds. Pressing Undo cancels the timer, so nothing was ever deleted. If the delete fails, for example because I'm not allowed, the message comes back and an error explains why.",
      },
      {
        type: "tip",
        text: "Lesson: a live feature still has to follow the security rules. Realtime with RLS means I didn't have to write any new security code; the rules I already had protect it.",
      },
    ],
  },
  {
    slug: "why-my-portfolio-has-tests",
    title: "Why my portfolio has 47 automated tests",
    description:
      "Tests are small programs that check my code still does what it should. Here's what mine check and how GitHub runs them on every push.",
    date: "2026-10-23",
    updated: "2026-10-26",
    tags: ["Testing", "Vitest", "GitHub Actions"],
    body: [
      {
        type: "p",
        text: "Every time I change my site, something else could break without me noticing. Clicking through every page after every change is slow, and I would still miss things. So my portfolio has automated tests: small pieces of code that run my real code with example inputs and check the answers are right.",
      },
      { type: "h2", text: "What a test looks like" },
      {
        type: "p",
        text: "I use Vitest, a testing tool that works well with TypeScript. A test describes what should happen in plain words, runs the code, and then \"expects\" a result. This one checks that a project title becomes the right page address:",
      },
      {
        type: "code",
        lang: "ts",
        code: `it("turns & into 'and'", () => {
  expect(slugify("Fish & Bones")).toBe("fish-and-bones");
});`,
      },
      {
        type: "p",
        text: "If someone (including me) changes slugify and breaks it, this test fails and says exactly which rule stopped working.",
      },
      { type: "h2", text: "What my tests check" },
      {
        type: "ul",
        items: [
          "Page addresses: project titles turn into clean addresses, and a project with a case study links to it.",
          "Spam protection: a normal message is accepted, while a filled-in hidden field or a form sent impossibly fast is treated as a bot. Empty names, bad emails and messages that are too short or too long are rejected.",
          "Proof for every skill: every skill on my Skills page must link to evidence, so I can't list a skill I can't back up.",
          "Files really exist: every certificate image, case study screenshot and my CV PDF are where the site links to them, so there are no broken images.",
          "Dev notes: every note has its own address, a real date and a description short enough for Google.",
          "SEO and the contact card: pages get a canonical address and share tags, and the \"Save my contact\" file is a valid vCard.",
          "The reading progress bar on this page: empty at the top, half full halfway, and never more than full.",
        ],
      },
      {
        type: "p",
        text: "Some tests run once for every item, like one check per skill, which is how 28 written tests become 47 checks.",
      },
      { type: "h2", text: "GitHub runs them for me" },
      {
        type: "p",
        text: "I don't have to remember to run them. A GitHub Action (a small job GitHub runs on its own computers) installs my project and runs npm test every time I push. In the Actions tab on GitHub, a green tick means everything passed and a red cross shows which test failed.",
      },
      {
        type: "code",
        lang: "yaml",
        code: `on:
  push:
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: 22
      - run: npm install
      - run: npm test`,
      },
      {
        type: "p",
        text: "This sits next to my Lighthouse check, another GitHub Action that tests the live site's speed, accessibility and SEO a few minutes after every push. Together they mean a mistake shows up in minutes, not when a recruiter finds it.",
      },
      {
        type: "tip",
        text: "Lesson: a test is a promise written in code. Write one for each rule you never want to break, and let GitHub check it for you.",
      },
    ],
  },
  {
    slug: "animations-switch-from-peer-review",
    title: "Turning peer review into a feature: the animations switch",
    description:
      "A classmate said my portfolio had too much colour and animation. Instead of removing them, I let every visitor choose.",
    date: "2026-10-23",
    tags: ["Accessibility", "Peer review", "CSS"],
    body: [
      {
        type: "p",
        text: "In peer review, my classmate said my site stands out and feels finished, but that it has too much colour and animation for someone who likes a minimal style. That was fair. The animations are part of my style, so I didn't want to delete them, but I also didn't want them to get in anyone's way.",
      },
      { type: "h2", text: "The idea: let the visitor decide" },
      {
        type: "p",
        text: "I added an animations switch. On a laptop or tablet it is a small round button in the top bar, next to the light and dark mode button. On a phone it is an on/off switch inside the menu. It also works from the Ctrl+K search and from my terminal with the command motion.",
      },
      {
        type: "p",
        text: "I first put the switch in the footer, but nobody scrolls all the way down to change a setting. People look for settings at the top, next to the theme button, so that is where it lives now.",
      },
      { type: "h2", text: "How it remembers your choice" },
      {
        type: "p",
        text: "When you switch animations off, the site saves the word \"reduced\" in localStorage (a small storage space the browser keeps for each website) and adds data-motion=\"reduced\" to the page's <html> tag. On your next visit, a tiny script in the page's <head> reads that choice before anything is drawn, so the animations never flash on and then stop.",
      },
      {
        type: "code",
        lang: "js",
        code: `// Runs before the page is drawn (lib/theme.ts)
if (localStorage.getItem("motion") === "reduced")
  document.documentElement.dataset.motion = "reduced";`,
      },
      { type: "h2", text: "What the calm version looks like" },
      {
        type: "p",
        text: "My CSS already had rules for prefers-reduced-motion, a setting on phones and computers for people who get dizzy or distracted by movement. I copied those same rules for data-motion=\"reduced\", so switching off gives exactly the same calm version:",
      },
      {
        type: "ul",
        items: [
          "Every animation and transition finishes instantly.",
          "The scrolling strip of tech I work with stops and becomes a neat, centred list.",
          "Cards and sections appear straight away instead of sliding in as you scroll.",
          "The stripe that sweeps across the top when you change page is hidden.",
        ],
      },
      { type: "h2", text: "When the device has already said no" },
      {
        type: "p",
        text: "If your phone or computer is set to reduce motion, that always wins. The switch shows as off and can't be turned on, and its label explains why: \"Animations are off because your device asks for less motion\". A website shouldn't override an accessibility setting someone chose on purpose.",
      },
      {
        type: "p",
        text: "The switch also has role=\"switch\" and aria-checked, so a screen reader announces it as an on/off switch and says whether animations are on.",
      },
      {
        type: "tip",
        text: "Lesson: feedback doesn't always mean removing something. Sometimes the best fix is giving people a choice and making the default respect their settings.",
      },
    ],
  },
  {
    slug: "phone-navigation-bar",
    title: "Building a phone navigation bar that actually stays put",
    description:
      "I added an app-style bar to the bottom of my site on phones. It kept moving, and the real cause was an 8-pixel glow I couldn't even see.",
    date: "2026-10-22",
    tags: ["Mobile", "CSS", "Debugging"],
    body: [
      {
        type: "p",
        text: "On phones, my site now has a bar fixed to the bottom of the screen with Home, Projects, Search, Notes and Contact, like an app. Your thumb can reach it, so you never have to scroll back up to the menu. My first version had three problems.",
      },
      { type: "h2", text: "1. Hiding it while scrolling felt broken" },
      {
        type: "p",
        text: "I first made the bar slide away when you scroll down and come back when you scroll up, which a lot of apps do. On my phone it just felt unreliable: the bar kept disappearing exactly when I wanted to tap it. Now it never moves. A navigation bar you can always find is better than a clever one.",
      },
      { type: "h2", text: "2. The blur made scrolling stutter" },
      {
        type: "p",
        text: "The bar had a see-through, blurred background. It looks nice, but the phone has to redraw that blur on every frame while you scroll, which made the page judder. A solid background with a soft shadow above it looks almost the same and scrolls smoothly.",
      },
      { type: "h2", text: "3. The real bug: something was 8 pixels too wide" },
      {
        type: "p",
        text: "On the Home page only, the bar sat partly below the bottom of the screen and the page could wobble sideways. I measured the page with JavaScript and found it was 398 pixels wide on a 390-pixel phone. The culprit was the soft red and teal glow behind my terminal card. It was set to spread 24 pixels past the card on every side, so on a narrow screen it poked out past the edge.",
      },
      {
        type: "p",
        text: "You can't see the glow's edge, but the phone's browser can. When anything is wider than the screen, it makes the whole page wider to fit it, and \"fixed to the bottom of the screen\" then means the bottom of that wider, slightly zoomed page. Two fixes:",
      },
      {
        type: "code",
        lang: "html",
        code: `<!-- The glow only spreads sideways on large screens -->
<div class="fx-glow absolute -inset-y-6 inset-x-0 lg:-inset-6 ..."></div>

<!-- And the page can never be wider than the screen -->
<html class="overflow-x-clip">`,
      },
      { type: "h2", text: "How I checked it" },
      {
        type: "ul",
        items: [
          "I scrolled through five pages on three phone sizes (360, 390 and 430 pixels wide) and recorded where the bar's bottom edge was on every step. It was always exactly at the bottom of the screen.",
          "I scrolled to the very end of each page to check the footer isn't hidden behind the bar. The page has extra space at the bottom on phones so nothing gets covered.",
          "I compared screenshots of my desktop pages before and after. They're identical, because the bar only exists below tablet size.",
        ],
      },
      {
        type: "tip",
        text: "Lesson: if something fixed to the screen won't stay put on a phone, look for anything wider than the screen, even something invisible like a glow or a shadow.",
      },
    ],
  },
  {
    slug: "testing-on-a-real-phone",
    title: "What I learned when I tested my portfolio on my own phone",
    description:
      "My site looked perfect on my laptop. On my phone, the tech strip froze, cards left blank gaps and the screenshots were slow. Here's what was really going on.",
    date: "2026-10-22",
    tags: ["Mobile", "CSS", "Accessibility"],
    body: [
      {
        type: "p",
        text: "I had checked my portfolio at phone sizes in the browser's developer tools, and everything passed. Then I opened it on my actual phone and found five problems straight away. Testing on a real device showed me things a desktop browser pretending to be a phone did not.",
      },
      { type: "h2", text: "1. The tech strip froze when I tapped it" },
      {
        type: "p",
        text: "My \"Tech I work with\" strip scrolls sideways and pauses when you hover over it with a mouse. Phones don't have hover, so they treat a tap as a hover, and the hover never ends. One tap and the strip stopped for good. The fix was to only pause on hover on devices that actually have a mouse:",
      },
      {
        type: "code",
        lang: "css",
        code: `@media (hover: hover) {
  .fx-marquee-wrap:hover .fx-marquee {
    animation-play-state: paused;
  }
}`,
      },
      { type: "h2", text: "2. My phone was asking for less motion" },
      {
        type: "p",
        text: "Even after that, most of my animations still didn't play on my phone. The reason surprised me: my phone's power saving mode tells websites \"reduce motion\" (a setting for people who feel dizzy or distracted by movement), and my site was already respecting it by switching animations off. So the site was doing the right thing. The problem was what it looked like afterwards: the strip stopped half-way, with tech names cut off at the edge of the screen.",
      },
      {
        type: "p",
        text: "Now, when a device asks for less motion, the strip turns into a neat wrapped list that shows every technology. People who want a calm site still see everything.",
      },
      { type: "h2", text: "3. Blank gaps while scrolling" },
      {
        type: "p",
        text: "My cards fade in as they scroll into view, and they only finished fading once they were 22% of the way up the screen. On a laptop that's fine, but a phone screen is short, so the bottom part of the screen often looked empty while I scrolled. On phones and tablets, cards now finish appearing once their top edge is 120 pixels onto the screen:",
      },
      {
        type: "code",
        lang: "css",
        code: `@media (max-width: 1023px) {
  .fx-reveal {
    animation-range: entry 0px entry 120px;
  }
}`,
      },
      { type: "h2", text: "4. Light mode looked wrong" },
      {
        type: "p",
        text: "My phone's browser has its own dark mode that recolours websites, so it was fighting my light theme. I added one setting that tells browsers my site already has its own dark and light themes (color-scheme: dark light), so they leave my colours alone.",
      },
      { type: "h2", text: "5. Slow screenshots and a missing QR code" },
      {
        type: "ul",
        items: [
          "Screenshots: I switched the image format Vercel creates from AVIF to WebP, which is much quicker to make the first time, and added a soft shimmer while an image loads so the space never looks broken.",
          "QR code: I had hidden it on phones because \"you can't scan your own screen\". But it's actually handy on a phone, so someone else can scan it straight off my screen. Now it shows everywhere.",
        ],
      },
      {
        type: "p",
        text: "All of these fixes only apply to phones and tablets, or to people who ask for less motion. I compared screenshots of my desktop pages before and after, and they stayed the same.",
      },
      {
        type: "tip",
        text: "Lesson: developer tools are a good start, but always test on a real phone. Real phones have touch screens, battery-saving settings and their own browser features that change how a site behaves.",
      },
    ],
  },
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
    updated: "2026-10-24",
    tags: ["Security", "Supabase", "Forms"],
    body: [
      {
        type: "p",
        text: "A public contact form is an open door for spam bots. The usual fix is a CAPTCHA (the \"I'm not a robot\" puzzle), but those annoy real people. I wanted protection that visitors never notice.",
      },
      { type: "h2", text: "Layer 1: a honeypot" },
      {
        type: "p",
        text: "The form has an extra field that people can't see or reach with the keyboard. Bots fill in every field they find, so if that field has anything in it, my API route quietly throws the message away but still answers \"sent\", so the bot doesn't learn anything.",
      },
      { type: "h2", text: "Layer 2: too fast to be human" },
      {
        type: "p",
        text: "The form remembers when it was opened. A message sent faster than any person could type it is almost certainly a bot, so it gets the same quiet treatment.",
      },
      { type: "h2", text: "Layer 3: a rate limit in the database" },
      {
        type: "p",
        text: "This is the one that can't be skipped, because it runs inside Supabase itself, not in my website code. A trigger checks every new message before it is saved:",
      },
      {
        type: "ul",
        items: [
          "a limit on messages from the same email address in a short time",
          "a limit per visitor (I store a one-way hash of the IP address, never the IP itself)",
          "a limit on the total number of messages per hour, in case lots of bots try at once",
        ],
      },
      {
        type: "code",
        lang: "sql",
        code: `-- the real limits are kept in the database, not in this post
if recent_from_sender >= max_per_sender then
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
    updated: "2026-10-25",
    tags: ["Supabase", "RLS", "Security"],
    body: [
      {
        type: "p",
        text: "My Projects page loads from a Supabase database, and my admin page lets me add, edit and delete projects. The key that connects my site to Supabase is public (anyone can find it in the browser), so the website alone can't be trusted to keep people out. The database has to do it.",
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
        type: "p",
        text: "Update: these rules are even stricter now. \"Only my account\" also means I must have entered the code from my authenticator app, so a stolen password isn't enough. My note on two-step sign-in explains how.",
      },
      {
        type: "tip",
        text: "Lesson: test security as the person you're trying to keep out, not just as yourself.",
      },
    ],
  },
];

/**
 * Gives each sub-heading in a note its own address, like #what-had-gone-stale, so a link
 * can point straight to that section. Blocks that aren't headings get null.
 * Two headings with the same words get -2, -3 on the end so every address is unique.
 */
export function headingIds(body: Block[]) {
  const used = new Map<string, number>();
  return body.map((block) => {
    if (block.type !== "h2") return null;
    const base = slugify(block.text) || "section";
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  });
}

/** The notes either side of this one. The list is newest first, so "older" is the next one in it. */
export function noteNeighbours(slug: string) {
  const i = notes.findIndex((n) => n.slug === slug);
  if (i === -1) return { older: null, newer: null };
  return { older: notes[i + 1] ?? null, newer: i > 0 ? notes[i - 1] : null };
}

/** The date a note last changed: its "updated" date if it has one, otherwise when it was published */
export function lastChanged(note: Note) {
  return note.updated ?? note.date;
}

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

/** "2026-10-25" -> "25 Oct", for tight spaces like the notes list */
export function formatShortDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "short" });
}

/** "2026-10-21" -> "21 October 2026" */
export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}
