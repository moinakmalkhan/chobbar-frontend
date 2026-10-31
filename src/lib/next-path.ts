/** Only allow same-site relative redirects ("/account"), never "//evil.com" or absolute URLs. */
export function safeNext(value: string | null | undefined, fallback = "/account") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value.replace(/^\/(en|ur|ar)(?=\/|$)/, "") || "/";
}
