export const LINKEDIN_URL_PATTERN = /linkedin\.com\/in\//i;

export function isLikelyLinkedInUrl(input: string): boolean {
  return LINKEDIN_URL_PATTERN.test(input.trim());
}

/**
 * We deliberately do not scrape LinkedIn — it violates LinkedIn's terms of
 * service and is unreliable. This message is shown (client-side) and
 * enforced (server-side, in the extraction API route) whenever a LinkedIn
 * profile URL is submitted. LinkedIn URLs are still accepted as an input
 * shape so a future official LinkedIn API/OAuth integration has a natural
 * place to plug in without changing the builder's UX.
 */
export const LINKEDIN_URL_NOTICE =
  "LinkedIn restricts automated access to public profiles, so we can't fetch this profile directly from a URL. " +
  "Please export your LinkedIn profile as a PDF (LinkedIn → your profile → \"Resources\" → \"Save to PDF\") and " +
  "upload it here, or paste your profile text instead.";
