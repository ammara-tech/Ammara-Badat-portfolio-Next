/*
  ✍️ MY WORDS — "The thinking behind it": a short case study for three of my apps, shown near the
  bottom of each project's page (/projects/<key>), under the "How it works" diagram.
  Keyed by the project's page address, like content/architecture.ts.

  Each one has the problem I wanted to solve, the decisions that mattered, and what I'd do
  differently next time. The decisions come from my dev notes and security rules; the "next time" lists
  are my own honest gaps. These are drafts: read them and change anything that doesn't sound like me.
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
};
