/*
  "It's 13:16 in Johannesburg" on the Contact page (components/LocalTime.tsx),
  so people in other time zones know whether it's a sensible time to call.
  Kept here, away from the component, so it can be tested (tests/contact.test.ts).
*/

export const MY_TIME_ZONE = "Africa/Johannesburg";

/** The time as 24-hour "HH:MM" in a time zone, e.g. "13:16" */
export function clockIn(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone }).format(date);
}

/** The line shown under my location. Adds the visitor's own time only when it's different from mine. */
export function localTimeLine(date: Date, visitorZone: string) {
  const mine = clockIn(date, MY_TIME_ZONE);
  const theirs = clockIn(date, visitorZone);
  return theirs === mine ? `It's ${mine} here in Johannesburg` : `It's ${mine} here in Johannesburg (${theirs} where you are)`;
}
