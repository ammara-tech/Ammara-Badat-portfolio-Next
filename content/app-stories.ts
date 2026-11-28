/*
  ✍️ MY WORDS — "The thinking behind it": a short case study for each of my apps from PaperTrail to
  FixMyStreet SA, shown near the bottom of each project's page (/projects/<key>), under the
  "How it works" diagram. Keyed by the project's page address, like content/architecture.ts.

  Each one has the problem I wanted to solve, the decisions that mattered, and what I'd do
  differently or next. The decisions come from my dev notes and each app's diagram
  (content/architecture.ts); the "different or next" lists are ideas and honest gaps.
  These are drafts: read them and change anything that doesn't sound like me.
*/

export type AppStory = {
  problem: string;
  decisions: { title: string; text: string }[];
  different: string[];
};

export const appStories: Record<string, AppStory> = {
  "fixmystreet-sa": {
    problem:
      "A pothole or a broken streetlight is usually reported in a phone queue or a Facebook group, and the person who reported it never hears what happened. I wanted one public map where a resident can report a problem in under a minute, neighbours can add their voice, and anyone can see how far the council has got.",
    decisions: [
      {
        title: "A vote can't be typed in",
        text: "The count decides which problem rises to the top, so it's worth cheating. Each vote is its own document, and the report's count can only move by exactly one, in the same step as that vote. The security rules enforce this, not just my code.",
      },
      {
        title: "Only council can change a status",
        text: "A staff member is a document I add by hand in the Firebase console. The app can look at its own, never write one, so nobody can promote themselves: there is no button for it and the rules refuse the write.",
      },
      {
        title: "Show what's nearby before saving",
        text: "Before a new report is saved, the app shows any report within 100 metres first. That way a neighbour adds a vote to the existing problem instead of starting a second pile.",
      },
    ],
    different: [
      "Test the security rules against the Firebase emulator. Today my tests check that the lists and limits in the rules file match the app's, and I test the rest by hand: voting twice, taking a vote back, writing a different number.",
      "Give council a proper staff screen. Adding a staff member by hand is fine for one council, but not for many.",
      "Tell people when a report near them changes status, instead of waiting for them to look.",
    ],
  },

  rsvpme: {
    problem:
      "Hosts run an RSVP through a WhatsApp group and a spreadsheet: people reply \"yes\" to everyone, nobody is sure who is actually coming, and the host chases guests one by one. I wanted a link a guest can open without an account, a live count of the seats left, and a guest list the host can actually use.",
    decisions: [
      {
        title: "One public number, private replies",
        text: "Anyone with the link sees how many seats are left, but a reply (a name, what they eat, a message) is only readable by the host and that guest. So the seats taken live in their own document with no names on it, and the invitation page reads only that.",
      },
      {
        title: "The reply and the count move together",
        text: "Answering is a transaction: it works out the change in seats and saves the reply and the new number in one step, so two guests can never take the last seat. The rules check the maths too, so nobody can write a smaller number straight to the database.",
      },
      {
        title: "No accounts for guests",
        text: "Replying gives a guest account with no email and no password. Guests only need the link or a QR code, and the host can remind everyone who hasn't answered on WhatsApp.",
      },
    ],
    different: [
      "Test the seat-count rules against the Firebase emulator. Right now I check them by hand: answering as a guest, changing an answer, and trying to write a number that doesn't match.",
      "Add a waiting list, so a cancelled seat is offered to the next person instead of going empty.",
    ],
  },

  bookme: {
    problem:
      "A small business like a salon or a tutor often takes bookings on WhatsApp and a paper diary, which leads to double bookings and a lot of back-and-forth. I wanted a booking page a customer can open from a link, where times disappear as they are taken and the owner's diary fills itself.",
    decisions: [
      {
        title: "A record for every taken time",
        text: "Each taken time slot is its own small record, named by its date and time, so \"Saturday at 09:00\" can only exist once. A three-hour service takes six half-hour slots. The records carry no names, so the booking page can show what is taken without showing who took it.",
      },
      {
        title: "Check and take in one step",
        text: "Booking is a transaction: on the server it checks that every slot the service needs is still free, then takes them all and saves the booking. If someone got there first, it fails and the customer is told.",
      },
      {
        title: "The rules back it up",
        text: "A slot can only be created or removed, never changed, so a taken time can't be handed to someone else. A booking with a name and phone number can only be read by the owner and the customer who made it.",
      },
    ],
    different: [
      "Run the security rules in the Firebase emulator before publishing. A field I called \"service\" is a reserved word in the rules language, and I only found out when Firebase rejected the rules on publish.",
      "Test the rules automatically, not by hand.",
      "Remind customers the day before their booking, to cut down on no-shows.",
    ],
  },

  papertrail: {
    problem:
      "Freelancers and small businesses often write quotes in a document, chase payments from memory and keep receipts as photos on a phone. I wanted quotes and invoices in one place that works on a phone in a bakkie and a laptop in the office, even when the signal drops.",
    decisions: [
      {
        title: "The sums are done in cents",
        text: "VAT and totals are worked out in whole cents in the browser, so a quote and its invoice always add up exactly and a customer never sees a number that is a cent out.",
      },
      {
        title: "Save to the phone first",
        text: "Saving writes to the offline copy first, so it shows straight away, and Firestore sends it to Google when it can. The same documents then appear on the laptop within a moment.",
      },
      {
        title: "Only you can see your business",
        text: "Google's servers check every read and write, so only the signed-in owner can see or change their own quotes, invoices and receipts. Receipt photos are shrunk on the phone before they upload, which keeps mobile data costs down.",
      },
    ],
    different: [
      "Make a real PDF file in the app. Today Download PDF opens a print layout and the browser saves it, which depends on the browser. CVcraft later used pdf-lib for this and it is better.",
      "Let a customer open a quote from a link and accept it there.",
    ],
  },

  ticklist: {
    problem:
      "A household's shopping list usually lives in a WhatsApp chat that nobody ticks off, so people buy the same thing twice or forget the milk. I wanted one list the whole household shares, where a tick on one phone shows on all of them.",
    decisions: [
      {
        title: "One live list per household",
        text: "Every phone in the household listens to the same list in Firestore. A tick changes the offline copy first, then travels to everyone else's phone, so it feels instant.",
      },
      {
        title: "Joining needs a real invite code",
        text: "Only people in a household can read or change its list. Joining adds only yourself, and the security rules check the invite code, so guessing a household's name gets a stranger nowhere.",
      },
      {
        title: "It works with no signal",
        text: "In a shop with no signal, ticks are kept on the phone and sent when the signal is back. Typing \"2 milk, bread\" is split into items with amounts, so adding things takes seconds.",
      },
    ],
    different: [
      "Tell the household when someone adds something while they are in the shop, instead of waiting for them to look.",
      "Remember what a household buys most, so the usual things can be added in one tap.",
    ],
  },

  rememba: {
    problem:
      "Flashcard apps are either expensive or lock your decks in. Students also forget cards at the exact moment they were about to revise them. I wanted a free one that shows the cards you are about to forget, with decks you can share.",
    decisions: [
      {
        title: "The scheduler runs on the device",
        text: "Each answer moves the card's next review further away if you knew it, or closer if you didn't. Working it out on the phone means studying is instant and works offline.",
      },
      {
        title: "Typed answers forgive small typos",
        text: "Checking an answer you typed forgives small typos, so a wrong letter doesn't count as forgetting the card and wreck the schedule.",
      },
      {
        title: "A shared deck is a copy, not a window",
        text: "Sharing saves a copy of the deck's words under a long random code, and the link is that code. Whoever opens it adds their own copy, shared decks can never be listed, and your progress is never shared.",
      },
    ],
    different: [
      "Compare my scheduler with a well-known one, like Anki's, using real study data, instead of trusting that mine is close.",
      "Add pictures and sound to cards, which matters for languages and diagrams.",
    ],
  },

  shiftboard: {
    problem:
      "A small team's rota is often built in a spreadsheet and sent as a screenshot, so staff don't know which shifts are final, swaps are arranged in chat and nobody trusts the hours. I wanted one rota where managers and staff see and do different things.",
    decisions: [
      {
        title: "Drafts never reach staff",
        text: "A manager builds the week as drafts. Staff phones ask only for published shifts, so a draft can't leak, and only managers can see pay rates. The database enforces this, not just the screen.",
      },
      {
        title: "A swap moves in one batch",
        text: "Approving a giveaway moves the shift to the other person in a single batch, so a shift can never end up owned by two people, or by nobody, halfway through.",
      },
      {
        title: "Clock-in is checked against Google's clock",
        text: "The rules compare a clock-in time with the server's own clock, so nobody can clock in for yesterday. Hours then add up for payroll from the clocked times, ready to download for Excel.",
      },
    ],
    different: [
      "Message staff when a week is published, instead of waiting for them to open the app.",
      "Add shift templates, so a regular week can be built in one tap.",
    ],
  },

  hiretrack: {
    problem:
      "Job hunting in a spreadsheet means you forget to follow up, lose track of who replied and can't tell if your applications are working. I built a private board for my own job search that tells me what needs doing today.",
    decisions: [
      {
        title: "One function decides what a move means",
        text: "Dragging a job to Applied is handled by one function that saves the date you applied and sets a reminder a week later. Keeping that logic in one place means the board, the list and the stats can't disagree.",
      },
      {
        title: "Honest stats",
        text: "When a company answers, that day is saved as the day you heard back, so response times and rates are measured from real dates, not guessed.",
      },
      {
        title: "It never sends anything itself",
        text: "Email them opens a follow-up already written in your own email app, and interviews download as a calendar file so your phone does the reminding. Nothing is sent from my server, and the rules check every saved field: known values, safe links and sensible sizes.",
      },
    ],
    different: [
      "Show a notification on the phone when a follow-up is due, instead of relying on the Today page and the calendar.",
      "Add a job from a link by reading the company and role from the page.",
    ],
  },

  stokvelbook: {
    problem:
      "A stokvel's money is often kept in a notebook and a WhatsApp chat, which leads to arguments about who paid, who was fined and where the money went. I wanted one shared book where every member sees the same records, and nobody can quietly change them.",
    decisions: [
      {
        title: "Entries can't be edited or deleted",
        text: "Nobody, not even the chairperson or treasurer, can change or delete an entry. A mistake is cancelled with a reason, and both stay in the history, so the record can always be trusted.",
      },
      {
        title: "Only two roles can add money",
        text: "Only members can see the group, and only the chairperson and treasurer add to the money book. Every entry shows who recorded it and when.",
      },
      {
        title: "WhatsApp stays the way people talk",
        text: "Remind opens WhatsApp with a polite message already written, and the invite link is shared in the group's own chat. StokvelBook never sends anything itself, so it fits how stokvels already work.",
      },
    ],
    different: [
      "Send payment reminders automatically before payment day, instead of the treasurer pressing Remind each month.",
      "Handle members who join part-way through the year.",
    ],
  },

  queueup: {
    problem:
      "Salons, clinics and small shops often run a queue on paper numbers or a crowd by the door, and customers can't leave and come back. I wanted a queue a customer joins by scanning a code, with no app to install and no account to make.",
    decisions: [
      {
        title: "Numbers handed out one at a time",
        text: "The server hands out numbers one at a time, so two people scanning at the same moment never get the same number.",
      },
      {
        title: "Strangers can see numbers, never names",
        text: "Anyone can see a queue's numbers but never a name. A customer can only take the next number or leave the line, and everything else belongs to the owner.",
      },
      {
        title: "No account for customers",
        text: "Scanning the QR code opens the queue's page, and joining gives a guest account with no email and no password. The customer's phone shows their place and updates by itself, then turns green and dings when they're called.",
      },
    ],
    different: [
      "Message a customer when they are three places away, so they can wait in their car or nearby.",
      "Let the owner run more than one queue at once, such as different counters.",
    ],
  },

  powerplan: {
    problem:
      "Prepaid electricity has a way of running out at night. I wanted to type in a few meter readings and always know how many units are left, when they'll run out and what the month will cost.",
    decisions: [
      {
        title: "Use works out from readings and purchases",
        text: "Between two readings, what you used is the earlier reading, plus what you bought, minus what's left. That one rule is exact and needs nothing but the numbers you type.",
      },
      {
        title: "Only the last two weeks count",
        text: "Your use a day, the units on the meter right now and the day they'll run out come from the last two weeks, so they describe how you use power today and not how you did last winter.",
      },
      {
        title: "Your readings are yours",
        text: "Readings, purchases and appliances live under your own account, and only you can read or change them. With your recent price per unit, it also says what an appliance costs to run.",
      },
    ],
    different: [
      "Warn me with a notification a day or two before the units run out.",
      "Learn the seasons: use is higher in winter, so the forecast should take that into account.",
    ],
  },

  randwise: {
    problem:
      "Most budgeting apps want a bank login or do their sums in the browser. I wanted to learn how a server-side app with a real SQL database works, and make a budget app where the numbers come from the database, not from the page.",
    decisions: [
      {
        title: "The database does the adding up",
        text: "Totals by month, spending by category and budget progress are SQL queries, not sums done in the browser. The server sends the database a few questions and draws the charts from the short list that comes back.",
      },
      {
        title: "Money is whole cents",
        text: "An amount is turned into whole cents when it's saved, so adding up never drifts. The database also refuses impossible amounts, so a bad number can't get in even if the page lets it through.",
      },
      {
        title: "My own sign-in, done carefully",
        text: "Passwords are mixed with a random salt and run through a slow hash, so they are never stored as typed. Your session is a random code in a cookie that JavaScript can't read, and every row belongs to one person.",
      },
    ],
    different: [
      "Use a proven sign-in service or library instead of my own. Writing sign-in myself taught me a lot, but it's the part of an app I'd least want to maintain.",
      "Import a bank statement file, so entries don't have to be typed by hand.",
    ],
  },

  colourcheck: {
    problem:
      "Colours that look fine to the person who picked them can be hard to read for someone with weaker eyesight or a bright screen. I wanted a quick way to check a pair of colours against the accessibility rules, and to fix them if they fail.",
    decisions: [
      {
        title: "Nothing leaves the browser",
        text: "All the maths happens in the browser: the brightness of each colour with the WCAG formula, then the ratio between them. There's no database and no server code, so what you check is never sent anywhere, and it works offline.",
      },
      {
        title: "It suggests the fix, not just the failure",
        text: "If a pair fails, it tries every lightness in the same hue and picks the closest colour that passes, and one press uses it. That keeps the colour close to the one you wanted.",
      },
      {
        title: "The colours live in the address",
        text: "The two colours are part of the web address, so a share link opens the same pair anywhere with no accounts. It also shows each colour as people with four kinds of colour blindness would see it.",
      },
    ],
    different: [
      "Add APCA, the newer contrast method, beside the WCAG ratio, and show where they disagree.",
      "Save a whole brand palette behind one link, instead of one pair at a time.",
    ],
  },

  cvcraft: {
    problem:
      "Many online CV builders want an account, keep your personal details and make PDFs that job sites' CV readers can't read properly. I wanted a CV builder that stays on your device and makes a file that works.",
    decisions: [
      {
        title: "Your CV never leaves your device",
        text: "CVs are saved in your browser as you type, and the PDF is made in the browser too, so nothing about you is uploaded and there are no accounts. A backup file holds all your CVs, to keep them safe or move them to another device.",
      },
      {
        title: "A real PDF with real text",
        text: "The PDF is drawn with pdf-lib: real text and clickable links, not a picture of the page. That is what lets job sites' CV readers read it.",
      },
      {
        title: "Fit on one page, and help as you type",
        text: "In the background the PDF is built to check that it fits on one A4 page, making the text slightly smaller if needed. A CV check suggests fixes as you type, like leaving out your ID number.",
      },
    ],
    different: [
      "Offer more than one layout, so people can pick the look that suits their field.",
      "Move CVs between devices without a backup file, while still keeping everything private.",
    ],
  },
};
