// Contact address kept base64-encoded so the literal never appears in source or rendered
// HTML (anti-scrape). It is decoded in the browser only — bots that read raw HTML see nothing.
export const EMAIL_ENC = "dGhvbWFzQGJ0Y2FscGhhLmNvbS5hdQ==";

export function decodeEmail(): string {
  try {
    return typeof atob !== "undefined" ? atob(EMAIL_ENC) : "";
  } catch {
    return "";
  }
}
