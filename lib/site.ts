/**
 * Single source of truth for who runs this project and how to reach them.
 *
 * Every user-facing surface (footer, pricing, legal pages, docs) imports from
 * here instead of hard-coding an address. Renaming the owner or moving to a
 * new domain is then a one-line change rather than a hunt across a dozen
 * files — which is exactly the drift that left the previous author's support
 * address behind in the footer and the Code of Conduct.
 */

export const OWNER = {
  name: "Eyasin Arafat",
  role: "Founder & maintainer",
  handle: "explorearafat",
  email: "explorearafat@gmail.com",
  /** E.164, so it works as both a tel: link and a wa.me deep link. */
  phone: "+8801610709657",
  github: "https://github.com/explorearafat",
  instagram: "https://www.instagram.com/explorearafat",
  x: "https://x.com/explorearafat",
  devto: "https://dev.to/explorearafat",
} as const;

export const REPO = {
  owner: "explorearafat",
  name: "InstaMation",
  url: "https://github.com/explorearafat/InstaMation",
  issues: "https://github.com/explorearafat/InstaMation/issues",
  clone: "https://github.com/explorearafat/InstaMation.git",
  workerImage: "explorearafat/instamation-worker",
} as const;

/**
 * Public base URL used for canonical links, Open Graph tags and sitemap URLs.
 * Deployments on Vercel/Netlify should set NEXT_PUBLIC_SITE_URL so the site
 * advertises its real domain instead of the fallback.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://instamation.vercel.app"
).replace(/\/+$/, "");

/** Bare `wa.me` link with no message — the fastest support channel we offer. */
export const WHATSAPP_URL = `https://wa.me/${OWNER.phone.replace(/[^\d]/g, "")}`;

/**
 * Message pre-filled into the chat when someone taps "Get it set up".
 *
 * Written in clear professional English on purpose: the person reading it is
 * the maintainer, and the text doubles as a record of what the customer wants.
 * Pre-filling removes the "hi, hello?" round trip that otherwise costs a whole
 * reply cycle before the actual question is asked.
 */
export const SETUP_MESSAGE =
  "Hello Eyasin, I would like to get the Done-For-You setup for InstaMation " +
  "(Instagram comment-to-DM automation). Could you please walk me through the " +
  "steps to get everything configured? Thank you!";

/** Shorter pre-filled message for general questions that are not setup. */
export const GENERAL_MESSAGE =
  "Hello Eyasin, I have a question about InstaMation. Could you please help me out?";

/**
 * WhatsApp deep link. Pass a message to pre-fill the chat, or omit it for a
 * plain chat link. wa.me works on desktop (WhatsApp Web), iOS and Android, so
 * one URL covers every device the visitor might be on.
 */
export function whatsapp(message?: string): string {
  return message
    ? `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`
    : WHATSAPP_URL;
}

/** mailto: helper that URL-encodes the subject for you. */
export function mailto(subject?: string): string {
  const base = `mailto:${OWNER.email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
}
